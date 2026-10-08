/** 分页查询终端用户。与 swagger / authApiList 权限串一致 */
export const CLIENT_USER_PAGE = '/client-user/page' as const

/** 新增终端用户。与 swagger / authApiList 权限串一致 */
export const CLIENT_USER_CREATE = '/client-user/create' as const

/** 修改终端用户。与 swagger / authApiList 权限串一致 */
export const CLIENT_USER_UPDATE = '/client-user/update' as const

/** 修改终端用户备注。与 swagger / authApiList 权限串一致 */
export const CLIENT_USER_UPDATE_REMARK = '/client-user/update-remark' as const

/** 修改终端用户状态。与 swagger / authApiList 权限串一致 */
export const CLIENT_USER_UPDATE_STATUS = '/client-user/update-status' as const

/** 删除终端用户。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const CLIENT_USER_DELETE = '/client-user/delete/{id}' as const

/** 查询终端用户详情。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const CLIENT_USER_DETAIL = '/client-user/detail/{id}' as const
