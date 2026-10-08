import type { SearchResponse } from './index'
import type { ClientUserGroupDeleteStatus } from '@/api/enum/client-user-group/delete-status'
import type { ClientFunctionPageRecord } from './client-function'
import type { ClientNavigationTreeRecord } from './client-navigation'

/** 分页查询客户用户组（参数；不含 pageNum/pageSize，由 SearchParams / 列表 hook 交叉） */
export interface ClientUserGroupPageParams {
	/** 用户组名称，支持模糊查询 */
	name?: string

	/** 所属租户 ID */
	tenantId?: number

	/** 备注，支持模糊查询 */
	remark?: string
}

/** 分页查询客户用户组（行） */
export interface ClientUserGroupPageRecord {
	/** 用户组 ID */
	id: number

	/** 用户组名称 */
	name: string

	/** 所属租户 ID */
	tenantId?: number

	/** 所属客户主体名称 */
	tenantName?: string

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
	deleteStatus?: ClientUserGroupDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}

/** 分页查询客户用户组（响应） */
export type ClientUserGroupPageResponse =
	SearchResponse<ClientUserGroupPageRecord>

/** 新增客户用户组（参数） */
export interface ClientUserGroupCreateData {
	/** 用户组名称 */
	name: string

	/** 所属租户 ID */
	tenantId: number

	/** 备注说明 */
	remark?: string

	/** 关联的导航 ID 完整集合；空集合表示清空关联，重复 ID 自动去重 */
	navigationIds: number[]

	/** 关联的功能 ID 完整集合；空集合表示清空关联，重复 ID 自动去重 */
	functionIds: number[]
}

/** 修改客户用户组（参数） */
export interface ClientUserGroupUpdateData {
	/** 用户组 ID */
	id: number

	/** 用户组名称 */
	name?: string

	/** 所属租户 ID */
	tenantId?: number

	/** 备注说明 */
	remark?: string

	/** 关联的导航 ID 完整集合；空集合表示清空关联，重复 ID 自动去重 */
	navigationIds: number[]

	/** 关联的功能 ID 完整集合；空集合表示清空关联，重复 ID 自动去重 */
	functionIds: number[]
}

/** 修改客户用户组备注（参数） */
export interface ClientUserGroupUpdateRemarkData {
	/** 用户组 ID */
	id: number

	/** 备注，null 或空白字符串表示清空备注 */
	remark?: string
}

/** 查询客户用户组详情（响应）。GET 返回关联导航/功能整行，不是 `navigationIds` / `functionIds` */
export interface ClientUserGroupDetailResponse {
	/** 用户组 ID */
	id: number

	/** 用户组名称 */
	name: string

	/** 所属租户 ID */
	tenantId?: number

	/** 所属客户主体名称 */
	tenantName?: string

	/** 备注 */
	remark?: string

	/** 用户组关联的有效导航树；无关联时返回空集合 */
	navigations: ClientNavigationTreeRecord[]

	/** 用户组关联的有效功能集合；无关联时返回空集合 */
	functions: ClientFunctionPageRecord[]

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
	deleteStatus?: ClientUserGroupDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}
