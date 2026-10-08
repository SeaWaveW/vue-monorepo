import type { SearchResponse } from './index'
import type { ClientFunctionDeleteStatus } from '@/enum/function/delete-status'

/** 功能详情里关联的 API 行；本仓不迁 client-api 板块，只留详情展示要用的字段 */
export interface ClientFunctionApiRecord {
	/** 客户端 API 资源 ID */
	id: number

	/** API 名称 */
	name: string

	/** 接口路径 */
	path?: string

	/** 备注 */
	remark?: string
}

/** 分页查询客户端功能（参数；不含 pageNum/pageSize，由 SearchParams / 列表 hook 交叉） */
export interface ClientFunctionPageParams {
	/** 功能名称，支持模糊查询 */
	name?: string

	/** 备注说明，支持模糊查询 */
	remark?: string
}

/** 分页查询客户端功能（行） */
export interface ClientFunctionPageRecord {
	/** 客户端功能 ID */
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
	deleteStatus?: ClientFunctionDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}

/** 分页查询客户端功能（响应） */
export type ClientFunctionPageResponse =
	SearchResponse<ClientFunctionPageRecord>

/** 新增客户端功能（参数） */
export interface ClientFunctionCreateData {
	/** 功能名称 */
	name: string

	/** 备注说明 */
	remark?: string

	/** 关联的客户端 API 资源 ID 集合；传空集合表示不关联 API */
	apiIds: number[]
}

/** 修改客户端功能（参数） */
export interface ClientFunctionUpdateData {
	/** 客户端功能 ID */
	id: number

	/** 功能名称 */
	name?: string

	/** 备注说明 */
	remark?: string

	/** 关联的客户端 API 资源 ID 集合；传空集合表示清空关联 */
	apiIds: number[]
}

/** 根据 ID 修改客户端功能备注（参数） */
export interface ClientFunctionUpdateRemarkData {
	/** 客户端功能 ID */
	id: number

	/** 备注说明，未传、null 或空白字符串时置为数据库 NULL */
	remark?: string
}

/** 查询客户端功能详情（响应）。GET 返回关联 API 整行 `apis`，不是 `apiIds` */
export interface ClientFunctionDetailResponse {
	/** 客户端功能 ID */
	id: number

	/** 功能名称 */
	name: string

	/** 备注说明 */
	remark?: string

	/** 功能关联的客户端 API 资源集合；无关联时为空数组 */
	apis: ClientFunctionApiRecord[]

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
	deleteStatus?: ClientFunctionDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}
