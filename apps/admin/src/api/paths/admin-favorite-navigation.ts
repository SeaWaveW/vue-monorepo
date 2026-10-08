/** 收藏导航。与 swagger / authApiList 权限串一致 */
export const ADMIN_FAVORITE_NAVIGATION_CREATE =
	'/admin-favorite-navigation/create' as const

/** 取消收藏导航。与 swagger / authApiList 权限串一致，保留 `{navigationId}` */
export const ADMIN_FAVORITE_NAVIGATION_DELETE =
	'/admin-favorite-navigation/delete/{navigationId}' as const

/** 查询本人收藏导航。与 swagger / authApiList 权限串一致 */
export const ADMIN_FAVORITE_NAVIGATION_LIST =
	'/admin-favorite-navigation/list' as const

/** 收藏导航排序。与 swagger / authApiList 权限串一致 */
export const ADMIN_FAVORITE_NAVIGATION_SORT =
	'/admin-favorite-navigation/sort' as const
