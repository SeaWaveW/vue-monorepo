export type * from './types/admin-user-group'
export * from './paths/admin-user-group'

import type { SearchParams } from './types'
import type {
	AdminUserGroupPageParams,
	AdminUserGroupPageResponse,
	AdminUserGroupCreateData,
	AdminUserGroupUpdateData,
	AdminUserGroupUpdateRemarkData,
	AdminUserGroupDetailResponse,
} from './types/admin-user-group'
import { request } from '#/axios'
import {
	ADMIN_USER_GROUP_PAGE,
	ADMIN_USER_GROUP_CREATE,
	ADMIN_USER_GROUP_UPDATE,
	ADMIN_USER_GROUP_UPDATE_REMARK,
	ADMIN_USER_GROUP_DELETE,
	ADMIN_USER_GROUP_DETAIL,
} from './paths/admin-user-group'

/***************************** 用户组管理（管理后台系统的用户组及其导航与功能关联） *****************************/

/** 分页查询用户组 */
export const adminUserGroupPage = (
	params: SearchParams<AdminUserGroupPageParams>,
) => {
	return request.get<AdminUserGroupPageResponse>(ADMIN_USER_GROUP_PAGE, {
		params,
	})
}

/** 新增用户组（请求体带 `navigationIds` / `functionIds`；详情返回整行） */
export const adminUserGroupCreate = (data: AdminUserGroupCreateData) => {
	return request.post(ADMIN_USER_GROUP_CREATE, data)
}

/** 修改用户组 */
export const adminUserGroupUpdate = (data: AdminUserGroupUpdateData) => {
	return request.put(ADMIN_USER_GROUP_UPDATE, data)
}

/** 根据 ID 修改用户组备注（仅修改备注，不修改用户组的其他字段及导航、功能关联关系） */
export const adminUserGroupUpdateRemark = (
	data: AdminUserGroupUpdateRemarkData,
) => {
	return request.put(ADMIN_USER_GROUP_UPDATE_REMARK, data)
}

/** 删除用户组 */
export const adminUserGroupDelete = (
	/** 用户组 ID */
	id: number,
) => {
	return request.delete(ADMIN_USER_GROUP_DELETE.replace('{id}', `${id}`))
}

/** 查询用户组详情 */
export const adminUserGroupDetail = (
	/** 用户组 ID */
	id: number,
) => {
	return request.get<AdminUserGroupDetailResponse>(
		ADMIN_USER_GROUP_DETAIL.replace('{id}', `${id}`),
	)
}
