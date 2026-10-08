<template>
	<SacoDialog
		v-model="modelValue"
		:title="t('control_ai_reviewing')"
		align-center
		append-to-body
		:close-on-click-modal="false"
		:close-on-press-escape="false"
		:show-close="false"
		custom-class="review-progress-dialog"
		modal-class="review-progress-dialog-mask"
		width="55%"
	>
		<div class="review-container">
			<img :src="logo" :alt="t('control_logo_title')" />
			<h2>{{ t('control_ai_reviewing') }}</h2>
			<p class="review-container__estimate">
				{{ countParts[0] }}
				<strong>{{ reviewDurationFormatter(expectedSeconds) }}</strong>
				{{ countParts[1] }}
				<strong>{{ reviewDurationFormatter(maxSeconds) }}</strong>
				{{ countParts[2] }}
			</p>
			<div class="progress-box">
				<div class="progress-title">
					<div>
						{{ t('review_skill') }}
						<SacoText type="primary">{{ restDoneCount }}</SacoText>
						{{ t('control_review_count', ['', restTotal]) }}
					</div>
					<SacoText v-if="showProgressPercent" type="primary">
						{{ progressPercentText }}%
					</SacoText>
				</div>
				<SacoProgress
					class="review-dialog__bar"
					:percentage="progressBarPercent"
					:show-text="false"
					:stroke-width="13"
					:style="{ '--bar-duration': `${barDurationSec}s` }"
				/>
			</div>
			<div class="review-container__roll">
				<ReviewRoll
					:list="playList"
					:current-index="currentIndex"
					:duration="rollDuration"
				/>
				<SacoButton type="primary" @click="onCollapseToTaskbar">
					{{ t('collapse_to_taskbar') }}
				</SacoButton>
			</div>
		</div>
	</SacoDialog>
</template>
<script lang="ts" setup name="ReviewDialog">
import logo from '#/assets/img/logo.png'
import { reviewDurationFormatter } from '#/utils/formatter'
import { findAgent } from '@/hooks/ai-review-control/agent'
import {
	AI_REVIEW_CONTROL_KEY,
	type AiReviewControlContext,
} from '@/hooks/ai-review-control/context'
import ReviewRoll from '../review-roll.vue'
import { useReviewCollapse } from './collapse'
import { useReviewDetail } from './detail'
import { useReviewPlay } from './play'

const emits = defineEmits<{
	/** 第二参：详情已结束且弹窗还开着才跳详情 */
	complete: [id: number, openDetail?: boolean]
}>()
const props = defineProps<{
	data?: ReviewRecordCreateData
	/** 点开始时钉住的任务 / Agent，创建成功盖回那条草稿 */
	taskId: string
	agentId: number
}>()
const modelValue = defineModel<boolean>('modelValue', {
	default: false,
})
const { t } = useI18n()
const { task } = inject(AI_REVIEW_CONTROL_KEY) as AiReviewControlContext

/** 点了收起：关窗并停掉详情轮询。侧栏轮询等收起结束或审核完成再开 */
let collapsed = false

/** 预计耗时请求序号。关窗再开时，上一笔回来不能再把进度条播起来 */
let durationSession = 0
const expectedSeconds = ref<number>()
const maxSeconds = ref<number>()

const {
	playList,
	currentIndex,
	progressBarPercent,
	barDurationSec,
	progressPercentText,
	restTotal,
	restDoneCount,
	showProgressPercent,
	rollDuration,
	begin: beginPlay,
	invalidate: invalidatePlay,
	reset: resetPlay,
	noteReviewEnded,
	startRush,
	setFinishedHandler,
} = useReviewPlay()

/** 文案是 {0}{1}{2}，列表按下标对上。两段时长单独加粗，换行后是离开页面的说明 */
const countParts = computed(() => {
	return t('control_execute_count', [
		restTotal.value,
		'\uE000',
		'\uE001',
	]).split(/[\uE000\uE001]/)
})

const detail = useReviewDetail({
	isOpen: () => !!modelValue.value,
	isCollapsed: () => collapsed,
	onReviewEnded: () => {
		onReviewEnded()
	},
})

const collapse = useReviewCollapse({
	getTaskId: () => props.taskId,
	getRecordId: () => detail.getRecordId(),
	isOpen: () => !!modelValue.value,
	onStart: () => {
		collapsed = true
		detail.clear()
		invalidatePlay()
		task.setTaskListPaintHeld(true)
	},
	onDone: () => {
		modelValue.value = false
		task.setTaskListPaintHeld(false)
		task.startTaskListPoll()
	},
})

/** 关窗或重新打开才清会话；收起不加 session，创建回包仍要落到那条草稿 */
const resetAll = () => {
	detail.bump()
	collapse.clear(true)
	resetPlay()
	collapsed = false
	task.setTaskListPaintHeld(false)
}

const closeAndComplete = (openDetail = true) => {
	const id = detail.getRecordId()
	resetAll()
	modelValue.value = false
	emits('complete', id, openDetail)
	task.startTaskListPoll()
}

const closeAndFail = () => {
	resetAll()
	modelValue.value = false
}

/** 详情已不是审核中：播完就进结果；已经收起则只关窗，不打开详情 */
const onReviewEnded = () => {
	const playFinished = noteReviewEnded()
	if (collapsed || !modelValue.value) {
		closeAndComplete(false)
		return
	}
	if (playFinished) {
		closeAndComplete()
		return
	}
	startRush()
}

setFinishedHandler(() => {
	closeAndComplete()
})

const startReview = () => {
	resetAll()
	const sessionId = durationSession + 1
	durationSession = sessionId
	expectedSeconds.value = undefined
	maxSeconds.value = undefined
	const session = detail.getSessionId()
	const agent = findAgent(props.agentId)
	reviewRecordDurationStatistics(props.agentId)
		.then((res) => {
			if (sessionId !== durationSession) {
				return
			}
			const detailData = res.data
			if (!detailData) {
				return
			}
			expectedSeconds.value = detailData.averageReviewDuration
			maxSeconds.value = detailData.maxReviewDuration
		})
		.catch(() => {})
		.finally(() => {
			if (sessionId !== durationSession) {
				return
			}
			if (collapsed || !modelValue.value) {
				return
			}
			beginPlay(
				agent,
				expectedSeconds.value ?? agent?.aiReviewDuration ?? 0,
			)
		})
	const requestData = props.data
	if (!requestData) {
		return
	}
	detail.create(requestData, {
		onCreated: () => {
			task.createTaskSuccessCallback(
				props.taskId,
				!collapsed && !!modelValue.value,
			)
			if (collapsed || !modelValue.value) {
				return
			}
			detail.schedule(session)
		},
		onFail: () => {
			closeAndFail()
		},
	})
}

const onCollapseToTaskbar = () => {
	collapse.start()
}

watch(
	modelValue,
	(visible) => {
		if (!visible) {
			if (collapsed) {
				invalidatePlay()
				return
			}
			resetAll()
			return
		}
		startReview()
	},
	{ immediate: true },
)

onUnmounted(() => {
	resetAll()
})
</script>
<style scoped lang="scss">
.review-container {
	display: flex;
	flex: 1;
	flex-direction: column;
	gap: calc(var(--common-gap) / 2);
	align-items: center;
	min-height: 0;
	text-align: center;

	img {
		width: 220px;
		height: auto;
		object-fit: contain;
	}

	h2 {
		font-size: 20px;
		font-weight: normal;
		color: var(--black-color);
	}

	p {
		font-size: 20px;
		color: var(--black-color);
	}

	.review-container__estimate {
		white-space: pre-line;

		strong {
			font-weight: var(--font-bold);
		}
	}

	.progress-box {
		width: 100%;
		margin-top: calc(var(--common-gap) * 3.6);

		.progress-title {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: calc(var(--common-gap) * 0.8);
			font-size: 20px;
			font-weight: var(--font-bold);
			color: var(--black-color);

			:deep(.saco-text) {
				margin-left: var(--common-gap);
				font-size: 20px;
				font-weight: var(--font-bold);
			}
		}

		:deep(.saco-progress) {
			.saco-progress__bar-outer {
				background-color: var(--grey-color-7);
			}

			.saco-progress__bar-inner {
				transition: width var(--bar-duration, 0s) linear !important;
			}
		}
	}

	.review-container__roll {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		width: 100%;
		margin-top: calc(var(--common-gap) * 2);

		.review-roll {
			flex: 1;
			width: auto;
			min-width: 0;
		}

		.saco-button {
			flex-shrink: 0;
			margin-left: calc(var(--common-gap) * 2);
		}
	}
}
</style>
<style lang="scss">
.review-progress-dialog-mask {
	backdrop-filter: blur(10px);
}

.saco-overlay.review-progress-dialog-mask.is-collapsing {
	overflow: hidden;
	transition: none;

	.review-progress-dialog {
		&,
		* {
			transition: none !important;
			animation: none !important;
		}

		&::before,
		&::after,
		*::before,
		*::after {
			content: none !important;
			box-shadow: none !important;
		}
	}
}

.review-progress-dialog {
	display: flex;
	flex-direction: column;
	width: 60.05%;
	height: auto;
	min-height: 453px;
	overflow: visible;
	border-radius: 10px !important;
	box-shadow: none !important;

	&.is-cone-slice {
		position: absolute;
		transform-origin: 0 0;

		&::before {
			animation: none;
		}
	}

	.saco-dialog__header {
		display: none;
	}

	.saco-dialog__body {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-height: 0;
		padding: calc(var(--common-gap) * 4) calc(var(--common-gap) * 7.2)
			calc(var(--common-gap) * 6.3);
		overflow: hidden;
	}

	$base-radius: 20px;
	$base-diffuse: 2px;

	&::before {
		position: absolute;
		inset: $base-radius;
		z-index: -1;
		pointer-events: none;
		content: '';
		border-radius: inherit;
		box-shadow: 0 0 $base-radius $base-diffuse var(--primary-color);
		animation: review-shadow-pulse 2s ease-in-out infinite;
	}

	@at-root {
		@keyframes review-shadow-pulse {
			50% {
				box-shadow: 0 0 #{$base-radius * 5.5} #{$base-diffuse * 3}
					var(--primary-color);
			}
		}
	}
}

.review-collapse-cone {
	position: fixed;
	inset: 0;
	pointer-events: none;

	.review-collapse-cone__slice {
		position: absolute;
		top: 0;
		left: 0;
		overflow: hidden;
		transform-origin: 0 0;
		will-change: transform;
	}

	.is-cone-slice {
		border-radius: 0 !important;

		// * 配不到 ::before / ::after。扫光停动画后白条还留在文字上，伪元素直接拿掉
		&,
		* {
			transition: none !important;
			animation: none !important;
		}

		&::before,
		&::after,
		*::before,
		*::after {
			content: none !important;
			box-shadow: none !important;
		}
	}
}

html[data-device-type='h5'],
html[data-device-type='app'] {
	.review-progress-dialog:not(.is-cone-slice) {
		width: min(60.05%, calc(100vw - var(--common-gap) * 4));
		min-height: min(453px, calc(100dvh - var(--common-gap) * 4));
		max-height: calc(100dvh - var(--common-gap) * 4);
	}

	.saco-overlay.review-progress-dialog-mask.is-collapsing {
		backdrop-filter: none;
	}

	.review-collapse-cone.is-touch {
		.review-collapse-cone__slice {
			overflow: visible;

			.review-collapse-cone__clip {
				position: relative;
				width: 100%;
				height: 100%;
				overflow: hidden;
			}
		}
	}
}
</style>
