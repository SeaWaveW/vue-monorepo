export type * from './types/client-function'
export * from './paths/client-function'

import type { SearchParams } from './types'
import type {
	ClientFunctionPageParams,
	ClientFunctionPageResponse,
	ClientFunctionCreateData,
	ClientFunctionUpdateData,
	ClientFunctionUpdateRemarkData,
	ClientFunctionDetailResponse,
} from './types/client-function'
import { request } from '#/axios'
import {
	CLIENT_FUNCTION_PAGE,
	CLIENT_FUNCTION_CREATE,
	CLIENT_FUNCTION_UPDATE,
	CLIENT_FUNCTION_UPDATE_REMARK,
	CLIENT_FUNCTION_DELETE,
	CLIENT_FUNCTION_DETAIL,
} from './paths/client-function'

/***************************** 客户端功能管理（管理客户端系统的功能及其 API 资源关联） *****************************/

/** 分页查询客户端功能 */
export const clientFunctionPage = (
	params: SearchParams<ClientFunctionPageParams>,
) => {
	return request.get<ClientFunctionPageResponse>(CLIENT_FUNCTION_PAGE, {
		params,
	})
}

/** 新增客户端功能（请求体带 `apiIds`；详情接口返回的是 `apis` 整行） */
export const clientFunctionCreate = (data: ClientFunctionCreateData) => {
	return request.post(CLIENT_FUNCTION_CREATE, data)
}

/** 修改客户端功能 */
export const clientFunctionUpdate = (data: ClientFunctionUpdateData) => {
	return request.put(CLIENT_FUNCTION_UPDATE, data)
}

/** 根据 ID 修改客户端功能备注（仅修改备注，不修改功能的其他字段及 API 关联关系） */
export const clientFunctionUpdateRemark = (
	data: ClientFunctionUpdateRemarkData,
) => {
	return request.put(CLIENT_FUNCTION_UPDATE_REMARK, data)
}

/** 删除客户端功能 */
export const clientFunctionDelete = (
	/** 客户端功能 ID */
	id: number,
) => {
	return request.delete(CLIENT_FUNCTION_DELETE.replace('{id}', `${id}`))
}

/** 查询客户端功能详情 */
export const clientFunctionDetail = (
	/** 客户端功能 ID */
	id: number,
) => {
	return request.get<ClientFunctionDetailResponse>(
		CLIENT_FUNCTION_DETAIL.replace('{id}', `${id}`),
	)
}
