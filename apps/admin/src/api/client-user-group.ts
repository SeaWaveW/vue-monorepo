export type * from './types/client-user-group'
export * from './paths/client-user-group'

import type { SearchParams } from './types'
import type {
	ClientUserGroupPageParams,
	ClientUserGroupPageResponse,
	ClientUserGroupCreateData,
	ClientUserGroupUpdateData,
	ClientUserGroupUpdateRemarkData,
	ClientUserGroupDetailResponse,
} from './types/client-user-group'
import { request } from '#/axios'
import {
	CLIENT_USER_GROUP_PAGE,
	CLIENT_USER_GROUP_CREATE,
	CLIENT_USER_GROUP_UPDATE,
	CLIENT_USER_GROUP_UPDATE_REMARK,
	CLIENT_USER_GROUP_DELETE,
	CLIENT_USER_GROUP_DETAIL,
} from './paths/client-user-group'

/***************************** 客户用户组管理（管理按租户区分的客户用户组及其导航与功能授权） *****************************/

/** 分页查询客户用户组 */
export const clientUserGroupPage = (
	params: SearchParams<ClientUserGroupPageParams>,
) => {
	return request.get<ClientUserGroupPageResponse>(CLIENT_USER_GROUP_PAGE, {
		params,
	})
}

/** 新增客户用户组 */
export const clientUserGroupCreate = (data: ClientUserGroupCreateData) => {
	return request.post(CLIENT_USER_GROUP_CREATE, data)
}

/** 修改客户用户组 */
export const clientUserGroupUpdate = (data: ClientUserGroupUpdateData) => {
	return request.put(CLIENT_USER_GROUP_UPDATE, data)
}

/** 修改客户用户组备注 */
export const clientUserGroupUpdateRemark = (
	data: ClientUserGroupUpdateRemarkData,
) => {
	return request.put(CLIENT_USER_GROUP_UPDATE_REMARK, data)
}

/** 删除客户用户组 */
export const clientUserGroupDelete = (
	/** 客户用户组 ID */
	id: number,
) => {
	return request.delete(CLIENT_USER_GROUP_DELETE.replace('{id}', `${id}`))
}

/** 查询客户用户组详情 */
export const clientUserGroupDetail = (
	/** 客户用户组 ID */
	id: number,
) => {
	return request.get<ClientUserGroupDetailResponse>(
		CLIENT_USER_GROUP_DETAIL.replace('{id}', `${id}`),
	)
}
