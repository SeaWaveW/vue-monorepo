import type { SearchResponse } from './index'
import type { FormTypeDeleteStatus } from '@/enum/form-type/delete-status'

/** 分页查询表单类型（参数；不含 pageNum/pageSize，由 SearchParams / 列表 hook 交叉） */
export interface FormTypePageParams {
	/** 类型名称，支持模糊查询 */
	name?: string

	/** 备注，支持模糊查询 */
	remark?: string
}

/** 分页查询表单类型 / 查询所有表单类型（行） */
export interface FormTypePageRecord {
	/** 表单类型 ID */
	id: number

	/** 类型名称 */
	name: string

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
	deleteStatus?: FormTypeDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}

/** 分页查询表单类型（响应） */
export type FormTypePageResponse = SearchResponse<FormTypePageRecord>

/** 查询所有表单类型（响应）。用于下拉框选择 */
export type FormTypeAllResponse = FormTypePageRecord[]

/** 新增表单类型（参数） */
export interface FormTypeCreateData {
	/** 类型名称 */
	name: string

	/** 备注 */
	remark?: string
}

/** 修改表单类型（参数） */
export interface FormTypeUpdateData {
	/** 表单类型 ID */
	id: number

	/** 类型名称 */
	name?: string

	/** 备注 */
	remark?: string
}

/** 根据 ID 修改表单类型备注（参数） */
export interface FormTypeUpdateRemarkData {
	/** 表单类型 ID */
	id: number

	/** 备注，未传、null 或空白字符串时置为数据库 NULL */
	remark?: string
}

/** 查询表单类型详情（响应） */
export type FormTypeDetailResponse = FormTypePageRecord
