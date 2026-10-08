import type { SearchResponse } from './index'

/** 分页查询 Agent 授权（参数；不含 pageNum/pageSize，由 SearchParams / 列表 hook 交叉） */
export interface AgentAuthorizationPageParams {
	/** Agent 名称，支持模糊查询 */
	agentName?: string

	/** 用户名称，支持模糊查询 */
	username?: string
}

/** 分页查询 Agent 授权（行） */
export interface AgentAuthorizationPageRecord {
	/** 授权关系 ID */
	id: number

	/** 审核 Agent ID */
	reviewAgentId: number

	/** Agent 名称 */
	agentName?: string

	/** 员工 ID */
	userId: number

	/** 用户名称 */
	username?: string

	/** 员工邮箱 */
	email?: string

	/** 授权时间戳，单位：毫秒 */
	authorizationTime?: number

	/** 授权人 */
	authorizerName?: string
}

/** 分页查询 Agent 授权（响应） */
export type AgentAuthorizationPageResponse =
	SearchResponse<AgentAuthorizationPageRecord>

/** 新增 Agent 授权（参数） */
export interface AgentAuthorizationCreateData {
	/** 审核 Agent ID 集合 */
	reviewAgentIds: number[]

	/** 员工 ID 集合 */
	userIds: number[]
}
