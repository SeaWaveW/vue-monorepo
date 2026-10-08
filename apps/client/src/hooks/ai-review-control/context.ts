import type { InjectionKey } from 'vue'
import type { AiReviewControlContext } from './types'

export type { AiReviewControlContext } from './types'

/** 工作台子组件 inject 用：`{ task, agent, dynamic, data }` */
export const AI_REVIEW_CONTROL_KEY: InjectionKey<AiReviewControlContext> =
	Symbol('aiReviewControl')

/** `` `${任务 uniqueId}_${agentId}` ``，与 formKeys、dataMap 桶键同规则 */
export const dataKey = (taskUniqueId: string, agentId: number) => {
	return `${taskUniqueId}_${agentId}`
}

/** uploadMap 键：`` `${formKeys}_${uniqueId}` `` */
export const readUploadMapKey = (formKeys: string, uniqueId: number) => {
	return `${formKeys}_${uniqueId}`
}

/** formKeys 拆 taskId + agentId；格式不对返回 null */
export const readFormKeysParts = (formKeys: string) => {
	const last = formKeys.lastIndexOf('_')
	if (last <= 0) return null
	const agentId = Number(formKeys.slice(last + 1))
	const taskId = formKeys.slice(0, last)
	if (!taskId || !agentId) return null
	return { taskId, agentId }
}
