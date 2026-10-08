import type { SearchResponse } from './index'
import type { ClientTenantType } from '@/enum/client-tenant/type'
import type { ClientTenantStatus } from '@/enum/client-tenant/status'
import type { ClientTenantDeleteStatus } from '@/enum/client-tenant/delete-status'

/** 分页查询租户（参数；不含 pageNum/pageSize，由 SearchParams / 列表 hook 交叉） */
export interface ClientTenantPageParams {
	/** 主体名称/公司名称，支持模糊查询 */
	name?: string

	/** 类型：1-数据设置主体，2-客户主体 */
	type?: ClientTenantType

	/** 地址，支持模糊查询 */
	address?: string

	/** 备注，支持模糊查询 */
	remark?: string

	/** 状态：1-启用，2-禁用 */
	status?: ClientTenantStatus
}

/** 分页查询租户 / 查询所有客户（行） */
export interface ClientTenantPageRecord {
	/** 租户 ID */
	id: number

	/** 主体名称/公司名称 */
	name: string

	/** 类型：1-数据设置主体，2-客户主体 */
	type?: ClientTenantType

	/** 使用有效时间戳，单位：毫秒 */
	validUntil?: number

	/** 地址 */
	address?: string

	/** 备注 */
	remark?: string

	/** 状态：1-启用，2-禁用 */
	status?: ClientTenantStatus

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
	deleteStatus?: ClientTenantDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}

/** 分页查询租户（响应） */
export type ClientTenantPageResponse = SearchResponse<ClientTenantPageRecord>

/** 查询所有客户（响应）。用于下拉框选择客户 */
export type ClientTenantAllResponse = ClientTenantPageRecord[]

/** 新增租户（参数） */
export interface ClientTenantCreateData {
	/** 主体名称/公司名称 */
	name: string

	/** 类型：1-数据设置主体，2-客户主体 */
	type: ClientTenantType

	/** 使用有效时间戳，单位：毫秒 */
	validUntil?: number

	/** 地址 */
	address?: string

	/** 备注 */
	remark?: string
}

/** 修改租户（参数） */
export interface ClientTenantUpdateData {
	/** 租户 ID */
	id: number

	/** 主体名称/公司名称 */
	name?: string

	/** 类型：1-数据设置主体，2-客户主体 */
	type?: ClientTenantType

	/** 使用有效时间戳，单位：毫秒 */
	validUntil?: number

	/** 地址 */
	address?: string

	/** 备注 */
	remark?: string

	/** 状态：1-启用，2-禁用 */
	status?: ClientTenantStatus
}

/** 修改租户状态（参数） */
export interface ClientTenantUpdateStatusData {
	/** 租户 ID */
	id: number

	/** 状态：1-启用，2-禁用 */
	status: ClientTenantStatus
}

/** 根据 ID 修改租户备注（参数） */
export interface ClientTenantUpdateRemarkData {
	/** 租户 ID */
	id: number

	/** 租户备注，未传、null 或空白字符串时置为数据库 NULL */
	remark?: string
}

/** 查询租户详情（响应） */
export interface ClientTenantDetailResponse {
	/** 租户 ID */
	id: number

	/** 主体名称/公司名称 */
	name: string

	/** 类型：1-数据设置主体，2-客户主体 */
	type?: ClientTenantType

	/** 使用有效时间戳，单位：毫秒 */
	validUntil?: number

	/** 地址 */
	address?: string

	/** 备注 */
	remark?: string

	/** 状态：1-启用，2-禁用 */
	status?: ClientTenantStatus

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
	deleteStatus?: ClientTenantDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}
