import type { ComponentItem } from '#/dynamic'
import type { useAgent } from './agent'
import type { useData } from './data'
import type { useDynamic } from './dynamic'
import type { useTask } from './task'

/** 列表行字段原样用；只有 uniqueId 是本地草稿自己的 */
export interface TaskItem extends Omit<ReviewRecordPageRecord, 'id'> {
	/** 本地草稿才有；后端回包只有 id */
	uniqueId?: string
	/** 服务端任务号；空任务没有 */
	id?: number
}

export interface AgentFormData {
	[uniqueId: string]: Record<string, any>
}

/** make 写回 Pinia：删草稿 / 写桶共用 */
export interface AiReviewTaskDataSlice {
	taskList: TaskItem[]
	dataMap: Record<string, AgentFormData>
	taskId: string
}

/** my-page 合并后写回分页 + 列表 */
export interface AiReviewTaskListPageSlice {
	taskList: TaskItem[]
	taskPageNum: number
	taskTotal: number
}

/** 授权行 + 详情。components 空着表示详情还没拉回来 */
export interface AiReviewAgentItem extends ReviewAgentPageRecord {
	components: ComponentItem[]
	proportion: number
	aiReviewChecklists: ReviewAgentChecklistRecord[]
	manualReviewChecklists: ReviewAgentChecklistRecord[]
}

/** inject 下发；实现仍在各 hook，这里只收形状 */
export interface AiReviewControlContext {
	task: ReturnType<typeof useTask>
	agent: ReturnType<typeof useAgent>
	dynamic: ReturnType<typeof useDynamic>
	data: ReturnType<typeof useData>
}

/** agent 模块只依赖 task 选中的 id，不接收整个 task 对象 */
export interface UseAgentInput {
	taskId: ComputedRef<string>
	agentId: ComputedRef<number>
}

/** dynamic 只依赖 agent 输出的 formKeys 与 currentAgent */
export interface UseDynamicInput {
	formKeys: ComputedRef<string>
	currentAgent: ComputedRef<
		| {
				components: ComponentItem[]
				proportion: number
		  }
		| undefined
	>
}

/** data 只拿 formKeys / 当前 Agent 行 + dynamic 对外 API，不要整包 agent */
export interface UseDataInput {
	formKeys: ComputedRef<string>
	currentAgent: ComputedRef<
		| {
				name?: string
				skillId: number
		  }
		| undefined
	>
	dynamic: ReturnType<typeof useDynamic>
}

/** 批量映射后按 uniqueId 聚合待上传文件 */
export interface MatchedUploadGroup {
	uniqueId: number
	files: File[]
	component: ComponentItem
}

/** 映射 API 一行：文件名 ↔ 表单项 */
export interface MatchedUploadRow<
	T extends { name?: string } = { name?: string },
> {
	file: T
	component: ComponentItem
}

/** 审核工作台上传 params / emit 第二参；common 侧 `DynamicUploadSingle<P>` 的 `P` */
export interface AiReviewUploadSessionParams {
	formKeys?: string
	uniqueId?: number
}
