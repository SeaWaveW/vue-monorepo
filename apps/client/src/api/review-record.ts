export type * from './types/review-record'
export * from './paths/review-record'

import type { SearchParams } from './types'
import type {
	ReviewRecordPageParams,
	ReviewRecordPageResponse,
	ReviewRecordMyPageParams,
	ReviewRecordMyPageResponse,
	ReviewRecordCreateData,
	ReviewRecordCreateResponse,
	ReviewRecordUpdateUnmetExpectationFeedbackData,
	ReviewRecordMatchFileUploadComponentsData,
	ReviewRecordMatchFileUploadComponentsResponse,
	ReviewRecordRenameData,
	ReviewRecordDetailResponse,
	ReviewRecordDurationStatisticsResponse,
} from './types/review-record'
import { request } from '#/axios'
import {
	REVIEW_RECORD_UPDATE_UNMET_EXPECTATION_FEEDBACK,
	REVIEW_RECORD_RENAME,
	REVIEW_RECORD_MATCH_FILE_UPLOAD_COMPONENTS,
	REVIEW_RECORD_CREATE,
	REVIEW_RECORD_PAGE,
	REVIEW_RECORD_MY_PAGE,
	REVIEW_RECORD_DETAIL,
	REVIEW_RECORD_DELETE,
	REVIEW_RECORD_DURATION_STATISTICS,
} from './paths/review-record'

/***************************** 审核记录管理（查询和管理当前租户的审核记录） *****************************/

/** 修改未达预期反馈（修改当前租户审核记录的未达预期反馈） */
export const reviewRecordUpdateUnmetExpectationFeedback = (
	data: ReviewRecordUpdateUnmetExpectationFeedbackData,
) => {
	return request.put(REVIEW_RECORD_UPDATE_UNMET_EXPECTATION_FEEDBACK, data)
}

/** 审核记录重命名（修改当前租户审核记录的标识） */
export const reviewRecordRename = (data: ReviewRecordRenameData) => {
	return request.put(REVIEW_RECORD_RENAME, data)
}

/** 匹配文件与上传组件（根据文件名、上传组件名及组件描述，通过大模型判断每个文件对应的上传组件） */
export const reviewRecordMatchFileUploadComponents = (
	data: ReviewRecordMatchFileUploadComponentsData,
) => {
	return request.post<ReviewRecordMatchFileUploadComponentsResponse>(
		REVIEW_RECORD_MATCH_FILE_UPLOAD_COMPONENTS,
		data,
	)
}

/** 新增审核任务记录（根据用户上传的资料生成生成审核记录，并调智能体进行审核） */
export const reviewRecordCreate = (data: ReviewRecordCreateData) => {
	return request.post<ReviewRecordCreateResponse>(REVIEW_RECORD_CREATE, data)
}

/** 分页查询租户审核记录（分页查询当前租户的全部审核记录，支持按记录标识、审核状态和用户名筛选） */
export const reviewRecordPage = (
	params: SearchParams<ReviewRecordPageParams>,
) => {
	return request.get<ReviewRecordPageResponse>(REVIEW_RECORD_PAGE, {
		params,
	})
}

/** 分页查询本人审核记录（分页查询当前登录用户在当前租户内的审核记录，支持按记录标识和审核状态筛选） */
export const reviewRecordMyPage = (
	params: SearchParams<ReviewRecordMyPageParams>,
) => {
	return request.get<ReviewRecordMyPageResponse>(REVIEW_RECORD_MY_PAGE, {
		params,
	})
}

/** 删除审核记录 */
export const reviewRecordDelete = (
	/** 审核记录 ID */
	id: number,
) => {
	return request.delete(REVIEW_RECORD_DELETE.replace('{id}', `${id}`))
}

/** 查询 Agent 审核时长统计（查询当前租户指定 Agent 最近五次成功审核的平均时长和最长时长；没有历史记录时返回 Agent 默认 AI 审核时长，单位为秒） */
export const reviewRecordDurationStatistics = (
	/** 审核 Agent ID */
	agentId: number,
) => {
	return request.get<ReviewRecordDurationStatisticsResponse>(
		REVIEW_RECORD_DURATION_STATISTICS.replace('{agentId}', `${agentId}`),
	)
}

/** 查询审核记录详情（查询当前租户的审核执行信息、审核结果、动态表单及本次填写数据） */
export const reviewRecordDetail = (
	/** 审核记录 ID */
	id: number,
) => {
	return request.get<ReviewRecordDetailResponse>(
		REVIEW_RECORD_DETAIL.replace('{id}', `${id}`),
	)
}
