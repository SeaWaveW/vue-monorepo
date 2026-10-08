/** 分页查询 API 资源。与 swagger / authApiList 权限串一致 */
export const ADMIN_API_PAGE = '/admin-api/page' as const

/** 新增 API 资源。与 swagger / authApiList 权限串一致 */
export const ADMIN_API_CREATE = '/admin-api/create' as const

/** 修改 API 资源。与 swagger / authApiList 权限串一致 */
export const ADMIN_API_UPDATE = '/admin-api/update' as const

/** 根据 ID 修改 API 资源备注。与 swagger / authApiList 权限串一致 */
export const ADMIN_API_UPDATE_REMARK = '/admin-api/update-remark' as const

/** 删除 API 资源。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const ADMIN_API_DELETE = '/admin-api/delete/{id}' as const

/** 查询 API 资源详情。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const ADMIN_API_DETAIL = '/admin-api/detail/{id}' as const
