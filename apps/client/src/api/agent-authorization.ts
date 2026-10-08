export type * from './types/agent-authorization'
export * from './paths/agent-authorization'

import type { SearchParams } from './types'
import type {
	AgentAuthorizationPageParams,
	AgentAuthorizationPageResponse,
	AgentAuthorizationCreateData,
} from './types/agent-authorization'
import { request } from '#/axios'
import {
	AGENT_AUTHORIZATION_PAGE,
	AGENT_AUTHORIZATION_CREATE,
	AGENT_AUTHORIZATION_DELETE,
} from './paths/agent-authorization'

/***************************** Agent 授权管理（管理当前租户审核 Agent 与员工的授权关系） *****************************/

/** 分页查询 Agent 授权（按 Agent 名称和用户名称分页查询当前租户授权记录） */
export const agentAuthorizationPage = (
	params: SearchParams<AgentAuthorizationPageParams>,
) => {
	return request.get<AgentAuthorizationPageResponse>(
		AGENT_AUTHORIZATION_PAGE,
		{
			params,
		},
	)
}

/** 新增 Agent 授权（将选择的 Agent 批量授权给选择的当前租户员工） */
export const agentAuthorizationCreate = (
	data: AgentAuthorizationCreateData,
) => {
	return request.post(AGENT_AUTHORIZATION_CREATE, data)
}

/** 删除 Agent 授权（移除当前租户的一条员工 Agent 授权记录） */
export const agentAuthorizationDelete = (
	/** 授权关系 ID */
	id: number,
) => {
	return request.delete(AGENT_AUTHORIZATION_DELETE.replace('{id}', `${id}`))
}
