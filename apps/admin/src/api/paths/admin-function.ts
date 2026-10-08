/** 分页查询功能。与 swagger / authApiList 权限串一致 */
export const ADMIN_FUNCTION_PAGE = '/admin-function/page' as const

/** 新增功能。与 swagger / authApiList 权限串一致 */
export const ADMIN_FUNCTION_CREATE = '/admin-function/create' as const

/** 修改功能。与 swagger / authApiList 权限串一致 */
export const ADMIN_FUNCTION_UPDATE = '/admin-function/update' as const

/** 根据 ID 修改功能备注。与 swagger / authApiList 权限串一致 */
export const ADMIN_FUNCTION_UPDATE_REMARK =
	'/admin-function/update-remark' as const

/** 删除功能。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const ADMIN_FUNCTION_DELETE = '/admin-function/delete/{id}' as const

/** 查询功能详情。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const ADMIN_FUNCTION_DETAIL = '/admin-function/detail/{id}' as const
