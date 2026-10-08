import type { SearchResponse } from './index'
import type { AdminIpWhiteStatus } from '@/enum/admin-ip-white/status'

/** 分页查询 IP 白名单（参数；不含 pageNum/pageSize，由 SearchParams / 列表 hook 交叉） */
export interface AdminIpWhitePageParams {
	/** IP 地址，支持模糊查询 */
	ip?: string

	/** 状态：1-启用，2-禁用 */
	status?: AdminIpWhiteStatus

	/** 备注，支持模糊查询 */
	remark?: string
}

/** 分页查询 IP 白名单（行） */
export interface AdminIpWhitePageRecord {
	/** 记录 ID */
	id: number

	/** IP 地址或网段 */
	ip: string

	/** 备注 */
	remark?: string

	/** 状态：1-启用，2-禁用 */
	status: AdminIpWhiteStatus

	/** 创建人 ID */
	createUserId?: number

	/** 创建人名称 */
	createUserName?: string

	/** 创建时间戳，单位：毫秒 */
	createTime?: number

	/** 最后编辑人 ID */
	editUserId?: number

	/** 最后编辑人名称 */
	editUserName?: string

	/** 最后编辑时间戳，单位：毫秒 */
	editTime?: number

	/** 删除状态：1-未删除，2-已删除 */
	deleteStatus?: AdminIpWhiteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人名称 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}

/** 分页查询 IP 白名单（响应） */
export type AdminIpWhitePageResponse = SearchResponse<AdminIpWhitePageRecord>

/** 新增 IP 白名单（参数） */
export interface AdminIpWhiteCreateData {
	/** 允许访问系统的 IP 地址或网段 */
	ip: string

	/** 白名单备注 */
	remark?: string
}

/** 修改 IP 白名单（参数） */
export interface AdminIpWhiteUpdateData {
	/** IP 白名单记录 ID */
	id: number

	/** 允许访问系统的 IP 地址或网段 */
	ip?: string

	/** 白名单备注 */
	remark?: string

	/** 状态：1-启用，2-禁用 */
	status?: AdminIpWhiteStatus
}

/** 修改 IP 白名单状态（参数） */
export interface AdminIpWhiteUpdateStatusData {
	/** IP 白名单记录 ID */
	id: number

	/** 状态：1-启用，2-禁用 */
	status: AdminIpWhiteStatus
}

/** 根据 ID 修改 IP 白名单备注（参数） */
export interface AdminIpWhiteUpdateRemarkData {
	/** IP 白名单记录 ID */
	id: number

	/** 白名单备注，未传、null 或空白字符串时置为数据库 NULL */
	remark?: string
}

/** IP 白名单详情（响应） */
export interface AdminIpWhiteDetailResponse {
	/** 记录 ID */
	id: number

	/** IP 地址或网段 */
	ip: string

	/** 备注 */
	remark?: string

	/** 状态：1-启用，2-禁用 */
	status: AdminIpWhiteStatus

	/** 创建人 ID */
	createUserId?: number

	/** 创建人名称 */
	createUserName?: string

	/** 创建时间戳，单位：毫秒 */
	createTime?: number

	/** 最后编辑人 ID */
	editUserId?: number

	/** 最后编辑人名称 */
	editUserName?: string

	/** 最后编辑时间戳，单位：毫秒 */
	editTime?: number

	/** 删除状态：1-未删除，2-已删除 */
	deleteStatus?: AdminIpWhiteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人名称 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}
