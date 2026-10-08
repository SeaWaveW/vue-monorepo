export type * from './types/client-user'
export * from './paths/client-user'

import type { SearchParams } from './types'
import type {
	ClientUserPageParams,
	ClientUserPageResponse,
	ClientUserCreateData,
	ClientUserUpdateData,
	ClientUserUpdateRemarkData,
	ClientUserUpdateStatusData,
	ClientUserDetailResponse,
} from './types/client-user'
import { request } from '#/axios'
import {
	CLIENT_USER_PAGE,
	CLIENT_USER_CREATE,
	CLIENT_USER_UPDATE,
	CLIENT_USER_UPDATE_REMARK,
	CLIENT_USER_UPDATE_STATUS,
	CLIENT_USER_DELETE,
	CLIENT_USER_DETAIL,
} from './paths/client-user'

/***************************** 客户用户管理（按租户管理客户用户、用户组及 API 权限） *****************************/

/** 分页查询客户用户 */
export const clientUserPage = (params: SearchParams<ClientUserPageParams>) => {
	return request.get<ClientUserPageResponse>(CLIENT_USER_PAGE, { params })
}

/** 新增客户用户（请求体带 `groupIds`；详情接口返回的是 `userGroups` 整行） */
export const clientUserCreate = (data: ClientUserCreateData) => {
	return request.post(CLIENT_USER_CREATE, data)
}

/** 修改客户用户 */
export const clientUserUpdate = (data: ClientUserUpdateData) => {
	return request.put(CLIENT_USER_UPDATE, data)
}

/** 修改客户用户备注 */
export const clientUserUpdateRemark = (data: ClientUserUpdateRemarkData) => {
	return request.put(CLIENT_USER_UPDATE_REMARK, data)
}

/** 修改客户用户状态（根据用户 ID 修改状态：1-正常，2-禁用） */
export const clientUserUpdateStatus = (data: ClientUserUpdateStatusData) => {
	return request.put(CLIENT_USER_UPDATE_STATUS, data)
}

/** 删除客户用户 */
export const clientUserDelete = (
	/** 客户用户 ID */
	id: number,
) => {
	return request.delete(CLIENT_USER_DELETE.replace('{id}', `${id}`))
}

/** 查询客户用户详情 */
export const clientUserDetail = (
	/** 客户用户 ID */
	id: number,
) => {
	return request.get<ClientUserDetailResponse>(
		CLIENT_USER_DETAIL.replace('{id}', `${id}`),
	)
}
