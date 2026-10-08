import { PROPORTION_DEFAULT_SIZE } from '#/utils/proportion'
import { dataKey, readFormKeysParts } from './context'
import type {
	AgentFormData,
	AiReviewAgentItem,
	AiReviewTaskDataSlice,
	TaskItem,
} from './types'

/** 空 dataMap 桶占位，避免 getSubmitFormData 里散写 `{}` */
export const EMPTY_AGENT_FORM_DATA: AgentFormData = {}

/** 当前任务上的 reviewAgentId；无 taskId 或未命中为 0 */
export const readTaskReviewAgentId = (list: TaskItem[], taskId: string) => {
	if (!taskId) {
		return 0
	}
	return list.find((item) => item.uniqueId === taskId)?.reviewAgentId ?? 0
}

/** 当前任务 + Agent 的 dataMap 桶键；缺任一为 '' */
export const readDataId = (taskId: string, list: TaskItem[]) => {
	if (!taskId) {
		return ''
	}
	const agentId = readTaskReviewAgentId(list, taskId)
	if (!agentId) {
		return ''
	}
	return dataKey(taskId, agentId)
}

/** 授权列表行合并详情；保留 prev 上已拉的 components / 清单 */
export const toAgentItem = (
	row: ReviewAgentPageRecord,
	prev?: AiReviewAgentItem,
): AiReviewAgentItem => {
	return {
		...row,
		components: prev?.components ?? [],
		proportion: prev?.proportion ?? Number(PROPORTION_DEFAULT_SIZE),
		aiReviewChecklists: prev?.aiReviewChecklists ?? [],
		manualReviewChecklists: prev?.manualReviewChecklists ?? [],
	}
}

/** 卸掉详情 schema / 清单，列表行只留授权元数据 */
export const dropAgentPayload = (agent: AiReviewAgentItem) => {
	agent.components = []
	agent.aiReviewChecklists = []
	agent.manualReviewChecklists = []
}

/** 裁掉 taskList 里已不存在的 uniqueId 对应 dataMap 桶；一个都没裁就返回原对象，避免表单跟着刷 */
export const pruneDataMapByTaskList = (
	dataMap: Record<string, AgentFormData>,
	taskList: TaskItem[],
) => {
	const aliveUniqueIds = taskList.reduce((ids, row) => {
		if (row.uniqueId) {
			ids.add(row.uniqueId)
		}
		return ids
	}, new Set<string>())
	let changed = false
	const next = Object.keys(dataMap).reduce<Record<string, AgentFormData>>(
		(bucket, key) => {
			const parts = readFormKeysParts(key)
			if (parts?.taskId && aliveUniqueIds.has(parts.taskId)) {
				bucket[key] = dataMap[key]
			} else {
				changed = true
			}
			return bucket
		},
		{},
	)
	if (!changed) {
		return dataMap
	}
	return next
}

/** 授权 HTTP 列表合并进 agentList，保留已拉详情 */
export const mergeAgentListFromRecords = (
	agentList: AiReviewAgentItem[],
	records: ReviewAgentPageRecord[],
) => {
	const prevById = agentList.reduce<Record<number, AiReviewAgentItem>>(
		(map, item) => {
			if (item.id) {
				map[item.id] = item
			}
			return map
		},
		{},
	)
	return records.reduce<AiReviewAgentItem[]>((list, row) => {
		list.push(toAgentItem(row, prevById[row.id]))
		return list
	}, [])
}

/** 页签拖拽换序后的 agentList */
export const reorderAgentList = (
	agentList: AiReviewAgentItem[],
	fromId: number,
	toId: number,
) => {
	const fromIndex = agentList.findIndex((item) => {
		return item.id === fromId
	})
	const toIndex = agentList.findIndex((item) => {
		return item.id === toId
	})
	if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
		return agentList
	}
	const next = agentList.slice()
	const [moved] = next.splice(fromIndex, 1)
	next.splice(toIndex, 0, moved)
	return next
}

/** 详情 HTTP 写回授权行（原地改 agentList 元素） */
export const applyAgentDetailToItem = (
	agent: AiReviewAgentItem,
	detail: ReviewAgentDetailResponse,
) => {
	Object.assign(agent, toAgentItem(detail, agent), {
		components: detail.dynamicForm?.schemaJson?.components ?? [],
		proportion:
			detail.dynamicForm?.widthLevel ?? Number(PROPORTION_DEFAULT_SIZE),
		aiReviewChecklists: detail.aiReviewChecklists ?? [],
		manualReviewChecklists: detail.manualReviewChecklists ?? [],
	})
}

/** 缺桶时补空对象；已有则原样返回 */
export const ensureDataMapBucket = (
	dataMap: Record<string, AgentFormData>,
	dataId: string,
) => {
	if (!dataId || dataMap[dataId]) {
		return dataMap
	}
	return {
		...dataMap,
		[dataId]: {},
	}
}

/** 写 dataMap[formKeys][uniqueId][fieldKey]；新桶时返回新顶层对象 */
export const writeDataMapField = (
	dataMap: Record<string, AgentFormData>,
	formKeys: string,
	uniqueId: number,
	fieldKey: string,
	value: any,
) => {
	if (!formKeys) {
		return dataMap
	}
	let bucket = dataMap[formKeys]
	let next = dataMap
	if (!bucket) {
		bucket = {}
		next = { ...dataMap, [formKeys]: bucket }
	}
	const prev = bucket[uniqueId]
	if (prev) {
		prev[fieldKey] = value
		return next
	}
	bucket[uniqueId] = {
		[fieldKey]: value,
	}
	return next
}

/** 开始审核提交体；formKeys 缺省用当前 taskId + taskList 推导 */
export const buildReviewRecordCreateData = (
	taskId: string,
	taskList: TaskItem[],
	agentList: AiReviewAgentItem[],
	dataMap: Record<string, AgentFormData>,
	formKeys?: string,
): ReviewRecordCreateData => {
	const key = formKeys ?? readDataId(taskId, taskList)
	const parts = key ? readFormKeysParts(key) : null
	const agentId = parts?.agentId ?? readTaskReviewAgentId(taskList, taskId)
	const agent = agentList.find((item) => item.id === agentId)
	const formData = key
		? (dataMap[key] ?? EMPTY_AGENT_FORM_DATA)
		: EMPTY_AGENT_FORM_DATA
	const componentMetaKeys = ['title', 'type', 'description'] as const
	const inputDataJson = agent
		? agent.components.reduce<DynamicFormInputDataJson>(
				(submitData, component) => {
					const fieldId = component.id
					if (!fieldId) {
						return submitData
					}
					const defaultModel = component.defaultModel ?? {}
					const filled =
						component.uniqueId != null &&
						formData[component.uniqueId]
							? formData[component.uniqueId]
							: {}
					const field = componentMetaKeys.reduce<Record<string, any>>(
						(row, metaKey) => {
							row[metaKey] = component[metaKey] ?? ''
							return row
						},
						{},
					)
					Object.keys(defaultModel).reduce((row, modelKey) => {
						if (
							(componentMetaKeys as readonly string[]).includes(
								modelKey,
							)
						) {
							return row
						}
						row[modelKey] =
							modelKey in filled
								? filled[modelKey]
								: defaultModel[modelKey]
						return row
					}, field)
					submitData[fieldId] = field
					return submitData
				},
				{},
			)
		: {}
	return {
		reviewAgentId: agentId,
		inputDataJson,
	}
}

/** 按 schema defaultModel 补当前任务桶，再写回 dataMap */
export const applySeedFormDefaults = (
	slice: Pick<AiReviewTaskDataSlice, 'dataMap' | 'taskId'>,
	agentId: number,
	agent: AiReviewAgentItem | undefined,
) => {
	const taskId = slice.taskId
	if (!taskId || !agentId || !agent?.components.length) {
		return
	}
	const key = dataKey(taskId, agentId)
	let bucket = slice.dataMap[key]
	let next = slice.dataMap
	if (!bucket) {
		bucket = {}
		next = { ...slice.dataMap, [key]: bucket }
	}
	for (const component of agent.components) {
		const uid = component.uniqueId
		if (uid == null || bucket[uid]) continue
		bucket[uid] = {
			...(component.defaultModel ?? {}),
		}
	}
	slice.dataMap = next
}
