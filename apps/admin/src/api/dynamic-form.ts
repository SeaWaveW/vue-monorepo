export type * from './types/dynamic-form'
export * from './paths/dynamic-form'

import type { SearchParams } from './types'
import type {
	DynamicFormPageParams,
	DynamicFormPageResponse,
	DynamicFormCreateData,
	DynamicFormUpdateData,
	DynamicFormUpdateStatusData,
	DynamicFormUpdateSchemaData,
	DynamicFormUpdateRemarkData,
	DynamicFormDetailResponse,
} from './types/dynamic-form'
import { request } from '#/axios'
import {
	DYNAMIC_FORM_PAGE,
	DYNAMIC_FORM_CREATE,
	DYNAMIC_FORM_UPDATE,
	DYNAMIC_FORM_UPDATE_STATUS,
	DYNAMIC_FORM_UPDATE_SCHEMA,
	DYNAMIC_FORM_UPDATE_REMARK,
	DYNAMIC_FORM_CLONE,
	DYNAMIC_FORM_DELETE,
	DYNAMIC_FORM_DETAIL,
	DYNAMIC_FORM_IS_USED,
} from './paths/dynamic-form'

/***************************** 动态表单管理（管理动态表单基本信息和表单结构） *****************************/

/** 分页查询动态表单 */
export const dynamicFormPage = (
	params: SearchParams<DynamicFormPageParams>,
) => {
	return request.get<DynamicFormPageResponse>(DYNAMIC_FORM_PAGE, { params })
}

/** 新增动态表单（新增基本信息，表单结构初始化为空，状态默认启用；data 为新记录 ID） */
export const dynamicFormCreate = (data: DynamicFormCreateData) => {
	return request.post<number>(DYNAMIC_FORM_CREATE, data)
}

/** 修改动态表单基本信息（仅修改名称、表单类型和备注） */
export const dynamicFormUpdate = (data: DynamicFormUpdateData) => {
	return request.put(DYNAMIC_FORM_UPDATE, data)
}

/** 修改动态表单状态（仅修改启用状态：1-启用，2-禁用） */
export const dynamicFormUpdateStatus = (data: DynamicFormUpdateStatusData) => {
	return request.put(DYNAMIC_FORM_UPDATE_STATUS, data)
}

/** 修改动态表单结构（仅修改 schema_json 和面板宽等级） */
export const dynamicFormUpdateSchema = (data: DynamicFormUpdateSchemaData) => {
	return request.put(DYNAMIC_FORM_UPDATE_SCHEMA, data)
}

/** 修改动态表单备注（仅修改备注，不修改其他字段） */
export const dynamicFormUpdateRemark = (data: DynamicFormUpdateRemarkData) => {
	return request.put(DYNAMIC_FORM_UPDATE_REMARK, data)
}

/** 克隆动态表单（复制业务字段，状态设为启用，审计信息按当前用户重新生成） */
export const dynamicFormClone = (
	/** 待克隆的动态表单 ID */
	id: number,
) => {
	return request.post<number>(DYNAMIC_FORM_CLONE.replace('{id}', `${id}`))
}

/** 删除动态表单 */
export const dynamicFormDelete = (
	/** 动态表单 ID */
	id: number,
) => {
	return request.delete(DYNAMIC_FORM_DELETE.replace('{id}', `${id}`))
}

/** 查询动态表单详情 */
export const dynamicFormDetail = (
	/** 动态表单 ID */
	id: number,
) => {
	return request.get<DynamicFormDetailResponse>(
		DYNAMIC_FORM_DETAIL.replace('{id}', `${id}`),
	)
}

/** 判断动态表单是否被使用 */
export const dynamicFormIsUsed = (
	/** 动态表单 ID */
	id: number,
) => {
	return request.get<boolean>(DYNAMIC_FORM_IS_USED.replace('{id}', `${id}`))
}
