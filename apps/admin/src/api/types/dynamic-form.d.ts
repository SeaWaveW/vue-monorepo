import type { SearchResponse } from './index'
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

/** 分页查询动态表单（参数；不含 pageNum/pageSize，由 SearchParams / 列表 hook 交叉） */
export interface DynamicFormPageParams {
	/** 动态表单名称，支持模糊查询 */
	name?: string

	/** 状态：1-启用，2-禁用 */
	status?: DynamicFormStatus

	/** 表单类型 ID */
	formTypeId?: number

	/** 草稿状态：1-草稿，2-正式 */
	isDraft?: DynamicFormIsDraft

	/** 备注，支持模糊查询 */
	remark?: string
}

/** 分页查询动态表单 / 详情（行） */
export interface DynamicFormPageRecord {
	/** 动态表单 ID */
	id: number

	/** 动态表单名称 */
	name: string

	/** 表单类型 ID */
	formTypeId: number

	/** 表单类型名称 */
	formTypeName?: string

	/** 表单结构 JSON */
	schemaJson?: DynamicFormSchemaJson

	/** 面板宽等级：1-5 */
	widthLevel?: DynamicFormWidthLevel

	/** 状态：1-启用，2-禁用 */
	status: DynamicFormStatus

	/** 草稿状态：1-草稿，2-正式 */
	isDraft: DynamicFormIsDraft

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

/** 分页查询动态表单（响应） */
export type DynamicFormPageResponse = SearchResponse<DynamicFormPageRecord>

/** 新增动态表单（参数） */
export interface DynamicFormCreateData {
	/** 动态表单名称 */
	name: string

	/** 表单类型 ID */
	formTypeId: number

	/** 备注 */
	remark?: string
}

/** 修改动态表单基本信息（参数） */
export interface DynamicFormUpdateData {
	/** 动态表单 ID */
	id: number

	/** 动态表单名称 */
	name: string

	/** 表单类型 ID */
	formTypeId: number

	/** 备注 */
	remark?: string
}

/** 修改动态表单状态（参数） */
export interface DynamicFormUpdateStatusData {
	/** 动态表单 ID */
	id: number

	/** 状态：1-启用，2-禁用 */
	status: DynamicFormStatus
}

/** 修改动态表单结构（参数） */
export interface DynamicFormUpdateSchemaData {
	/** 动态表单 ID */
	id: number

	/** 表单结构 JSON */
	schemaJson: DynamicFormSchemaJson

	/** 面板宽等级：1-5 */
	widthLevel: DynamicFormWidthLevel
}

/** 修改动态表单备注（参数） */
export interface DynamicFormUpdateRemarkData {
	/** 动态表单 ID */
	id: number

	/** 备注，未传、null 或空白字符串时置为数据库 NULL */
	remark?: string
}

/** 查询动态表单详情（响应） */
export type DynamicFormDetailResponse = DynamicFormPageRecord
