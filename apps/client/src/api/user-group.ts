export type * from './types/user-group'
export * from './paths/user-group'

import type { SearchParams } from './types'
import type {
	ClientUserGroupPageParams,
	ClientUserGroupPageResponse,
	ClientUserGroupCreateData,
	ClientUserGroupUpdateData,
	ClientUserGroupUpdateRemarkData,
	ClientUserGroupDetailResponse,
} from './types/user-group'
import { request } from '#/axios'
import {
	CLIENT_USER_GROUP_PAGE,
	CLIENT_USER_GROUP_CREATE,
	CLIENT_USER_GROUP_UPDATE,
	CLIENT_USER_GROUP_UPDATE_REMARK,
	CLIENT_USER_GROUP_DELETE,
	CLIENT_USER_GROUP_DETAIL,
} from './paths/user-group'

/***************************** 用户组管理（管理当前租户的客户端用户组及导航、功能授权） *****************************/

/** 分页查询用户组 */
export const clientUserGroupPage = (
	params: SearchParams<ClientUserGroupPageParams>,
) => {
	return request.get<ClientUserGroupPageResponse>(CLIENT_USER_GROUP_PAGE, {
		params,
	})
}

/** 新增用户组（在当前租户新增用户组并建立导航、功能授权） */
export const clientUserGroupCreate = (data: ClientUserGroupCreateData) => {
	return request.post(CLIENT_USER_GROUP_CREATE, data)
}

/** 修改用户组（修改当前租户用户组并替换全部导航、功能授权） */
export const clientUserGroupUpdate = (data: ClientUserGroupUpdateData) => {
	return request.put(CLIENT_USER_GROUP_UPDATE, data)
}

/** 修改用户组备注（仅修改当前租户用户组的备注） */
export const clientUserGroupUpdateRemark = (
	data: ClientUserGroupUpdateRemarkData,
) => {
	return request.put(CLIENT_USER_GROUP_UPDATE_REMARK, data)
}

/** 删除用户组 */
export const clientUserGroupDelete = (
	/** 用户组 ID */
	id: number,
) => {
	return request.delete(CLIENT_USER_GROUP_DELETE.replace('{id}', `${id}`))
}

/** 查询用户组详情（查询当前租户用户组的基本信息和导航、功能授权） */
export const clientUserGroupDetail = (
	/** 用户组 ID */
	id: number,
) => {
	return request.get<ClientUserGroupDetailResponse>(
		CLIENT_USER_GROUP_DETAIL.replace('{id}', `${id}`),
	)
}
