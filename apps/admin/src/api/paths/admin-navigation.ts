/** 查询导航树。与 swagger / authApiList 权限串一致 */
export const ADMIN_NAVIGATION_TREE = '/admin-navigation/tree' as const

/** 查询本人授权导航。与 swagger / authApiList 权限串一致 */
export const ADMIN_NAVIGATION_AUTHORIZED_TREE =
	'/admin-navigation/authorized-tree' as const

/** 新增导航。与 swagger / authApiList 权限串一致 */
export const ADMIN_NAVIGATION_CREATE = '/admin-navigation/create' as const

/** 修改导航。与 swagger / authApiList 权限串一致 */
export const ADMIN_NAVIGATION_UPDATE = '/admin-navigation/update' as const

/** 删除导航。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const ADMIN_NAVIGATION_DELETE = '/admin-navigation/delete/{id}' as const

/** 查询导航详情。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const ADMIN_NAVIGATION_DETAIL = '/admin-navigation/detail/{id}' as const
