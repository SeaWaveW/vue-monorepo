/** 分页查询客户端功能。与 swagger / authApiList 权限串一致 */
export const CLIENT_FUNCTION_PAGE = '/client-function/page' as const

/** 新增客户端功能。与 swagger / authApiList 权限串一致 */
export const CLIENT_FUNCTION_CREATE = '/client-function/create' as const

/** 修改客户端功能。与 swagger / authApiList 权限串一致 */
export const CLIENT_FUNCTION_UPDATE = '/client-function/update' as const

/** 根据 ID 修改客户端功能备注。与 swagger / authApiList 权限串一致 */
export const CLIENT_FUNCTION_UPDATE_REMARK =
	'/client-function/update-remark' as const

/** 删除客户端功能。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const CLIENT_FUNCTION_DELETE = '/client-function/delete/{id}' as const

/** 查询客户端功能详情。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const CLIENT_FUNCTION_DETAIL = '/client-function/detail/{id}' as const
