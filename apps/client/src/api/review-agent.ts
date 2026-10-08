export type * from './types/review-agent'
export * from './paths/review-agent'

import type { SearchParams } from './types'
import type {
	ReviewAgentPageParams,
	ReviewAgentPageResponse,
	ReviewAgentCreateData,
	ReviewAgentUpdateData,
	ReviewAgentUpdateRemarkData,
	ReviewAgentUpdateStatusData,
	ReviewAgentDetailResponse,
	ReviewAgentMyAuthorizedListResponse,
	ReviewAgentSortData,
} from './types/review-agent'
import { request } from '#/axios'
import {
	REVIEW_AGENT_PAGE,
	REVIEW_AGENT_MY_AUTHORIZED_LIST,
	REVIEW_AGENT_CREATE,
	REVIEW_AGENT_UPDATE,
	REVIEW_AGENT_UPDATE_REMARK,
	REVIEW_AGENT_UPDATE_STATUS,
	REVIEW_AGENT_DELETE,
	REVIEW_AGENT_DETAIL,
	REVIEW_AGENT_SORT,
} from './paths/review-agent'

/***************************** 审核 Agent 查询（查询当前租户已授权的审核 Agent） *****************************/

/** 分页查询已授权 Agent（按名称、授权状态和简单描述分页查询当前租户已授权的 Agent） */
export const reviewAgentPage = (
	params: SearchParams<ReviewAgentPageParams>,
) => {
	return request.get<ReviewAgentPageResponse>(REVIEW_AGENT_PAGE, { params })
}

/** 查询本人已授权 Agent（查询当前登录用户在所属租户内已授权且可用的全部审核 Agent） */
export const reviewAgentMyAuthorizedList = () => {
	return request.get<ReviewAgentMyAuthorizedListResponse>(
		REVIEW_AGENT_MY_AUTHORIZED_LIST,
	)
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

/** 修改 Agent 状态（租户自行决定是否使用，启用或禁用当前租户已授权的 Agent） */
export const reviewAgentUpdateStatus = (data: ReviewAgentUpdateStatusData) => {
	return request.put(REVIEW_AGENT_UPDATE_STATUS, data)
}

/** 删除审核 Agent */
export const reviewAgentDelete = (
	/** 审核 Agent ID */
	id: number,
) => {
	return request.delete(REVIEW_AGENT_DELETE.replace('{id}', `${id}`))
}

/** 查询已授权 Agent 详情（查询当前租户已授权 Agent 的基本信息、审核清单和动态表单） */
export const reviewAgentDetail = (
	/** 审核 Agent ID */
	id: number,
) => {
	return request.get<ReviewAgentDetailResponse>(
		REVIEW_AGENT_DETAIL.replace('{id}', `${id}`),
	)
}

/** 本人已授权 Agent 排序（提交本人全部可用且已授权的 Agent ID 顺序，序号从 1 开始；重复 ID 返回 400，授权集合已变化或包含非本人 Agent 时返回 409） */
export const reviewAgentSort = (data: ReviewAgentSortData) => {
	return request.put(REVIEW_AGENT_SORT, data)
}
