/** 查询所有客户。与 swagger / authApiList 权限串一致 */
export const CLIENT_TENANT_ALL = '/client-tenant/all' as const

/** 分页查询租户。与 swagger / authApiList 权限串一致 */
export const CLIENT_TENANT_PAGE = '/client-tenant/page' as const

/** 新增租户。与 swagger / authApiList 权限串一致 */
export const CLIENT_TENANT_CREATE = '/client-tenant/create' as const

/** 修改租户。与 swagger / authApiList 权限串一致 */
export const CLIENT_TENANT_UPDATE = '/client-tenant/update' as const

/** 修改租户状态。与 swagger / authApiList 权限串一致 */
export const CLIENT_TENANT_UPDATE_STATUS =
	'/client-tenant/update-status' as const

/** 根据 ID 修改租户备注。与 swagger / authApiList 权限串一致 */
export const CLIENT_TENANT_UPDATE_REMARK =
	'/client-tenant/update-remark' as const

/** 删除租户。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const CLIENT_TENANT_DELETE = '/client-tenant/delete/{id}' as const

/** 查询租户详情。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const CLIENT_TENANT_DETAIL = '/client-tenant/detail/{id}' as const
