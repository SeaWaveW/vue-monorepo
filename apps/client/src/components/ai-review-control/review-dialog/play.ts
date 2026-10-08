import {
	readRestDoneCount,
	readRestTotal,
	readReviewProgress,
} from '../review-roll.vue'

/** 前缀 / 后缀固定项每一条都播这么久 */
const FIXED_ITEM_SECONDS = 2
/** 详情已不是审核中时，剩余每一项都按这 1 秒走完 */
const RUSH_ITEM_SECONDS = 1
/** 时长算成 0 时仍给一帧，避免立刻把列表刷完看不到 */
const MIN_STEP_MS = 16

export interface ReviewPlayItem {
	key: string
	name: string
	isFixed: boolean
	/** 前固定项：不显示百分比 */
	isPrefix: boolean
}

interface PlayChecklist {
	id?: number
	name: string
}

interface PlayAgent {
	aiReviewDuration?: number
	aiReviewChecklists?: PlayChecklist[]
}

const pushFixedItems = (
	list: ReviewPlayItem[],
	names: string[],
	prefix: string,
	isPrefix: boolean,
) => {
	for (let index = 0; index < names.length; index += 1) {
		list.push({
			key: `${prefix}-${index}`,
			name: names[index],
			isFixed: true,
			isPrefix,
		})
	}
}

/** 前缀、清单、后缀拼成一条播报；清单项才参与百分比 */
export const buildReviewPlayList = (
	prefix: string[],
	suffix: string[],
	checklists: PlayChecklist[],
) => {
	const list: ReviewPlayItem[] = []
	pushFixedItems(list, prefix, 'prefix', true)
	for (let index = 0; index < checklists.length; index += 1) {
		const item = checklists[index]
		list.push({
			key: `rest-${item.id ?? index}`,
			name: item.name,
			isFixed: false,
			isPrefix: false,
		})
	}
	pushFixedItems(list, suffix, 'suffix', false)
	return list
}

/** 弹窗里的播报：清单、进度条、当前项。节拍跟 rAF 走，后台页停住，回来按结束时间补上 */
export const useReviewPlay = () => {
	const { t } = useI18n()
	const prefixNames = computed(() => {
		return [
			t('control_review_process_prefix_1'),
			t('control_review_process_prefix_2'),
			t('control_review_process_prefix_3'),
			t('control_review_process_prefix_4'),
			t('control_review_process_prefix_5'),
		]
	})
	const suffixNames = computed(() => {
		return [
			t('control_review_process_suffix_1'),
			t('control_review_process_suffix_2'),
			t('control_review_process_suffix_3'),
			t('control_review_process_suffix_4'),
			t('control_review_process_suffix_5'),
		]
	})

	const playList = ref<ReviewPlayItem[]>([])
	const totalSeconds = ref(0)
	const currentIndex = ref(-1)
	/** 条的目标宽度，只在换拍时改，过渡交给 CSS，避免每帧重绘 SacoProgress */
	const progressBarPercent = ref(0)
	const barDurationSec = ref(0)
	/** 百分比数字，只在整数变化时写入，不跟条抢每帧更新 */
	const progressPercentText = ref(0)
	const rushing = ref(false)
	/** 当前插到哪，加速时接着这个值走，不跟条的目标值 */
	let progressNow = 0
	let playRaf = 0
	/** 每次 open / 清掉都加一，过期的 rAF 不能再往下播 */
	let playToken = 0
	/** 详情已不是审核中；播完才能关窗进结果 */
	let createSucceeded = false
	let playFinished = false
	let onFinished: (() => void) | undefined

	const fixedCount = computed(() => {
		let count = 0
		for (const item of playList.value) {
			if (!item.isFixed) {
				continue
			}
			count += 1
		}
		return count
	})

	const restTotal = computed(() => {
		return readRestTotal(playList.value)
	})

	const restDoneCount = computed(() => {
		return readRestDoneCount(playList.value, currentIndex.value)
	})

	/** 前固定项不显示百分比；后固定项仍显示（按中间项算满） */
	const showProgressPercent = computed(() => {
		const item = playList.value[currentIndex.value]
		if (!item) {
			return false
		}
		return !item.isPrefix
	})

	/**
	 * 普通节奏：前缀 / 后缀每条固定 2 秒，中间清单均分总时长扣掉固定段后的剩余。
	 */
	const readNormalDuration = (item: ReviewPlayItem) => {
		if (item.isFixed) {
			return FIXED_ITEM_SECONDS
		}
		const restCount = playList.value.length - fixedCount.value
		if (restCount <= 0) {
			return 0
		}
		const fixedPool = fixedCount.value * FIXED_ITEM_SECONDS
		const restPool = Math.max(totalSeconds.value - fixedPool, 0)
		return restPool / restCount
	}

	const readItemDuration = (index: number) => {
		const item = playList.value[index]
		if (!item) {
			return 0
		}
		if (rushing.value) {
			return RUSH_ITEM_SECONDS
		}
		return readNormalDuration(item)
	}

	const rollDuration = computed(() => {
		if (currentIndex.value < 0) {
			return 0
		}
		return readItemDuration(currentIndex.value)
	})

	const clearPlayRaf = () => {
		if (!playRaf) {
			return
		}
		cancelAnimationFrame(playRaf)
		playRaf = 0
	}

	/** 停掉当前这段，后面的 rAF 全部作废 */
	const invalidate = () => {
		playToken += 1
		clearPlayRaf()
	}

	/** 先钉到当前视觉位置再按时长走到目标，加速中途改拍时条不会从旧目标接着跑 */
	const applyBar = (
		from: number,
		target: number,
		durationSec: number,
		token: number,
	) => {
		barDurationSec.value = 0
		progressBarPercent.value = from
		nextTick(() => {
			if (token !== playToken) {
				return
			}
			barDurationSec.value = durationSec
			progressBarPercent.value = target
		})
	}

	const finishPlay = () => {
		playFinished = true
		if (!createSucceeded) {
			return
		}
		onFinished?.()
	}

	const playFrom = (index: number) => {
		const token = playToken
		const list = playList.value
		if (index >= list.length) {
			finishPlay()
			return
		}
		const duration = readItemDuration(index)
		currentIndex.value = index
		const from = progressNow
		const target = readReviewProgress(list, index)
		const isLast = index === list.length - 1
		// 到了最后一项接口还没回：本拍仍按时长插完，不要再切走
		if (isLast && !createSucceeded) {
			playFinished = true
		}
		const waitMs = Math.max(duration * 1000, MIN_STEP_MS)
		applyBar(from, target, waitMs / 1000, token)
		const startAt = performance.now()
		const endAt = startAt + waitMs
		const tick = (now: number) => {
			// 节拍跟渲染帧走，后台页 rAF 会停，回来按 endAt 一次补上
			if (token !== playToken) {
				return
			}
			const ratio = Math.min((now - startAt) / waitMs, 1)
			const value = from + (target - from) * ratio
			progressNow = value
			const text = Math.round(value)
			if (progressPercentText.value !== text) {
				progressPercentText.value = text
			}
			if (now < endAt) {
				playRaf = requestAnimationFrame(tick)
				return
			}
			progressNow = target
			progressPercentText.value = Math.round(target)
			playRaf = 0
			if (isLast && !createSucceeded) {
				return
			}
			playFrom(index + 1)
		}
		playRaf = requestAnimationFrame(tick)
	}

	const reset = () => {
		invalidate()
		playList.value = []
		totalSeconds.value = 0
		currentIndex.value = -1
		progressBarPercent.value = 0
		barDurationSec.value = 0
		progressPercentText.value = 0
		progressNow = 0
		rushing.value = false
		createSucceeded = false
		playFinished = false
	}

	/** 打开弹窗后从第一项播。总时长用预计耗时（秒），不取 Agent 默认审核时长 */
	const begin = (agent: PlayAgent | undefined, expectedSeconds = 0) => {
		const token = playToken
		playList.value = buildReviewPlayList(
			prefixNames.value,
			suffixNames.value,
			agent?.aiReviewChecklists ?? [],
		)
		totalSeconds.value = expectedSeconds
		nextTick(() => {
			if (token !== playToken) {
				return
			}
			playFrom(0)
		})
	}

	/** 详情已结束：从当前项起，剩余每项 1 秒走完。返回值是播报是否已经走完 */
	const noteReviewEnded = () => {
		createSucceeded = true
		return playFinished
	}

	/** 详情已结束：从当前项起，剩余每项 1 秒走完 */
	const startRush = () => {
		const list = playList.value
		let startIndex = currentIndex.value
		if (startIndex < 0) {
			startIndex = 0
		}
		if (startIndex >= list.length) {
			finishPlay()
			return
		}
		invalidate()
		rushing.value = true
		playFrom(startIndex)
	}

	const setFinishedHandler = (handler: () => void) => {
		onFinished = handler
	}

	return {
		playList,
		totalSeconds,
		currentIndex,
		progressBarPercent,
		barDurationSec,
		progressPercentText,
		restTotal,
		restDoneCount,
		showProgressPercent,
		rollDuration,
		begin,
		invalidate,
		reset,
		noteReviewEnded,
		startRush,
		setFinishedHandler,
	}
}
