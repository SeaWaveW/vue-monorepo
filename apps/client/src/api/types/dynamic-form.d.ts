import type { ComponentItem } from '#/dynamic'
import type { DynamicFormStatus } from '@/api/enum/dynamic-form/status'
import type { DynamicFormIsDraft } from '@/api/enum/dynamic-form/is-draft'
import type { DynamicFormWidthLevel } from '@/api/enum/dynamic-form/width-level'
import type { DynamicFormDeleteStatus } from '@/api/enum/dynamic-form/delete-status'

/** 表单结构 JSON（后台 JsonNode，对象不是字符串） */
export interface DynamicFormSchemaJson {
	/** 组件列表 */
	components?: ComponentItem[]
}

/** 查询动态表单详情（响应；审核 Agent 详情也会嵌这一份） */
export interface DynamicFormDetailResponse {
	/** 动态表单 ID */
	id: number

	/** 动态表单名称 */
	name: string

	/** 表单类型 ID */
	formTypeId?: number

	/** 表单类型名称 */
	formTypeName?: string

	/** 表单结构 JSON */
	schemaJson?: DynamicFormSchemaJson

	/** 面板宽等级：1-5 */
	widthLevel?: DynamicFormWidthLevel

	/** 状态：1-启用，2-禁用 */
	status?: DynamicFormStatus

	/** 草稿状态：1-草稿，2-正式 */
	isDraft?: DynamicFormIsDraft

	/** 备注 */
	remark?: string

	/** 创建人 ID */
	createUserId?: number

	/** 创建人姓名 */
	createUserName?: string

	/** 创建时间戳，单位：毫秒 */
	createTime?: number

	/** 最后编辑人 ID */
	editUserId?: number

	/** 最后编辑人姓名 */
	editUserName?: string

	/** 最后编辑时间戳，单位：毫秒 */
	editTime?: number

	/** 删除状态：1-未删除，2-已删除 */
	deleteStatus?: DynamicFormDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}

/** 动态表单输入数据（后台 JsonNode，对象不是字符串） */
export interface DynamicFormInputDataJson {
	[fieldId: string]: any
}

/** 动态表单填写数据（审核记录详情会嵌这一份） */
export interface DynamicFormDataRecord {
	/** 动态表单数据 ID */
	id?: number

	/** 动态表单 ID */
	dynamicFormId?: number

	/** 表单输入数据 JSON */
	inputDataJson?: DynamicFormInputDataJson

	/** 租户 ID */
	tenantId?: number

	/** 创建人 ID */
	createUserId?: number

	/** 创建人姓名 */
	createUserName?: string

	/** 创建时间戳，单位：毫秒 */
	createTime?: number

	/** 最后编辑人 ID */
	editUserId?: number

	/** 最后编辑人姓名 */
	editUserName?: string

	/** 最后编辑时间戳，单位：毫秒 */
	editTime?: number

	/** 删除状态：1-未删除，2-已删除 */
	deleteStatus?: DynamicFormDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}
