export type * from './types/client-navigation'
export * from './paths/client-navigation'

import type {
	ClientNavigationTreeResponse,
	ClientNavigationCreateData,
	ClientNavigationUpdateData,
	ClientNavigationDetailResponse,
} from './types/client-navigation'
import { request } from '#/axios'
import {
	CLIENT_NAVIGATION_TREE,
	CLIENT_NAVIGATION_CREATE,
	CLIENT_NAVIGATION_UPDATE,
	CLIENT_NAVIGATION_DELETE,
	CLIENT_NAVIGATION_DETAIL,
} from './paths/client-navigation'

/***************************** 客户端导航管理（管理客户端的导航结构及页面路径） *****************************/

/** 查询客户端导航树 */
export const clientNavigationTree = () => {
	return request.get<ClientNavigationTreeResponse>(CLIENT_NAVIGATION_TREE)
}

/** 新增客户端导航（在指定父导航下新增导航，父导航 ID 为 0 时创建顶级导航） */
export const clientNavigationCreate = (data: ClientNavigationCreateData) => {
	return request.post(CLIENT_NAVIGATION_CREATE, data)
}

/** 修改客户端导航（修改导航名称、展示序号、页面路径和备注，父导航保持不变） */
export const clientNavigationUpdate = (data: ClientNavigationUpdateData) => {
	return request.put(CLIENT_NAVIGATION_UPDATE, data)
}

/** 删除客户端导航 */
export const clientNavigationDelete = (
	/** 客户端导航 ID */
	id: number,
) => {
	return request.delete(CLIENT_NAVIGATION_DELETE.replace('{id}', `${id}`))
}

/** 查询客户端导航详情 */
export const clientNavigationDetail = (
	/** 客户端导航 ID */
	id: number,
) => {
	return request.get<ClientNavigationDetailResponse>(
		CLIENT_NAVIGATION_DETAIL.replace('{id}', `${id}`),
	)
}
