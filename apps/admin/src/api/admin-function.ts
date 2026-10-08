export type * from './types/admin-function'
export * from './paths/admin-function'

import type { SearchParams } from './types'
import type {
	AdminFunctionPageParams,
	AdminFunctionPageResponse,
	AdminFunctionCreateData,
	AdminFunctionUpdateData,
	AdminFunctionUpdateRemarkData,
	AdminFunctionDetailResponse,
} from './types/admin-function'
import { request } from '#/axios'
import {
	ADMIN_FUNCTION_PAGE,
	ADMIN_FUNCTION_CREATE,
	ADMIN_FUNCTION_UPDATE,
	ADMIN_FUNCTION_UPDATE_REMARK,
	ADMIN_FUNCTION_DELETE,
	ADMIN_FUNCTION_DETAIL,
} from './paths/admin-function'

/***************************** 功能管理（管理后台系统的功能及其 API 资源关联） *****************************/

/** 分页查询功能 */
export const adminFunctionPage = (
	params: SearchParams<AdminFunctionPageParams>,
) => {
	return request.get<AdminFunctionPageResponse>(ADMIN_FUNCTION_PAGE, {
		params,
	})
}

/** 新增功能（请求体带 `apiIds`；详情接口返回的是 `apis` 整行） */
export const adminFunctionCreate = (data: AdminFunctionCreateData) => {
	return request.post(ADMIN_FUNCTION_CREATE, data)
}

/** 修改功能 */
export const adminFunctionUpdate = (data: AdminFunctionUpdateData) => {
	return request.put(ADMIN_FUNCTION_UPDATE, data)
}

/** 根据 ID 修改功能备注（仅修改备注，不修改功能的其他字段及 API 关联关系） */
export const adminFunctionUpdateRemark = (
	data: AdminFunctionUpdateRemarkData,
) => {
	return request.put(ADMIN_FUNCTION_UPDATE_REMARK, data)
}

/** 删除功能 */
export const adminFunctionDelete = (
	/** 功能 ID */
	id: number,
) => {
	return request.delete(ADMIN_FUNCTION_DELETE.replace('{id}', `${id}`))
}

/** 查询功能详情 */
export const adminFunctionDetail = (
	/** 功能 ID */
	id: number,
) => {
	return request.get<AdminFunctionDetailResponse>(
		ADMIN_FUNCTION_DETAIL.replace('{id}', `${id}`),
	)
}
