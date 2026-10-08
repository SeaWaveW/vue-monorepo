import { deleteBox } from '#/utils/message'
import { reviewDurationFormatter } from '#/utils/formatter'
import { h } from 'vue'
import type { TaskItem } from './types'

/** 侧栏任务滚到底每次追加一页 */
const TASK_LIST_PAGE_SIZE = 10
/** 侧栏有「审核中」时每 10s 整表重拉 */
const TASK_LIST_REFRESH_INTERVAL = 10000

/** 侧栏 my-page 请求中；模块内防连打 */
let taskListLoading = false
/** 创建成功后关掉。收起或审核结束再打开，避免弹窗还开着时整表轮询 */
let taskListPollEnabled = true
/** 上一笔还在飞时又要拉列表，记下 pageSize，回来再补一次 */
let queuedPageSize: number | undefined
/** 锥形收起中。回包先排队，收完再改侧栏，避免 Edge 插行把动画卡住 */
let holdTaskListPaint = false
/** 收起期间积下来的列表写入，按到达顺序补 */
const deferredTaskListWork: Array<() => void> = []
/** 轮询锁：有值表示已挂下一拍轮询 */
let pollingTimer: ReturnType<typeof setTimeout> | undefined
/** 审核中提示框的秒表；关掉或再开一个时清掉，避免叠多个 interval */
let reviewingBoxTimer: ReturnType<typeof setInterval> | undefined

/** 当前任务视图 + 侧栏任务增删改查 / 跳转 */
export function useTask() {
	const { t } = useI18n()
	const router = useRouter()
	const store = useAiReviewControlStore()

	/** 服务端任务重命名请求中，防连点 */
	const renameLoading = ref(false)
	/** 聚焦已有草稿时高亮侧栏项 uniqueId */
	const highlightTaskId = ref('')
	/** 同 uniqueId 重复 addTask 时仍触发高亮动画 */
	const highlightEpoch = ref(0)

	/** 当前选中任务 uniqueId */
	const taskId = computed(() => store.taskId)

	/** 侧栏：草稿 + 落库，store getter 拼接 */
	const taskList = computed(() => store.taskList)
	/** 本地草稿，直接读 store */
	const localTaskList = computed(() => store.localTaskList)
	/** 本地草稿第一条 uniqueId */
	const firstTaskId = computed(() => store.localTaskList[0]?.uniqueId ?? '')

	/** 收起时先入队。收完再按顺序执行，创建删草稿和轮询写列表都走这里 */
	const runTaskListWork = (work: () => void) => {
		if (holdTaskListPaint) {
			deferredTaskListWork.push(work)
			return
		}
		work()
	}

	/** 有审核中才挂下一拍。收起期间延后，避免和锥形抢主线程 */
	const armTaskListPoll = () => {
		const hasReviewing = store.taskList.some((item) => {
			return item.reviewStatus === ReviewRecordReviewStatus.Reviewing
		})
		clearTimeout(pollingTimer)
		if (!hasReviewing) {
			return
		}
		pollingTimer = setTimeout(() => {
			getTaskList()
		}, TASK_LIST_REFRESH_INTERVAL)
	}

	/** 拉取任务列表；默认 pageSize 盖住当前已加载落库行，滚到底传入更大值 */
	const getTaskList = (
		pageSize = Math.max(TASK_LIST_PAGE_SIZE, store.serverTaskList.length),
	) => {
		if (taskListLoading) {
			queuedPageSize = pageSize
			return
		}
		const store = useAiReviewControlStore()
		clearTimeout(pollingTimer)
		const pageNum = 1
		taskListLoading = true
		return reviewRecordMyPage({ pageNum, pageSize })
			.then((res) => {
				const records = res.data?.records
				if (!records) return
				const nextPageNum = res.data?.pageNum ?? pageNum
				const nextTotal = res.data?.total ?? 0
				runTaskListWork(() => {
					store.taskPageNum = nextPageNum
					store.taskTotal = nextTotal
					store.serverTaskList = records
					const hasSelectedTask = store.taskList.some((row) => {
						return row.uniqueId === store.taskId
					})
					if (store.taskId && !hasSelectedTask) {
						store.taskId = store.localTaskList[0]?.uniqueId ?? ''
					}
				})
			})
			.finally(() => {
				taskListLoading = false
				if (queuedPageSize !== undefined) {
					const pageSize = queuedPageSize
					queuedPageSize = undefined
					getTaskList(pageSize)
					return
				}
				if (!taskListPollEnabled) {
					return
				}
				runTaskListWork(armTaskListPoll)
			})
	}

	/** uniqueId → taskList 下标，O(1) 找当前行 */
	const taskIndexMap = computed(() => {
		return store.taskList.reduce<Record<string, number>>(
			(map, item, index) => {
				if (item.uniqueId) map[item.uniqueId] = index
				return map
			},
			{},
		)
	})

	/** 当前任务行；set 按拼接下标写回 local / server（getter 不能赋值） */
	const currentTask = computed({
		get: () => taskList.value[taskIndexMap.value[taskId.value]],
		set: (value) => {
			if (!taskId.value || !value) return
			const index = taskIndexMap.value[taskId.value]
			if (index === undefined) return
			const localCount = store.localTaskList.length
			if (index < localCount) {
				store.localTaskList[index] = value
				return
			}
			store.serverTaskList[index - localCount] = value
		},
	})

	/** 当前任务 reviewAgentId；页签 / useAgent 共用这一处读写 */
	const agentId = computed({
		get: () => currentTask.value?.reviewAgentId ?? 0,
		set: (value: number) => {
			if (!currentTask.value) return
			currentTask.value = {
				...currentTask.value,
				reviewAgentId: value,
			}
		},
	})

	/**
	 * 审核中提示：一打开就拉时长统计。
	 * 预计、最长用返回的平均时长和最长时长（秒）。
	 * 已执行先用详情里的服务器当前时间减去任务创建时间，之后每秒加 1。
	 */
	const openReviewingTaskBox = (item: TaskItem) => {
		const expectedSeconds = ref<number>()
		const maxSeconds = ref<number>()
		const elapsedSeconds = ref(0)
		clearInterval(reviewingBoxTimer)
		let timer: ReturnType<typeof setInterval> | undefined
		let alive = true
		const beginTick = () => {
			if (!alive) {
				return
			}
			clearInterval(reviewingBoxTimer)
			timer = setInterval(() => {
				elapsedSeconds.value += 1
			}, 1000)
			reviewingBoxTimer = timer
		}
		if (item.id) {
			reviewRecordDetail(item.id)
				.then((res) => {
					const currentTimestamp = res.data?.currentTimestamp
					const createTime = item.createTime
					if (currentTimestamp && createTime) {
						elapsedSeconds.value = Math.max(
							0,
							Math.floor((currentTimestamp - createTime) / 1000),
						)
					}
					beginTick()
				})
				.catch(() => {
					beginTick()
				})
		} else {
			beginTick()
		}
		const agentId = item.reviewAgentId
		if (agentId) {
			reviewRecordDurationStatistics(agentId)
				.then((res) => {
					const detail = res.data
					if (!detail) {
						return
					}
					expectedSeconds.value = detail.averageReviewDuration
					maxSeconds.value = detail.maxReviewDuration
				})
				.catch(() => {})
		}
		const message = () => {
			const expected = reviewDurationFormatter(expectedSeconds.value)
			const longest = reviewDurationFormatter(maxSeconds.value)
			const elapsed = reviewDurationFormatter(elapsedSeconds.value)
			const marked = t('review_afoot_message', [
				'\uE000',
				'\uE001',
				'\uE002',
			])
			const [lead, between, beforeElapsed, tail] =
				marked.split(/[\uE000\uE001\uE002]/)
			return h('div', { class: 'review-afoot-message' }, [
				lead,
				h('strong', expected),
				between,
				h('strong', longest),
				beforeElapsed,
				h('strong', elapsed),
				tail,
			])
		}
		SacoMessageBox({
			title: t('review_afoot_title'),
			message,
			showCancelButton: false,
			closeOnClickModal: false,
			closeOnPressEscape: true,
			showClose: false,
			confirmButtonText: t('i_see'),
			customClass: 'review-afoot-message-box',
		})
			.catch(() => {})
			.finally(() => {
				alive = false
				if (reviewingBoxTimer !== timer) {
					return
				}
				clearInterval(timer)
				reviewingBoxTimer = undefined
			})
	}

	/** 侧栏单击：审核中出提示框；已结束的落库行跳详情；无 id 即本地草稿切选中 */
	const onTaskClick = (item: TaskItem) => {
		const isReviewing =
			item.reviewStatus === ReviewRecordReviewStatus.Reviewing
		if (isReviewing) {
			openReviewingTaskBox(item)
			return
		}
		if (item.id) {
			router.push(`/my-ai-review-record-manage/detail/${item.id}`)
		} else {
			store.taskId = item.uniqueId!
		}
	}

	/** 删侧栏本地草稿行；删的是当前选中才改 taskId（创建成功也会走） */
	const deleteLocalDraftRow = (item: TaskItem) => {
		const draftIndex = localTaskList.value.findIndex((citem) => {
			return citem.uniqueId === item.uniqueId
		})
		if (draftIndex < 0) {
			return
		}
		const isCurrent = store.taskId === item.uniqueId
		if (isCurrent && store.localTaskList.length <= 1) {
			store.taskId = ''
		} else if (isCurrent) {
			const nextCheckIndex = draftIndex === 0 ? 1 : draftIndex - 1
			store.taskId = store.localTaskList[nextCheckIndex].uniqueId ?? ''
		}
		store.localTaskList.splice(draftIndex, 1)
	}

	/** 侧栏任务右键菜单：rename / delete */
	const onTaskMenu = (item: TaskItem, command: string | number | object) => {
		if (command === 'rename') {
			if (renameLoading.value) return
			SacoMessageBox.prompt('', t('rename'), {
				customClass: 'rename-message-box',
				inputValue: item.reviewRecordIdentifier ?? '',
				inputPlaceholder: t('task_name'),
				inputValidator: (value) => {
					if (!value?.trim())
						return t('validate_please_enter_any', [t('task_name')])
					return true
				},
				confirmButtonText: t('confirm'),
				cancelButtonText: t('cancel'),
				closeOnClickModal: false,
			})
				.then((res) => {
					const reviewRecordIdentifier = (res.value ?? '')
						.trim()
						.slice(
							0,
							REVIEW_RECORD_REVIEW_RECORD_IDENTIFIER_MAX_LENGTH,
						)
					if (!item.id) {
						item.reviewRecordIdentifier = reviewRecordIdentifier
						SacoMessage.success(t('rename_successfully'))
						return
					}
					renameLoading.value = true
					return reviewRecordRename({
						id: item.id,
						reviewRecordIdentifier,
					}).then(() => {
						item.reviewRecordIdentifier = reviewRecordIdentifier
						SacoMessage.success(t('rename_successfully'))
					})
				})
				.catch(() => {})
				.finally(() => {
					renameLoading.value = false
				})
		} else if (command === 'delete') {
			if (item.id) {
				deleteBox({
					params: item.id,
					api: reviewRecordDelete,
				}).then(() => {
					getTaskList()
				})
			} else {
				deleteLocalDraftRow(item)
			}
		}
	}

	/** 新建或聚焦已有草稿；默认 Agent 等授权列表回来后由 useAgent 写入 */
	const addTask = () => {
		if (firstTaskId.value) {
			document.querySelector('.task-item')?.scrollIntoView({
				behavior: 'smooth',
			})
			store.taskId = firstTaskId.value
			highlightTaskId.value = firstTaskId.value
			highlightEpoch.value += 1
		} else {
			const uniqueId = Math.round(Math.random() * 1000000).toString()
			store.localTaskList.unshift({
				uniqueId,
				reviewRecordIdentifier: t('control_new_task'),
				createTime: Date.now(),
			})
			store.taskId = uniqueId
		}
	}

	/** 跳转「我的审核记录」列表页 */
	const searchMore = () => {
		router.push('/my-ai-review-record-manage')
	}

	/** 侧栏滚到底加载 my-page 下一页 */
	const onListScroll = (event: Event) => {
		const el = event.currentTarget
		if (!(el instanceof HTMLElement)) return
		if (taskListLoading) return
		if (store.serverTaskList.length >= store.taskTotal) return
		if (el.scrollTop + el.clientHeight < el.scrollHeight - 24) return
		getTaskList(store.serverTaskList.length + TASK_LIST_PAGE_SIZE)
	}

	/** 关掉侧栏轮询。创建成功只查一次，不能接着每 10 秒整表重拉 */
	const stopTaskListPoll = () => {
		taskListPollEnabled = false
		clearTimeout(pollingTimer)
		pollingTimer = undefined
	}

	/** 收起或审核结束：重新按审核中每 10 秒拉侧栏 */
	const startTaskListPoll = () => {
		taskListPollEnabled = true
		if (taskListLoading || pollingTimer) {
			return
		}
		getTaskList()
	}

	/**
	 * 创建接口已带回 id：删掉开审时钉住的那条草稿，再查一次侧栏。
	 * 弹窗还开着就停掉轮询；已经收起则留给收起时重新打开的那一轮。
	 */
	const createTaskSuccessCallback = (uniqueId: string, stopPoll = true) => {
		runTaskListWork(() => {
			const draft = store.localTaskList.find((row) => {
				return row.uniqueId === uniqueId
			})
			if (draft) {
				deleteLocalDraftRow(draft)
			}
			if (!firstTaskId.value) {
				addTask()
			}
			if (stopPoll) {
				stopTaskListPoll()
			}
			getTaskList()
		})
	}

	/** 锥形收起时挡住侧栏改 DOM。false 时把排队的删草稿和列表回包补上 */
	const setTaskListPaintHeld = (held: boolean) => {
		holdTaskListPaint = held
		if (held) {
			return
		}
		const queued = deferredTaskListWork.splice(0)
		for (const work of queued) {
			work()
		}
	}

	onMounted(() => {
		if (!localTaskList.value.length) {
			addTask()
		}
		getTaskList()
	})

	onBeforeUnmount(() => {
		setTaskListPaintHeld(false)
		taskListPollEnabled = false
		clearTimeout(pollingTimer)
		pollingTimer = undefined
		clearInterval(reviewingBoxTimer)
		reviewingBoxTimer = undefined
		taskListLoading = false
	})

	return {
		taskId,
		taskList,
		agentId,
		highlightTaskId,
		highlightEpoch,
		localTaskList,
		firstTaskId,
		addTask,
		onTaskClick,
		onTaskMenu,
		searchMore,
		onListScroll,
		createTaskSuccessCallback,
		setTaskListPaintHeld,
		startTaskListPoll,
	}
}
