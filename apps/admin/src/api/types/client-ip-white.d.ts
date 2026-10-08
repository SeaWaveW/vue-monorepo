import type { SearchResponse } from './index'
import type { ClientIpWhiteStatus } from '@/enum/client-ip-white/status'

/** 分页查询客户 IP 白名单（参数；不含 pageNum/pageSize，由 SearchParams / 列表 hook 交叉） */
export interface ClientIpWhitePageParams {
	/** IP 地址，支持模糊查询 */
	ip?: string

	/** 所属租户 ID */
	tenantId?: number

	/** 状态：1-启用，2-禁用 */
	status?: ClientIpWhiteStatus

	/** 备注，支持模糊查询 */
	remark?: string
}

/** 分页查询客户 IP 白名单（行） */
export interface ClientIpWhitePageRecord {
	/** 记录 ID */
	id: number

	/** IP 地址或网段 */
	ip: string

	/** 所属租户 ID */
	tenantId?: number

	/** 所属客户主体名称 */
	tenantName?: string

	/** 备注 */
	remark?: string

	/** 状态：1-启用，2-禁用 */
	status: ClientIpWhiteStatus

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
	deleteStatus?: number

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}

/** 分页查询客户 IP 白名单（响应） */
export type ClientIpWhitePageResponse = SearchResponse<ClientIpWhitePageRecord>

/** 新增客户 IP 白名单（参数） */
export interface ClientIpWhiteCreateData {
	/** 允许访问客户端的 IP 地址或网段 */
	ip: string

	/** 所属租户 ID */
	tenantId: number

	/** 白名单备注 */
	remark?: string
}

/** 修改客户 IP 白名单（参数） */
export interface ClientIpWhiteUpdateData {
	/** 客户 IP 白名单记录 ID */
	id: number

	/** 允许访问客户端的 IP 地址或网段 */
	ip?: string

	/** 所属租户 ID */
	tenantId?: number

	/** 白名单备注 */
	remark?: string

	/** 状态：1-启用，2-禁用 */
	status?: ClientIpWhiteStatus
}

/** 修改客户 IP 白名单状态（参数） */
export interface ClientIpWhiteUpdateStatusData {
	/** 客户 IP 白名单记录 ID */
	id: number

	/** 状态：1-启用，2-禁用 */
	status: ClientIpWhiteStatus
}

/** 修改客户 IP 白名单备注（参数） */
export interface ClientIpWhiteUpdateRemarkData {
	/** 客户 IP 白名单记录 ID */
	id: number

	/** 白名单备注，未传、null 或空白字符串时置为数据库 NULL */
	remark?: string
}

/** 客户 IP 白名单详情（响应） */
export interface ClientIpWhiteDetailResponse {
	/** 记录 ID */
	id: number

	/** IP 地址或网段 */
	ip: string

	/** 所属租户 ID */
	tenantId?: number

	/** 所属客户主体名称 */
	tenantName?: string

	/** 备注 */
	remark?: string

	/** 状态：1-启用，2-禁用 */
	status: ClientIpWhiteStatus

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
	deleteStatus?: number

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}
