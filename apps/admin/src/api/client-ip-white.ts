export type * from './types/client-ip-white'
export * from './paths/client-ip-white'

import type { SearchParams } from './types'
import type {
	ClientIpWhitePageParams,
	ClientIpWhitePageResponse,
	ClientIpWhiteCreateData,
	ClientIpWhiteUpdateData,
	ClientIpWhiteUpdateStatusData,
	ClientIpWhiteUpdateRemarkData,
	ClientIpWhiteDetailResponse,
} from './types/client-ip-white'
import { request } from '#/axios'
import {
	CLIENT_IP_WHITE_PAGE,
	CLIENT_IP_WHITE_CREATE,
	CLIENT_IP_WHITE_UPDATE,
	CLIENT_IP_WHITE_UPDATE_STATUS,
	CLIENT_IP_WHITE_UPDATE_REMARK,
	CLIENT_IP_WHITE_CLONE,
	CLIENT_IP_WHITE_DELETE,
	CLIENT_IP_WHITE_DETAIL,
} from './paths/client-ip-white'

/***************************** 客户 IP 白名单管理（按客户主体管理客户端 IP 白名单） *****************************/

/** 分页查询客户 IP 白名单 */
export const clientIpWhitePage = (
	params: SearchParams<ClientIpWhitePageParams>,
) => {
	return request.get<ClientIpWhitePageResponse>(CLIENT_IP_WHITE_PAGE, {
		params,
	})
}

/** 新增客户 IP 白名单 */
export const clientIpWhiteCreate = (data: ClientIpWhiteCreateData) => {
	return request.post(CLIENT_IP_WHITE_CREATE, data)
}

/** 修改客户 IP 白名单（根据记录 ID 修改 IP、所属客户、备注或状态） */
export const clientIpWhiteUpdate = (data: ClientIpWhiteUpdateData) => {
	return request.put(CLIENT_IP_WHITE_UPDATE, data)
}

/** 修改客户 IP 白名单状态（根据记录 ID 修改启用状态：1-启用，2-禁用） */
export const clientIpWhiteUpdateStatus = (
	data: ClientIpWhiteUpdateStatusData,
) => {
	return request.put(CLIENT_IP_WHITE_UPDATE_STATUS, data)
}

/** 修改客户 IP 白名单备注（根据记录 ID 仅修改备注） */
export const clientIpWhiteUpdateRemark = (
	data: ClientIpWhiteUpdateRemarkData,
) => {
	return request.put(CLIENT_IP_WHITE_UPDATE_REMARK, data)
}

/** 克隆客户 IP 白名单 */
export const clientIpWhiteClone = (
	/** 待克隆的客户 IP 白名单记录 ID */
	id: number,
) => {
	return request.post<number>(CLIENT_IP_WHITE_CLONE.replace('{id}', `${id}`))
}

/** 删除客户 IP 白名单 */
export const clientIpWhiteDelete = (
	/** 客户 IP 白名单记录 ID */
	id: number,
) => {
	return request.delete(CLIENT_IP_WHITE_DELETE.replace('{id}', `${id}`))
}

/** 查询客户 IP 白名单详情 */
export const clientIpWhiteDetail = (
	/** 客户 IP 白名单记录 ID */
	id: number,
) => {
	return request.get<ClientIpWhiteDetailResponse>(
		CLIENT_IP_WHITE_DETAIL.replace('{id}', `${id}`),
	)
}
