export type * from './types/dynamic-form'
export * from './paths/dynamic-form'

import type { DynamicFormDetailResponse } from './types/dynamic-form'
import { DYNAMIC_FORM_DETAIL } from './paths/dynamic-form'
import { request } from '#/axios'

/***************************** 动态表单管理（管理动态表单基本信息和表单结构） *****************************/

/** 查询动态表单详情（根据动态表单 ID 查询基本信息和表单结构） */
export const dynamicFormDetail = (
	/** 动态表单 ID */
	id: number,
) => {
	return request.get<DynamicFormDetailResponse>(
		DYNAMIC_FORM_DETAIL.replace('{id}', `${id}`),
	)
}
