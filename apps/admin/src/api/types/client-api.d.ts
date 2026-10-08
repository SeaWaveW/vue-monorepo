import type { SearchResponse } from './index'
import type { ClientApiLevel } from '@/api/enum/client-api/level'

/** 分页查询客户端 API 资源（参数；不含 pageNum/pageSize，由 SearchParams / 列表 hook 交叉） */
export interface ClientApiPageParams {
	/** API 名称，支持模糊查询 */
	name?: string

	/** 接口路径，支持模糊查询 */
	path?: string

	/** 访问级别：1-登录访问，2-用户权限访问 */
	level?: ClientApiLevel

	/** 备注，支持模糊查询 */
	remark?: string
}

/** 分页查询客户端 API 资源（行） */
export interface ClientApiPageRecord {
	/** 客户端 API 资源 ID */
	id: number

	/** API 名称 */
	name: string

	/** 接口路径 */
	path: string

	/** 访问级别：1-登录访问，2-用户权限访问 */
	level: ClientApiLevel

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
	deleteStatus?: number

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}

/** 分页查询客户端 API 资源（响应） */
export type ClientApiPageResponse = SearchResponse<ClientApiPageRecord>

/** 新增客户端 API 资源（参数） */
export interface ClientApiCreateData {
	/** API 名称 */
	name: string

	/** 接口路径 */
	path: string

	/** 访问级别：1-登录访问，2-用户权限访问 */
	level: ClientApiLevel

	/** 备注 */
	remark?: string
}

/** 修改客户端 API 资源（参数） */
export interface ClientApiUpdateData {
	/** 客户端 API 资源 ID */
	id: number

	/** API 名称 */
	name?: string

	/** 接口路径 */
	path?: string

	/** 访问级别：1-登录访问，2-用户权限访问 */
	level?: ClientApiLevel

	/** 备注 */
	remark?: string
}

/** 根据 ID 修改客户端 API 资源备注（参数） */
export interface ClientApiUpdateRemarkData {
	/** 客户端 API 资源 ID */
	id: number

	/** 备注，未传、null 或空白字符串时置为数据库 NULL */
	remark?: string
}

/** 查询客户端 API 资源详情（响应） */
export interface ClientApiDetailResponse {
	/** 客户端 API 资源 ID */
	id: number

	/** API 名称 */
	name: string

	/** 接口路径 */
	path: string

	/** 访问级别：1-登录访问，2-用户权限访问 */
	level: ClientApiLevel

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
	deleteStatus?: number

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}
