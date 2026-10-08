/** 分页查询客户用户组。与 swagger / authApiList 权限串一致 */
export const CLIENT_USER_GROUP_PAGE = '/client-user-group/page' as const

/** 新增客户用户组。与 swagger / authApiList 权限串一致 */
export const CLIENT_USER_GROUP_CREATE = '/client-user-group/create' as const

/** 修改客户用户组。与 swagger / authApiList 权限串一致 */
export const CLIENT_USER_GROUP_UPDATE = '/client-user-group/update' as const

/** 修改客户用户组备注。与 swagger / authApiList 权限串一致 */
export const CLIENT_USER_GROUP_UPDATE_REMARK =
	'/client-user-group/update-remark' as const

/** 删除客户用户组。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const CLIENT_USER_GROUP_DELETE =
	'/client-user-group/delete/{id}' as const

/** 查询客户用户组详情。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const CLIENT_USER_GROUP_DETAIL =
	'/client-user-group/detail/{id}' as const
