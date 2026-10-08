export type * from './types/admin-api'
export * from './paths/admin-api'

import type { SearchParams } from './types'
import type {
	AdminApiPageParams,
	AdminApiPageResponse,
	AdminApiCreateData,
	AdminApiUpdateData,
	AdminApiUpdateRemarkData,
	AdminApiDetailResponse,
} from './types/admin-api'
import { request } from '#/axios'
import {
	ADMIN_API_PAGE,
	ADMIN_API_CREATE,
	ADMIN_API_UPDATE,
	ADMIN_API_UPDATE_REMARK,
	ADMIN_API_DELETE,
	ADMIN_API_DETAIL,
} from './paths/admin-api'

/***************************** API 资源管理（管理后台系统的 API 资源） *****************************/

/** 分页查询 API 资源 */
export const adminApiPage = (params: SearchParams<AdminApiPageParams>) => {
	return request.get<AdminApiPageResponse>(ADMIN_API_PAGE, { params })
}

/** 新增 API 资源 */
export const adminApiCreate = (data: AdminApiCreateData) => {
	return request.post(ADMIN_API_CREATE, data)
}

/** 修改 API 资源 */
export const adminApiUpdate = (data: AdminApiUpdateData) => {
	return request.put(ADMIN_API_UPDATE, data)
}

/** 根据 ID 修改 API 资源备注（仅修改备注，不修改 API 资源的其他字段） */
export const adminApiUpdateRemark = (data: AdminApiUpdateRemarkData) => {
	return request.put(ADMIN_API_UPDATE_REMARK, data)
}

/** 删除 API 资源 */
export const adminApiDelete = (
	/** API 资源 ID */
	id: number,
) => {
	return request.delete(ADMIN_API_DELETE.replace('{id}', `${id}`))
}

/** 查询 API 资源详情 */
export const adminApiDetail = (
	/** API 资源 ID */
	id: number,
) => {
	return request.get<AdminApiDetailResponse>(
		ADMIN_API_DETAIL.replace('{id}', `${id}`),
	)
}
