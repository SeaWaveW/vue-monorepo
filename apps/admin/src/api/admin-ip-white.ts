export type * from './types/admin-ip-white'
export * from './paths/admin-ip-white'

import type { SearchParams } from './types'
import type {
	AdminIpWhitePageParams,
	AdminIpWhitePageResponse,
	AdminIpWhiteCreateData,
	AdminIpWhiteUpdateData,
	AdminIpWhiteUpdateStatusData,
	AdminIpWhiteUpdateRemarkData,
	AdminIpWhiteDetailResponse,
} from './types/admin-ip-white'
import { request } from '#/axios'
import {
	ADMIN_IP_WHITE_PAGE,
	ADMIN_IP_WHITE_CREATE,
	ADMIN_IP_WHITE_UPDATE,
	ADMIN_IP_WHITE_UPDATE_STATUS,
	ADMIN_IP_WHITE_UPDATE_REMARK,
	ADMIN_IP_WHITE_CLONE,
	ADMIN_IP_WHITE_DELETE,
	ADMIN_IP_WHITE_DETAIL,
} from './paths/admin-ip-white'

/***************************** IP 白名单管理（管理允许登录后台系统的 IP 地址） *****************************/

/** 分页查询 IP 白名单（按照 IP 地址和状态分页查询白名单记录） */
export const adminIpWhitePage = (
	params: SearchParams<AdminIpWhitePageParams>,
) => {
	return request.get<AdminIpWhitePageResponse>(ADMIN_IP_WHITE_PAGE, {
		params,
	})
}

/** 新增 IP 白名单（新增一条允许访问后台系统的 IP 白名单记录） */
export const adminIpWhiteCreate = (data: AdminIpWhiteCreateData) => {
	return request.post(ADMIN_IP_WHITE_CREATE, data)
}

/** 修改 IP 白名单（根据记录 ID 修改 IP 地址、备注或启用状态） */
export const adminIpWhiteUpdate = (data: AdminIpWhiteUpdateData) => {
	return request.put(ADMIN_IP_WHITE_UPDATE, data)
}

/** 修改 IP 白名单状态（根据记录 ID 修改启用状态：1-启用，2-禁用，并更新编辑审计信息） */
export const adminIpWhiteUpdateStatus = (
	data: AdminIpWhiteUpdateStatusData,
) => {
	return request.put(ADMIN_IP_WHITE_UPDATE_STATUS, data)
}

/** 根据 ID 修改 IP 白名单备注（仅修改备注，不修改 IP 白名单的其他字段） */
export const adminIpWhiteUpdateRemark = (
	data: AdminIpWhiteUpdateRemarkData,
) => {
	return request.put(ADMIN_IP_WHITE_UPDATE_REMARK, data)
}

/** 克隆 IP 白名单（根据记录 ID 克隆一条 IP 白名单记录，审计信息按当前用户重新生成） */
export const adminIpWhiteClone = (
	/** 待克隆的 IP 白名单记录 ID */
	id: number,
) => {
	// 响应 data 为新记录 ID（ResultLong）
	return request.post<number>(ADMIN_IP_WHITE_CLONE.replace('{id}', `${id}`))
}

/** 删除 IP 白名单（根据记录 ID 删除一条 IP 白名单记录） */
export const adminIpWhiteDelete = (
	/** IP 白名单记录 ID */
	id: number,
) => {
	return request.delete(ADMIN_IP_WHITE_DELETE.replace('{id}', `${id}`))
}

/** 查询 IP 白名单详情（根据记录 ID 查询一条 IP 白名单记录） */
export const adminIpWhiteDetail = (
	/** IP 白名单记录 ID */
	id: number,
) => {
	// swagger 为 path 参数，常量保留 `{id}` 给权限比对，请求时再填值
	return request.get<AdminIpWhiteDetailResponse>(
		ADMIN_IP_WHITE_DETAIL.replace('{id}', `${id}`),
	)
}
