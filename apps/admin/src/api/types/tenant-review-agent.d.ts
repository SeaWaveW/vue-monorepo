import type { SearchResponse } from './index'

/** 分页查询 Agent 授权（参数；不含 pageNum/pageSize，由 SearchParams / 列表 hook 交叉） */
export interface TenantReviewAgentPageParams {
	/** Agent 名称，支持模糊查询 */
	reviewAgentName?: string

	/** 客户名称，支持模糊查询 */
	tenantName?: string
}

/** 分页查询 Agent 授权（行） */
export interface TenantReviewAgentPageRecord {
	/** 授权关系 ID */
	id: number

	/** 客户 ID */
	tenantId: number

	/** 客户名称 */
	tenantName?: string

	/** 审核 Agent ID */
	reviewAgentId: number

	/** Agent 名称 */
	reviewAgentName?: string

	/** 授权人 ID */
	createUserId?: number

	/** 授权人名称 */
	createUserName?: string

	/** 授权时间戳，单位：毫秒 */
	createTime?: number
}

/** 分页查询 Agent 授权（响应） */
export type TenantReviewAgentPageResponse =
	SearchResponse<TenantReviewAgentPageRecord>

/** 新增 Agent 授权（参数） */
export interface TenantReviewAgentCreateData {
	/** 客户 ID 列表 */
	tenantIds: number[]

	/** 审核 Agent ID 列表 */
	reviewAgentIds: number[]
}
