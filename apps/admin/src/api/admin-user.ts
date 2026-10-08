export type * from './types/admin-user'
export * from './paths/admin-user'

import type { SearchParams } from './types'
import type {
	AdminUserPageParams,
	AdminUserPageResponse,
	AdminUserCreateData,
	AdminUserUpdateData,
	AdminUserUpdateRemarkData,
	AdminUserUpdateStatusData,
	AdminUserDetailResponse,
} from './types/admin-user'
import { request } from '#/axios'
import {
	ADMIN_USER_PAGE,
	ADMIN_USER_CREATE,
	ADMIN_USER_UPDATE,
	ADMIN_USER_UPDATE_REMARK,
	ADMIN_USER_UPDATE_STATUS,
	ADMIN_USER_DELETE,
	ADMIN_USER_DETAIL,
} from './paths/admin-user'

/***************************** 后台用户管理（管理后台用户及其用户组关联） *****************************/

/** 分页查询后台用户 */
export const adminUserPage = (params: SearchParams<AdminUserPageParams>) => {
	return request.get<AdminUserPageResponse>(ADMIN_USER_PAGE, { params })
}

/** 新增后台用户（请求体带 `groupIds`；详情接口返回的是 `userGroups` 整行） */
export const adminUserCreate = (data: AdminUserCreateData) => {
	return request.post(ADMIN_USER_CREATE, data)
}

/** 修改后台用户 */
export const adminUserUpdate = (data: AdminUserUpdateData) => {
	return request.put(ADMIN_USER_UPDATE, data)
}

/** 根据 ID 修改后台用户备注（仅修改备注，不修改后台用户的其他字段） */
export const adminUserUpdateRemark = (data: AdminUserUpdateRemarkData) => {
	return request.put(ADMIN_USER_UPDATE_REMARK, data)
}

/** 修改后台用户状态（根据用户 ID 修改状态：1-正常，2-禁用，并更新编辑审计信息） */
export const adminUserUpdateStatus = (data: AdminUserUpdateStatusData) => {
	return request.put(ADMIN_USER_UPDATE_STATUS, data)
}

/** 删除后台用户 */
export const adminUserDelete = (
	/** 后台用户 ID */
	id: number,
) => {
	return request.delete(ADMIN_USER_DELETE.replace('{id}', `${id}`))
}

/** 查询后台用户详情 */
export const adminUserDetail = (
	/** 后台用户 ID */
	id: number,
) => {
	return request.get<AdminUserDetailResponse>(
		ADMIN_USER_DETAIL.replace('{id}', `${id}`),
	)
}
