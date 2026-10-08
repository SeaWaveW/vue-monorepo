import type { SearchResponse } from './index'
import type { ReviewAgentDeleteStatus } from '@/api/enum/review-agent/delete-status'
import type { ReviewAgentStatus } from '@/api/enum/review-agent/status'
import type { SkillPlatformType } from '@/api/enum/skill/platform-type'
import type { DynamicFormDetailResponse } from './dynamic-form'

/** 分页查询已授权 Agent（参数；不含 pageNum/pageSize，由 SearchParams / 列表 hook 交叉） */
export interface ReviewAgentPageParams {
	/** Agent 名称，支持模糊查询 */
	name?: string

	/** 租户授权状态：1-可用，2-禁用 */
	status?: ReviewAgentStatus

	/** AI 应用开发平台 */
	platformType?: SkillPlatformType

	/** 简单描述，支持模糊查询 */
	description?: string

	/** 备注，支持模糊查询 */
	remark?: string
}

/** 审核清单项（新增 / 修改入参） */
export interface ReviewAgentChecklistItem {
	/** 项目名称 */
	name: string

	/** 详细说明 */
	detail?: string
}

/** 审核清单项（详情） */
export interface ReviewAgentChecklistRecord {
	/** 清单项 ID */
	id: number

	/** 审核 Agent ID */
	reviewAgentId?: number

	/** 项目名称 */
	name: string

	/** 详细说明 */
	detail?: string

	/** 创建人 ID */
	createUserId?: number

	/** 创建人姓名 */
	createUserName?: string

	/** 创建时间戳，单位：毫秒 */
	createTime?: number

	/** 最后编辑人 ID */
	editUserId?: number

	/** 最后编辑人姓名 */
	editUserName?: string

	/** 最后编辑时间戳，单位：毫秒 */
	editTime?: number

	/** 删除状态：1-未删除，2-已删除 */
	deleteStatus?: ReviewAgentDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}

/** 分页查询已授权 Agent（行） */
export interface ReviewAgentPageRecord {
	/** 审核 Agent ID */
	id: number

	/** Agent 名称 */
	name: string

	/** 租户自行决定是否使用状态：1-可用，2-禁用 */
	status?: ReviewAgentStatus

	/** 本人 Agent 展示序号，升序排列 */
	serial?: number

	/** AI 应用开发平台 */
	platformType?: SkillPlatformType

	/** Skill ID */
	skillId: number

	/** Skill 名称 */
	skillName?: string

	/** AI 审核时长，单位：秒 */
	aiReviewDuration: number

	/** 人工审核时长，单位：秒 */
	manualReviewDuration: number

	/** 动态表单 ID */
	dynamicFormId: number

	/** 动态表单名称 */
	dynamicFormName?: string

	/** 简单描述 */
	description: string

	/** 备注 */
	remark?: string

	/** 创建人 ID */
	createUserId?: number

	/** 创建人姓名 */
	createUserName?: string

	/** 创建时间戳，单位：毫秒 */
	createTime?: number

	/** 最后编辑人 ID */
	editUserId?: number

	/** 最后编辑人姓名 */
	editUserName?: string

	/** 最后编辑时间戳，单位：毫秒 */
	editTime?: number

	/** 删除状态：1-未删除，2-已删除 */
	deleteStatus?: ReviewAgentDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}

/** 分页查询已授权 Agent（响应） */
export type ReviewAgentPageResponse = SearchResponse<ReviewAgentPageRecord>

/** 新增审核 Agent（参数） */
export interface ReviewAgentCreateData {
	/** Agent 名称 */
	name: string

	/** Skill ID */
	skillId: number

	/** 动态表单 ID */
	dynamicFormId: number

	/** 简单描述 */
	description: string

	/** AI 审核时长，单位：秒 */
	aiReviewDuration: number

	/** 人工审核时长，单位：秒 */
	manualReviewDuration: number

	/** 备注 */
	remark?: string

	/** AI 审核清单 */
	aiReviewChecklists: ReviewAgentChecklistItem[]

	/** 人工补充审核清单 */
	manualReviewChecklists: ReviewAgentChecklistItem[]
}

/** 修改审核 Agent（参数） */
export interface ReviewAgentUpdateData {
	/** 审核 Agent ID */
	id: number

	/** Agent 名称 */
	name: string

	/** Skill ID */
	skillId: number

	/** 动态表单 ID */
	dynamicFormId: number

	/** 简单描述 */
	description: string

	/** AI 审核时长，单位：秒 */
	aiReviewDuration: number

	/** 人工审核时长，单位：秒 */
	manualReviewDuration: number

	/** 备注 */
	remark?: string

	/** AI 审核清单 */
	aiReviewChecklists: ReviewAgentChecklistItem[]

	/** 人工补充审核清单 */
	manualReviewChecklists: ReviewAgentChecklistItem[]
}

/** 根据 ID 修改审核 Agent 备注（参数） */
export interface ReviewAgentUpdateRemarkData {
	/** 审核 Agent ID */
	id: number

	/** 备注，未传、null 或空白字符串时置为数据库 NULL */
	remark?: string
}

/** 修改 Agent 状态（参数） */
export interface ReviewAgentUpdateStatusData {
	/** 审核 Agent ID */
	id: number

	/** 租户授权状态：1-可用，2-禁用 */
	status: ReviewAgentStatus
}

/** 查询已授权 Agent 详情（响应） */
export interface ReviewAgentDetailResponse extends ReviewAgentPageRecord {
	/** AI 审核清单 */
	aiReviewChecklists?: ReviewAgentChecklistRecord[]

	/** 协同补充审核清单 */
	manualReviewChecklists?: ReviewAgentChecklistRecord[]

	/** 动态表单详情，用于表单预览 */
	dynamicForm?: DynamicFormDetailResponse
}

/** 查询本人已授权 Agent（响应） */
export type ReviewAgentMyAuthorizedListResponse = ReviewAgentPageRecord[]

/** 本人已授权 Agent 排序（参数） */
export interface ReviewAgentSortData {
	/** 本人全部可用且已授权的 Agent ID，按展示顺序提交，不可重复或遗漏；按集合顺序从 1 开始保存序号，仅无可用 Agent 时可传空集合 */
	agentIds: number[]
}
