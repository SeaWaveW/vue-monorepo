export type * from './types/review-agent'
export * from './paths/review-agent'

import type { SearchParams } from './types'
import type {
	ReviewAgentPageParams,
	ReviewAgentPageResponse,
	ReviewAgentCreateData,
	ReviewAgentUpdateData,
	ReviewAgentUpdateRemarkData,
	ReviewAgentDetailResponse,
} from './types/review-agent'
import { request } from '#/axios'
import {
	REVIEW_AGENT_PAGE,
	REVIEW_AGENT_CREATE,
	REVIEW_AGENT_UPDATE,
	REVIEW_AGENT_UPDATE_REMARK,
	REVIEW_AGENT_DELETE,
	REVIEW_AGENT_DETAIL,
} from './paths/review-agent'

/***************************** 审核 Agent 管理（管理审核 Agent 及其审核清单） *****************************/

/** 分页查询审核 Agent */
export const reviewAgentPage = (
	params: SearchParams<ReviewAgentPageParams>,
) => {
	return request.get<ReviewAgentPageResponse>(REVIEW_AGENT_PAGE, { params })
}

/** 新增审核 Agent */
export const reviewAgentCreate = (data: ReviewAgentCreateData) => {
	return request.post(REVIEW_AGENT_CREATE, data)
}

/** 修改审核 Agent */
export const reviewAgentUpdate = (data: ReviewAgentUpdateData) => {
	return request.put(REVIEW_AGENT_UPDATE, data)
}

/** 根据 ID 修改审核 Agent 备注（仅修改备注，不修改其他字段或审核清单） */
export const reviewAgentUpdateRemark = (data: ReviewAgentUpdateRemarkData) => {
	return request.put(REVIEW_AGENT_UPDATE_REMARK, data)
}

/** 删除审核 Agent */
export const reviewAgentDelete = (
	/** 审核 Agent ID */
	id: number,
) => {
	return request.delete(REVIEW_AGENT_DELETE.replace('{id}', `${id}`))
}

/** 查询审核 Agent 详情 */
export const reviewAgentDetail = (
	/** 审核 Agent ID */
	id: number,
) => {
	return request.get<ReviewAgentDetailResponse>(
		REVIEW_AGENT_DETAIL.replace('{id}', `${id}`),
	)
}
