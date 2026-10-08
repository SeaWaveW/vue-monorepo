export type * from './types/form-type'
export * from './paths/form-type'

import type { SearchParams } from './types'
import type {
	FormTypePageParams,
	FormTypePageResponse,
	FormTypeAllResponse,
	FormTypeCreateData,
	FormTypeUpdateData,
	FormTypeUpdateRemarkData,
	FormTypeDetailResponse,
} from './types/form-type'
import { request } from '#/axios'
import {
	FORM_TYPE_PAGE,
	FORM_TYPE_ALL,
	FORM_TYPE_CREATE,
	FORM_TYPE_UPDATE,
	FORM_TYPE_UPDATE_REMARK,
	FORM_TYPE_DELETE,
	FORM_TYPE_DETAIL,
} from './paths/form-type'

/***************************** 表单类型管理（管理表单类型） *****************************/

/** 分页查询表单类型 */
export const formTypePage = (params: SearchParams<FormTypePageParams>) => {
	return request.get<FormTypePageResponse>(FORM_TYPE_PAGE, { params })
}

/** 查询所有表单类型（查询全部未删除的表单类型，用于下拉框选择） */
export const formTypeAll = () => {
	return request.get<FormTypeAllResponse>(FORM_TYPE_ALL)
}

/** 新增表单类型 */
export const formTypeCreate = (data: FormTypeCreateData) => {
	return request.post(FORM_TYPE_CREATE, data)
}

/** 修改表单类型 */
export const formTypeUpdate = (data: FormTypeUpdateData) => {
	return request.put(FORM_TYPE_UPDATE, data)
}

/** 根据 ID 修改表单类型备注（仅修改备注，不修改表单类型的其他字段） */
export const formTypeUpdateRemark = (data: FormTypeUpdateRemarkData) => {
	return request.put(FORM_TYPE_UPDATE_REMARK, data)
}

/** 删除表单类型 */
export const formTypeDelete = (
	/** 表单类型 ID */
	id: number,
) => {
	return request.delete(FORM_TYPE_DELETE.replace('{id}', `${id}`))
}

/** 查询表单类型详情 */
export const formTypeDetail = (
	/** 表单类型 ID */
	id: number,
) => {
	return request.get<FormTypeDetailResponse>(
		FORM_TYPE_DETAIL.replace('{id}', `${id}`),
	)
}
