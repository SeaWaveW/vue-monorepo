/** 分页查询 Agent 授权。与 swagger / authApiList 权限串一致 */
export const TENANT_REVIEW_AGENT_PAGE = '/tenant-review-agent/page' as const

/** 新增 Agent 授权。与 swagger / authApiList 权限串一致 */
export const TENANT_REVIEW_AGENT_CREATE = '/tenant-review-agent/create' as const

/** 删除 Agent 授权。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const TENANT_REVIEW_AGENT_DELETE =
	'/tenant-review-agent/delete/{id}' as const
