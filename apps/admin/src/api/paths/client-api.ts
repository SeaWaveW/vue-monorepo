/** 分页查询客户端 API 资源。与 swagger / authApiList 权限串一致 */
export const CLIENT_API_PAGE = '/client-api/page' as const

/** 新增客户端 API 资源。与 swagger / authApiList 权限串一致 */
export const CLIENT_API_CREATE = '/client-api/create' as const

/** 修改客户端 API 资源。与 swagger / authApiList 权限串一致 */
export const CLIENT_API_UPDATE = '/client-api/update' as const

/** 根据 ID 修改客户端 API 资源备注。与 swagger / authApiList 权限串一致 */
export const CLIENT_API_UPDATE_REMARK = '/client-api/update-remark' as const

/** 删除客户端 API 资源。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const CLIENT_API_DELETE = '/client-api/delete/{id}' as const

/** 查询客户端 API 资源详情。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const CLIENT_API_DETAIL = '/client-api/detail/{id}' as const
