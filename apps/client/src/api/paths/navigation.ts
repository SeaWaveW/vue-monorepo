/** 查询客户端导航树。与 swagger / authApiList 权限串一致 */
export const CLIENT_NAVIGATION_TREE = '/client-navigation/tree' as const

/** 查询本人授权导航。与 swagger / authApiList 权限串一致 */
export const CLIENT_NAVIGATION_AUTHORIZED_TREE =
	'/client-navigation/authorized-tree' as const

/** 新增客户端导航。与 swagger / authApiList 权限串一致 */
export const CLIENT_NAVIGATION_CREATE = '/client-navigation/create' as const

/** 修改客户端导航。与 swagger / authApiList 权限串一致 */
export const CLIENT_NAVIGATION_UPDATE = '/client-navigation/update' as const

/** 删除客户端导航。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const CLIENT_NAVIGATION_DELETE =
	'/client-navigation/delete/{id}' as const

/** 查询客户端导航详情。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const CLIENT_NAVIGATION_DETAIL =
	'/client-navigation/detail/{id}' as const
