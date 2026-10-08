export type * from './types/user'
export * from './paths/user'

import type { SearchParams } from './types'
import type {
	ClientUserPageParams,
	ClientUserPageResponse,
	ClientUserCreateData,
	ClientUserUpdateData,
	ClientUserUpdateRemarkData,
	ClientUserUpdateStatusData,
	ClientUserDetailResponse,
} from './types/user'
import { request } from '#/axios'
import {
	CLIENT_USER_PAGE,
	CLIENT_USER_CREATE,
	CLIENT_USER_UPDATE,
	CLIENT_USER_UPDATE_REMARK,
	CLIENT_USER_UPDATE_STATUS,
	CLIENT_USER_DELETE,
	CLIENT_USER_DETAIL,
} from './paths/user'

/***************************** 终端用户管理（管理当前租户的终端用户及其用户组关联） *****************************/

/** 分页查询终端用户（按照用户信息和状态分页查询当前租户的终端用户） */
export const clientUserPage = (params: SearchParams<ClientUserPageParams>) => {
	return request.get<ClientUserPageResponse>(CLIENT_USER_PAGE, { params })
}

/** 新增终端用户（在当前租户新增终端用户并建立用户组关联；请求体带 `groupIds`，详情返回 `userGroups` 整行） */
export const clientUserCreate = (data: ClientUserCreateData) => {
	return request.post(CLIENT_USER_CREATE, data)
}

/** 修改终端用户（修改当前租户终端用户并替换全部用户组关联） */
export const clientUserUpdate = (data: ClientUserUpdateData) => {
	return request.put(CLIENT_USER_UPDATE, data)
}

/** 修改终端用户备注（仅修改当前租户终端用户的备注） */
export const clientUserUpdateRemark = (data: ClientUserUpdateRemarkData) => {
	return request.put(CLIENT_USER_UPDATE_REMARK, data)
}

/** 修改终端用户状态（修改当前租户终端用户状态：1-正常，2-禁用） */
export const clientUserUpdateStatus = (data: ClientUserUpdateStatusData) => {
	return request.put(CLIENT_USER_UPDATE_STATUS, data)
}

/** 删除终端用户 */
export const clientUserDelete = (
	/** 终端用户 ID */
	id: number,
) => {
	return request.delete(CLIENT_USER_DELETE.replace('{id}', `${id}`))
}

/** 查询终端用户详情（查询当前租户终端用户的基本信息和关联用户组） */
export const clientUserDetail = (
	/** 终端用户 ID */
	id: number,
) => {
	return request.get<ClientUserDetailResponse>(
		CLIENT_USER_DETAIL.replace('{id}', `${id}`),
	)
}
