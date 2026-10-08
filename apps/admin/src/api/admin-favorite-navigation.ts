export type * from './types/admin-favorite-navigation'
export * from './paths/admin-favorite-navigation'

import type {
	AdminFavoriteNavigationCreateData,
	AdminFavoriteNavigationListResponse,
	AdminFavoriteNavigationSortData,
} from './types/admin-favorite-navigation'
import { request } from '#/axios'
import {
	ADMIN_FAVORITE_NAVIGATION_CREATE,
	ADMIN_FAVORITE_NAVIGATION_DELETE,
	ADMIN_FAVORITE_NAVIGATION_LIST,
	ADMIN_FAVORITE_NAVIGATION_SORT,
} from './paths/admin-favorite-navigation'

/***************************** 收藏导航管理（维护当前登录用户的导航收藏及拖动排序） *****************************/

/** 收藏导航（将有效页面导航收藏到当前用户列表末尾，已收藏时直接返回成功） */
export const adminFavoriteNavigationCreate = (
	data: AdminFavoriteNavigationCreateData,
) => {
	return request.post(ADMIN_FAVORITE_NAVIGATION_CREATE, data)
}

/** 取消收藏导航（按导航 ID 物理删除当前用户的收藏并记录操作日志，未收藏时直接返回成功） */
export const adminFavoriteNavigationDelete = (
	/** 导航 ID，非收藏记录 ID */
	navigationId: number,
) => {
	return request.delete(
		ADMIN_FAVORITE_NAVIGATION_DELETE.replace(
			'{navigationId}',
			`${navigationId}`,
		),
	)
}

/** 查询本人收藏导航（根据当前登录用户 ID 查询有效收藏导航，按收藏展示序号升序排列） */
export const adminFavoriteNavigationList = () => {
	return request.get<AdminFavoriteNavigationListResponse>(
		ADMIN_FAVORITE_NAVIGATION_LIST,
	)
}

/** 收藏导航排序（提交当前用户全部有效收藏的导航 ID 顺序，展示序号从 1 开始） */
export const adminFavoriteNavigationSort = (
	data: AdminFavoriteNavigationSortData,
) => {
	return request.put(ADMIN_FAVORITE_NAVIGATION_SORT, data)
}
