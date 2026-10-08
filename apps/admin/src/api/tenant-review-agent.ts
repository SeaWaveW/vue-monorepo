export type * from './types/tenant-review-agent'
export * from './paths/tenant-review-agent'

import type { SearchParams } from './types'
import type {
	TenantReviewAgentPageParams,
	TenantReviewAgentPageResponse,
	TenantReviewAgentCreateData,
} from './types/tenant-review-agent'
import { request } from '#/axios'
import {
	TENANT_REVIEW_AGENT_PAGE,
	TENANT_REVIEW_AGENT_CREATE,
	TENANT_REVIEW_AGENT_DELETE,
} from './paths/tenant-review-agent'

/***************************** Agent 授权管理（管理客户与审核 Agent 的授权关系） *****************************/

/** 分页查询 Agent 授权（按 Agent 名称和客户名称分页查询授权关系） */
export const tenantReviewAgentPage = (
	params: SearchParams<TenantReviewAgentPageParams>,
) => {
	return request.get<TenantReviewAgentPageResponse>(
		TENANT_REVIEW_AGENT_PAGE,
		{
			params,
		},
	)
}

/** 新增 Agent 授权（一次提交 Agent 列表和客户列表） */
export const tenantReviewAgentCreate = (data: TenantReviewAgentCreateData) => {
	return request.post(TENANT_REVIEW_AGENT_CREATE, data)
}

/** 删除 Agent 授权（根据授权关系 ID 逻辑删除授权） */
export const tenantReviewAgentDelete = (
	/** 授权关系 ID */
	id: number,
) => {
	return request.delete(TENANT_REVIEW_AGENT_DELETE.replace('{id}', `${id}`))
}
