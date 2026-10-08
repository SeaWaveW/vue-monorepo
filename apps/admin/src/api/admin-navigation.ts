export type * from './types/admin-navigation'
export * from './paths/admin-navigation'

import type {
	AdminNavigationTreeResponse,
	AdminNavigationAuthorizedTreeResponse,
	AdminNavigationCreateData,
	AdminNavigationUpdateData,
	AdminNavigationDetailResponse,
} from './types/admin-navigation'
import { request } from '#/axios'
import {
	ADMIN_NAVIGATION_TREE,
	ADMIN_NAVIGATION_AUTHORIZED_TREE,
	ADMIN_NAVIGATION_CREATE,
	ADMIN_NAVIGATION_UPDATE,
	ADMIN_NAVIGATION_DELETE,
	ADMIN_NAVIGATION_DETAIL,
} from './paths/admin-navigation'

/***************************** 导航管理（管理后台导航结构及页面路径） *****************************/

/** 查询导航树（查询完整导航树，同级导航按展示序号 serial 升序排列，相同序号按 ID 升序排列，不分页） */
export const adminNavigationTree = () => {
	return request.get<AdminNavigationTreeResponse>(ADMIN_NAVIGATION_TREE)
}

/** 查询本人授权导航（根据当前登录用户所属的有效用户组查询授权导航，去重后按导航展示序号组成树结构） */
export const adminNavigationAuthorizedTree = () => {
	return request.get<AdminNavigationAuthorizedTreeResponse>(
		ADMIN_NAVIGATION_AUTHORIZED_TREE,
	)
}

/** 新增导航（在指定父导航下新增导航，父导航 ID 为 0 时创建顶级导航） */
export const adminNavigationCreate = (data: AdminNavigationCreateData) => {
	return request.post(ADMIN_NAVIGATION_CREATE, data)
}

/** 修改导航（修改导航名称、展示序号、页面路径和备注，父导航保持不变） */
export const adminNavigationUpdate = (data: AdminNavigationUpdateData) => {
	return request.put(ADMIN_NAVIGATION_UPDATE, data)
}

/** 删除导航（逻辑删除导航并记录删除审计信息；存在未删除的子导航或有效的收藏、用户组关联时不允许删除） */
export const adminNavigationDelete = (
	/** 导航 ID */
	id: number,
) => {
	return request.delete(ADMIN_NAVIGATION_DELETE.replace('{id}', `${id}`))
}

/** 查询导航详情（根据导航 ID 查询基本信息、父导航名称及审计信息） */
export const adminNavigationDetail = (
	/** 导航 ID */
	id: number,
) => {
	return request.get<AdminNavigationDetailResponse>(
		ADMIN_NAVIGATION_DETAIL.replace('{id}', `${id}`),
	)
}
