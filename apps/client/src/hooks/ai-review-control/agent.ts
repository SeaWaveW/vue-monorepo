import {
	applyAgentDetailToItem,
	applySeedFormDefaults,
	dropAgentPayload,
	ensureDataMapBucket,
	mergeAgentListFromRecords,
	reorderAgentList,
} from './make'
import { dataKey } from './context'
import type { UseAgentInput } from './types'

/** 同一 Agent 的详情请求复用；卸载整表换新，请求结束仍按 id delete */
let agentDetailPending: Record<
	number,
	Promise<ReviewAgentDetailResponse | undefined>
> = {}

/** 同一 agentId 连点不要连打详情 */
const SET_AGENT_INTERVAL = 5000
/** 上次 ensure 时间；卸载整表换新 */
let lastEnsureAgentAt: Record<number, number> = {}

/** 各 agentId 详情 loading；不进 Pinia。卸载换新 reactive，避免旧表残留 true */
export let agentDetailLoading = reactive<Record<number, boolean>>({})

/** 授权列表 HTTP → 合并进 store.agentList */
export const fetchAgentList = () => {
	const store = useAiReviewControlStore()
	return reviewAgentMyAuthorizedList().then((res) => {
		const records = res.data
		if (!records) return
		store.agentList = mergeAgentListFromRecords(store.agentList, records)
	})
}

/** 本地换序后提交 sort，成败都再拉授权列表 */
export const sortAgentList = (fromId: number, toId: number) => {
	const store = useAiReviewControlStore()
	store.agentList = reorderAgentList(store.agentList, fromId, toId)
	const agentIds = store.agentList.map((item) => item.id)
	return reviewAgentSort({ agentIds }).then(
		() => fetchAgentList(),
		() => fetchAgentList(),
	)
}

/** 拉详情写回 agentList；其它行卸 schema */
export const ensureAgent = (agentId: number) => {
	const store = useAiReviewControlStore()
	if (!agentId) {
		return Promise.resolve()
	}
	const agent = findAgent(agentId)
	const now = Date.now()
	const lastAt = lastEnsureAgentAt[agentId] ?? 0
	if (agent?.components.length && now - lastAt < SET_AGENT_INTERVAL) {
		applySeedFormDefaults(store, agentId, agent)
		return Promise.resolve()
	}
	lastEnsureAgentAt[agentId] = now
	let job = agentDetailPending[agentId]
	if (!job) {
		agentDetailLoading[agentId] = true
		job = reviewAgentDetail(agentId)
			.then((res) => res.data)
			.finally(() => {
				delete agentDetailPending[agentId]
				agentDetailLoading[agentId] = false
			})
		agentDetailPending[agentId] = job
	}
	return job.then((detail) => {
		if (!detail) {
			return
		}
		const current = findAgent(agentId)
		if (current) {
			applyAgentDetailToItem(current, detail)
		}
		store.agentList.reduce((currentId, item) => {
			if (item.id !== currentId) {
				dropAgentPayload(item)
			}
			return currentId
		}, agentId)
		applySeedFormDefaults(store, agentId, current)
	})
}

/** 一屏几条；多于这个才出展开箭头，也是 `--agent-sum` */
export const AGENT_SUM = 4
/** 展开最多露出几行，多的在展开盒里滚；和 `--agent-max-rows` 同一处 */
export const AGENT_MAX_ROWS = 4

/** 授权列表里按 id 取一条；没有或 id 空就是 undefined */
export const findAgent = (agentId: number) => {
	if (!agentId) return undefined
	return useAiReviewControlStore().agentList.find(
		(item) => item.id === agentId,
	)
}

/** 工作台 Agent 页签：拖完换序 + 展开态；选中 id 用 task.agentId，此处只做 TabPaneName 桥接 */
export const useAgentTabs = (agentId: Ref<number>) => {
	const store = useAiReviewControlStore()
	/** 授权数超过 AGENT_SUM 时显示展开箭头 */
	const showExpand = computed(() => store.agentList.length > AGENT_SUM)
	/** 页签网格行数，用于 CSS `--agent-rows` */
	const agentRows = computed(() => {
		const total = store.agentList.length
		if (total <= 0) return 1
		return Math.ceil(total / AGENT_SUM)
	})
	/** 是否展开全部 Agent 页签 */
	const isExpand = ref(false)
	const activeAgentId = computed<TabPaneName | undefined>({
		get: () => agentId.value || undefined,
		set: (name) => {
			if (name === undefined || name === null || name === '') return
			agentId.value = Number(name)
		},
	})
	/** 拖拽页签后调 sort 接口并刷新授权列表 */
	const onAgentTabSort = (from: TabPaneName, to: TabPaneName) => {
		void sortAgentList(Number(from), Number(to))
	}
	return { activeAgentId, onAgentTabSort, showExpand, isExpand, agentRows }
}

/** 授权 Agent 页签、拉列表、详情 ensure；formKeys 与 dataKey 同规则 */
export function useAgent(input: UseAgentInput) {
	const store = useAiReviewControlStore()
	const { taskId, agentId } = input
	const tabs = useAgentTabs(agentId)

	/** 首次 onActivated 跳过，避免与 onMounted 重复拉列表 */
	let skipActivateLoad = true

	/** agentId → agentList 下标，currentAgent get/set 写回列表用 */
	const agentIndexMap = computed(() => {
		return store.agentList.reduce<Record<number, number>>(
			(map, item, index) => {
				if (item.id) map[item.id] = index
				return map
			},
			{},
		)
	})

	/** 当前任务+Agent 的 dataMap 桶键，与 SacoForm :key 一致 */
	const formKeys = computed(() => dataKey(taskId.value, agentId.value))

	/** 当前选中 Agent 行；set 按 agentIndexMap 写回 agentList */
	const currentAgent = computed({
		get: () => {
			const index = agentIndexMap.value[agentId.value]
			if (index === undefined) return undefined
			return store.agentList[index]
		},
		set: (value) => {
			if (!agentId.value || !value) return
			const index = agentIndexMap.value[agentId.value]
			if (index === undefined) return
			store.agentList[index] = value
		},
	})

	/** 当前 agentId 是否在拉详情（表单 v-loading） */
	const detailLoading = computed(() => !!agentDetailLoading[agentId.value])

	/** taskId / agentId / 授权列表变化：补默认 Agent、占 dataMap 桶、拉详情 */
	const syncAgentForTask = () => {
		if (!taskId.value) return
		let id = agentId.value
		if (!id) {
			const firstId = store.agentList[0]?.id
			if (!firstId) return
			const localIndex = store.localTaskList.findIndex((row) => {
				return row.uniqueId === taskId.value
			})
			if (localIndex !== -1) {
				store.localTaskList[localIndex] = {
					...store.localTaskList[localIndex],
					reviewAgentId: firstId,
				}
			} else {
				const serverIndex = store.serverTaskList.findIndex((row) => {
					return row.uniqueId === taskId.value
				})
				if (serverIndex !== -1) {
					store.serverTaskList[serverIndex] = {
						...store.serverTaskList[serverIndex],
						reviewAgentId: firstId,
					}
				}
			}
			id = firstId
		}
		if (agentIndexMap.value[id] === undefined) return
		store.dataMap = ensureDataMapBucket(
			store.dataMap,
			dataKey(taskId.value, id),
		)
		void ensureAgent(id)
	}

	watch([taskId, agentId, () => store.agentList[0]?.id], syncAgentForTask, {
		immediate: true,
	})

	/** 拉授权列表后按当前任务同步 Agent */
	const loadAgentList = () => {
		return fetchAgentList().then(syncAgentForTask)
	}

	onMounted(() => {
		void loadAgentList()
	})

	onActivated(() => {
		if (skipActivateLoad) {
			skipActivateLoad = false
			return
		}
		void loadAgentList()
	})

	onBeforeUnmount(() => {
		agentDetailPending = {}
		lastEnsureAgentAt = {}
		agentDetailLoading = reactive({})
		store.agentList.forEach(dropAgentPayload)
	})

	/** 授权 Agent 列表只读视图 */
	const agentList = computed(() => store.agentList)

	return {
		...tabs,
		agentList,
		formKeys,
		currentAgent,
		detailLoading,
	}
}
