export type * from './types/client-api'
export * from './paths/client-api'

import type { SearchParams } from './types'
import type {
	ClientApiPageParams,
	ClientApiPageResponse,
	ClientApiCreateData,
	ClientApiUpdateData,
	ClientApiUpdateRemarkData,
	ClientApiDetailResponse,
} from './types/client-api'
import { request } from '#/axios'
import {
	CLIENT_API_PAGE,
	CLIENT_API_CREATE,
	CLIENT_API_UPDATE,
	CLIENT_API_UPDATE_REMARK,
	CLIENT_API_DELETE,
	CLIENT_API_DETAIL,
} from './paths/client-api'

/***************************** 客户端 API 资源管理（管理客户端系统的 API 资源） *****************************/

/** 分页查询客户端 API 资源 */
export const clientApiPage = (params: SearchParams<ClientApiPageParams>) => {
	return request.get<ClientApiPageResponse>(CLIENT_API_PAGE, { params })
}

/** 新增客户端 API 资源 */
export const clientApiCreate = (data: ClientApiCreateData) => {
	return request.post(CLIENT_API_CREATE, data)
}

/** 修改客户端 API 资源 */
export const clientApiUpdate = (data: ClientApiUpdateData) => {
	return request.put(CLIENT_API_UPDATE, data)
}

/** 根据 ID 修改客户端 API 资源备注（仅修改备注，不修改客户端 API 资源的其他字段） */
export const clientApiUpdateRemark = (data: ClientApiUpdateRemarkData) => {
	return request.put(CLIENT_API_UPDATE_REMARK, data)
}

/** 删除客户端 API 资源 */
export const clientApiDelete = (
	/** 客户端 API 资源 ID */
	id: number,
) => {
	return request.delete(CLIENT_API_DELETE.replace('{id}', `${id}`))
}

/** 查询客户端 API 资源详情 */
export const clientApiDetail = (
	/** 客户端 API 资源 ID */
	id: number,
) => {
	return request.get<ClientApiDetailResponse>(
		CLIENT_API_DETAIL.replace('{id}', `${id}`),
	)
}
