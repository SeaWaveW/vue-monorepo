import type { SearchResponse } from './index'
import type { AdminApiLevel } from '@/api/enum/admin-api/level'

/** 分页查询 API 资源（参数；不含 pageNum/pageSize，由 SearchParams / 列表 hook 交叉） */
export interface AdminApiPageParams {
	/** API 名称，支持模糊查询 */
	name?: string

	/** 接口路径，支持模糊查询 */
	path?: string

	/** 访问级别：1-登录访问，2-用户权限访问 */
	level?: AdminApiLevel

	/** 备注，支持模糊查询 */
	remark?: string
}

/** 分页查询 API 资源（行） */
export interface AdminApiPageRecord {
	/** API 资源 ID */
	id: number

	/** API 名称 */
	name: string

	/** 接口路径 */
	path: string

	/** 访问级别：1-登录访问，2-用户权限访问 */
	level: AdminApiLevel

	/** 备注 */
	remark?: string

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

	/** 删除状态 */
	deleteStatus?: number

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人名称 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}

/** 分页查询 API 资源（响应） */
export type AdminApiPageResponse = SearchResponse<AdminApiPageRecord>

/** 新增 API 资源（参数） */
export interface AdminApiCreateData {
	/** API 名称 */
	name: string

	/** 接口路径 */
	path: string

	/** 访问级别：1-登录访问，2-用户权限访问 */
	level: AdminApiLevel

	/** 备注 */
	remark?: string
}

/** 修改 API 资源（参数） */
export interface AdminApiUpdateData {
	/** API 资源 ID */
	id: number

	/** API 名称 */
	name?: string

	/** 接口路径 */
	path?: string

	/** 访问级别：1-登录访问，2-用户权限访问 */
	level?: AdminApiLevel

	/** 备注 */
	remark?: string
}

/** 根据 ID 修改 API 资源备注（参数） */
export interface AdminApiUpdateRemarkData {
	/** API 资源 ID */
	id: number

	/** 备注，未传、null 或空白字符串时置为数据库 NULL */
	remark?: string
}

/** 查询 API 资源详情（响应） */
export interface AdminApiDetailResponse {
	/** API 资源 ID */
	id: number

	/** API 名称 */
	name: string

	/** 接口路径 */
	path: string

	/** 访问级别：1-登录访问，2-用户权限访问 */
	level: AdminApiLevel

	/** 备注 */
	remark?: string

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

	/** 删除状态 */
	deleteStatus?: number

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人名称 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}
