/** 分页查询后台用户。与 swagger / authApiList 权限串一致 */
export const ADMIN_USER_PAGE = '/admin-user/page' as const

/** 新增后台用户。与 swagger / authApiList 权限串一致 */
export const ADMIN_USER_CREATE = '/admin-user/create' as const

/** 修改后台用户。与 swagger / authApiList 权限串一致 */
export const ADMIN_USER_UPDATE = '/admin-user/update' as const

/** 根据 ID 修改后台用户备注。与 swagger / authApiList 权限串一致 */
export const ADMIN_USER_UPDATE_REMARK = '/admin-user/update-remark' as const

/** 修改后台用户状态。与 swagger / authApiList 权限串一致 */
export const ADMIN_USER_UPDATE_STATUS = '/admin-user/update-status' as const

/** 删除后台用户。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const ADMIN_USER_DELETE = '/admin-user/delete/{id}' as const

/** 查询后台用户详情。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const ADMIN_USER_DETAIL = '/admin-user/detail/{id}' as const
