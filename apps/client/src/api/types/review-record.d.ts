import type { SearchResponse } from './index'
import type { ReviewRecordDeleteStatus } from '@/api/enum/review-record/delete-status'
import type { ReviewRecordReviewStatus } from '@/api/enum/review-record/review-status'
import type {
	DynamicFormDetailResponse,
	DynamicFormDataRecord,
	DynamicFormInputDataJson,
} from './dynamic-form'

/** 分页查询租户审核记录（参数；不含 pageNum/pageSize，由 SearchParams / 列表 hook 交叉） */
export interface ReviewRecordPageParams {
	/** 审核记录标识，支持模糊查询 */
	reviewRecordIdentifier?: string

	/** 审核状态：1-审核中，2-成功，3-失败 */
	reviewStatus?: ReviewRecordReviewStatus

	/** 用户名，支持模糊查询 */
	username?: string
}

/** 分页查询本人审核记录（参数；不含 pageNum/pageSize，由 SearchParams / 列表 hook 交叉） */
export interface ReviewRecordMyPageParams {
	/** 审核记录标识，支持模糊查询 */
	reviewRecordIdentifier?: string

	/** 审核状态：1-审核中，2-成功，3-失败 */
	reviewStatus?: ReviewRecordReviewStatus

	/** 用户名，支持模糊查询 */
	username?: string
}

/** 分页查询租户审核记录（行） */
export interface ReviewRecordPageRecord {
	/** 审核记录 ID */
	id: number

	/** 动态表单数据 ID */
	dynamicFormDataId?: number

	/** 审核 Agent ID */
	reviewAgentId?: number

	/** 审核记录标识 */
	reviewRecordIdentifier?: string

	/** 审核结果 */
	reviewResult?: string

	/** 未达预期反馈 */
	unmetExpectationFeedback?: string

	/** 输入 Token 量 */
	inputTokenUsage?: number

	/** 输出 Token 量 */
	outputTokenUsage?: number

	/** 总 Token 量 */
	totalTokenUsage?: number

	/** 大模型调用次数 */
	modelCallCount?: number

	/** 审核状态：1-审核中，2-成功，3-失败 */
	reviewStatus?: ReviewRecordReviewStatus

	/** 审核失败原因，审核成功时为空 */
	failureMessage?: string

	/** 其它相关信息 */
	extraInfo?: string

	/** 审核时长，单位：秒 */
	reviewDuration?: number

	/** 异常数量 */
	exceptionCount?: number

	/** 用户 ID */
	userId?: number

	/** 租户 ID */
	tenantId?: number

	/** 审核 Agent 名称 */
	reviewAgentName?: string

	/** 用户名 */
	username?: string

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
	deleteStatus?: ReviewRecordDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}

/** 分页查询租户审核记录（响应） */
export type ReviewRecordPageResponse = SearchResponse<ReviewRecordPageRecord>

/** 分页查询本人审核记录（响应） */
export type ReviewRecordMyPageResponse = SearchResponse<ReviewRecordPageRecord>

/** 新增审核任务记录（参数） */
export interface ReviewRecordCreateData {
	/** 审核 Agent ID */
	reviewAgentId: number

	/** 根据审核 Agent 动态表单填写的输入数据 */
	inputDataJson: DynamicFormInputDataJson
}

/** 新增审核任务记录（响应；新记录 ID） */
export type ReviewRecordCreateResponse = number

/** 修改未达预期反馈（参数） */
export interface ReviewRecordUpdateUnmetExpectationFeedbackData {
	/** 审核记录 ID */
	id: number

	/** 未达预期反馈，未传、null 或空白字符串时清空 */
	unmetExpectationFeedback?: string
}

/** 匹配文件与上传组件（上传组件） */
export interface ReviewRecordMatchFileUploadComponent {
	/** 上传组件名 */
	name: string

	/** 上传组件描述 */
	description: string
}

/** 匹配文件与上传组件（参数） */
export interface ReviewRecordMatchFileUploadComponentsData {
	/** 待匹配的文件名集合 */
	fileNames: string[]

	/** 待匹配的上传组件集合 */
	uploadComponents: ReviewRecordMatchFileUploadComponent[]

	/** 当前 Agent 的 Skill ID */
	skillId: number
}

/** 匹配文件与上传组件（行） */
export interface ReviewRecordMatchFileUploadComponentsRecord {
	/** 文件名 */
	fileName?: string

	/** 与文件匹配的上传组件名 */
	uploadComponentName?: string
}

/** 匹配文件与上传组件（响应） */
export type ReviewRecordMatchFileUploadComponentsResponse =
	ReviewRecordMatchFileUploadComponentsRecord[]

/** 审核记录重命名（参数） */
export interface ReviewRecordRenameData {
	/** 审核记录 ID */
	id: number

	/** 新的审核记录标识 */
	reviewRecordIdentifier: string
}

/** 查询 Agent 审核时长统计（响应） */
export interface ReviewRecordDurationStatisticsResponse {
	/** 最近五次成功审核的平均时长；没有历史记录时为 Agent 默认 AI 审核时长，单位：秒 */
	averageReviewDuration?: number

	/** 最近五次成功审核的最长时长；没有历史记录时为 Agent 默认 AI 审核时长，单位：秒 */
	maxReviewDuration?: number
}

/** 查询审核记录详情（响应） */
export interface ReviewRecordDetailResponse extends ReviewRecordPageRecord {
	/** 当前服务器时间戳，单位：毫秒 */
	currentTimestamp?: number

	/** 本次审核使用的动态表单 */
	dynamicForm?: DynamicFormDetailResponse

	/** 本次审核填写的动态表单数据 */
	dynamicFormData?: DynamicFormDataRecord
}
