import type { SearchResponse } from './index'
import type { AdminApiPageRecord } from './admin-api'
import type { AdminFunctionDeleteStatus } from '@/enum/admin-function/delete-status'

/** 分页查询功能（参数；不含 pageNum/pageSize，由 SearchParams / 列表 hook 交叉） */
export interface AdminFunctionPageParams {
	/** 功能名称，支持模糊查询 */
	name?: string

	/** 备注说明，支持模糊查询 */
	remark?: string
}

/** 分页查询功能（行） */
export interface AdminFunctionPageRecord {
	/** 功能 ID */
	id: number

	/** 功能名称 */
	name: string

	/** 备注说明 */
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
	deleteStatus?: AdminFunctionDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}

/** 分页查询功能（响应） */
export type AdminFunctionPageResponse = SearchResponse<AdminFunctionPageRecord>

/** 新增功能（参数） */
export interface AdminFunctionCreateData {
	/** 功能名称 */
	name: string

	/** 备注说明 */
	remark?: string

	/** 关联的 API 资源 ID 集合；传空集合表示不关联 API */
	apiIds: number[]
}

/** 修改功能（参数） */
export interface AdminFunctionUpdateData {
	/** 功能 ID */
	id: number

	/** 功能名称 */
	name?: string

	/** 备注说明 */
	remark?: string

	/** 关联的 API 资源 ID 集合；传空集合表示清空关联 */
	apiIds: number[]
}

/** 根据 ID 修改功能备注（参数） */
export interface AdminFunctionUpdateRemarkData {
	/** 功能 ID */
	id: number

	/** 备注说明，未传、null 或空白字符串时置为数据库 NULL */
	remark?: string
}

/** 查询功能详情（响应）。GET 返回关联 API 整行 `apis`，不是 `apiIds` */
export interface AdminFunctionDetailResponse {
	/** 功能 ID */
	id: number

	/** 功能名称 */
	name: string

	/** 备注说明 */
	remark?: string

	/** 功能关联的 API 资源集合；无关联时为空数组 */
	apis: AdminApiPageRecord[]

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
	deleteStatus?: AdminFunctionDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}
