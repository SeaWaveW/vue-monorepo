/** 分页查询 Agent 授权。与 swagger / authApiList 权限串一致 */
export const AGENT_AUTHORIZATION_PAGE = '/agent-authorization/page' as const

/** 新增 Agent 授权。与 swagger / authApiList 权限串一致 */
export const AGENT_AUTHORIZATION_CREATE = '/agent-authorization/create' as const

/** 删除 Agent 授权。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const AGENT_AUTHORIZATION_DELETE =
	'/agent-authorization/delete/{id}' as const
