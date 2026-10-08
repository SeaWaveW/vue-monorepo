export type * from './types/favorite-navigation'
export * from './paths/favorite-navigation'

import type {
	ClientFavoriteNavigationCreateData,
	ClientFavoriteNavigationListResponse,
	ClientFavoriteNavigationSortData,
} from './types/favorite-navigation'
import { request } from '#/axios'
import {
	CLIENT_FAVORITE_NAVIGATION_CREATE,
	CLIENT_FAVORITE_NAVIGATION_DELETE,
	CLIENT_FAVORITE_NAVIGATION_LIST,
	CLIENT_FAVORITE_NAVIGATION_SORT,
} from './paths/favorite-navigation'

/***************************** 客户端收藏导航（维护当前登录用户在所属租户内的导航收藏及拖动排序） *****************************/

/** 收藏导航（将有效页面导航收藏到当前用户列表末尾，已收藏时直接返回成功） */
export const clientFavoriteNavigationCreate = (
	data: ClientFavoriteNavigationCreateData,
) => {
	return request.post(CLIENT_FAVORITE_NAVIGATION_CREATE, data)
}

/** 取消收藏导航（按导航 ID 物理删除当前用户的收藏并记录操作日志，未收藏时直接返回成功） */
export const clientFavoriteNavigationDelete = (
	/** 导航 ID，非收藏记录 ID */
	navigationId: number,
) => {
	return request.delete(
		CLIENT_FAVORITE_NAVIGATION_DELETE.replace(
			'{navigationId}',
			`${navigationId}`,
		),
	)
}

/** 查询本人收藏导航（根据当前登录用户 ID 查询有效收藏导航，按收藏展示序号升序排列） */
export const clientFavoriteNavigationList = () => {
	return request.get<ClientFavoriteNavigationListResponse>(
		CLIENT_FAVORITE_NAVIGATION_LIST,
	)
}

/** 收藏导航排序（提交当前用户全部有效收藏的导航 ID 顺序，展示序号从 1 开始） */
export const clientFavoriteNavigationSort = (
	data: ClientFavoriteNavigationSortData,
) => {
	return request.put(CLIENT_FAVORITE_NAVIGATION_SORT, data)
}
