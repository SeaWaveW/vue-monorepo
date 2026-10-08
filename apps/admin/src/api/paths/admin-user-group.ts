/** 分页查询用户组。与 swagger / authApiList 权限串一致 */
export const ADMIN_USER_GROUP_PAGE = '/admin-user-group/page' as const

/** 新增用户组。与 swagger / authApiList 权限串一致 */
export const ADMIN_USER_GROUP_CREATE = '/admin-user-group/create' as const

/** 修改用户组。与 swagger / authApiList 权限串一致 */
export const ADMIN_USER_GROUP_UPDATE = '/admin-user-group/update' as const

/** 根据 ID 修改用户组备注。与 swagger / authApiList 权限串一致 */
export const ADMIN_USER_GROUP_UPDATE_REMARK =
	'/admin-user-group/update-remark' as const

/** 删除用户组。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const ADMIN_USER_GROUP_DELETE = '/admin-user-group/delete/{id}' as const

/** 查询用户组详情。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const ADMIN_USER_GROUP_DETAIL = '/admin-user-group/detail/{id}' as const
