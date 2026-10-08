/** 收藏导航。与 swagger / authApiList 权限串一致 */
export const CLIENT_FAVORITE_NAVIGATION_CREATE =
	'/client-favorite-navigation/create' as const

/** 取消收藏导航。与 swagger / authApiList 权限串一致，保留 `{navigationId}` */
export const CLIENT_FAVORITE_NAVIGATION_DELETE =
	'/client-favorite-navigation/delete/{navigationId}' as const

/** 查询本人收藏导航。与 swagger / authApiList 权限串一致 */
export const CLIENT_FAVORITE_NAVIGATION_LIST =
	'/client-favorite-navigation/list' as const

/** 收藏导航排序。与 swagger / authApiList 权限串一致 */
export const CLIENT_FAVORITE_NAVIGATION_SORT =
	'/client-favorite-navigation/sort' as const
