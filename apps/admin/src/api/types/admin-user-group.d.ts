import type { SearchResponse } from './index'
import type { AdminUserGroupDeleteStatus } from '@/api/enum/admin-user-group/delete-status'
import type { AdminFunctionPageRecord } from './admin-function'
import type { AdminNavigationTreeRecord } from './admin-navigation'

/** 分页查询用户组（参数；不含 pageNum/pageSize，由 SearchParams / 列表 hook 交叉） */
export interface AdminUserGroupPageParams {
	/** 用户组名称，支持模糊查询 */
	name?: string

	/** 备注说明，支持模糊查询 */
	remark?: string
}

/** 分页查询用户组（行） */
export interface AdminUserGroupPageRecord {
	/** 用户组 ID */
	id: number

	/** 用户组名称 */
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
	deleteStatus?: AdminUserGroupDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}

/** 分页查询用户组（响应） */
export type AdminUserGroupPageResponse =
	SearchResponse<AdminUserGroupPageRecord>

/** 新增用户组（参数） */
export interface AdminUserGroupCreateData {
	/** 用户组名称 */
	name: string

	/** 备注说明 */
	remark?: string

	/** 关联的导航 ID 完整集合；空集合表示清空关联，重复 ID 自动去重 */
	navigationIds: number[]

	/** 关联的功能 ID 完整集合；空集合表示清空关联，重复 ID 自动去重 */
	functionIds: number[]
}

/** 修改用户组（参数） */
export interface AdminUserGroupUpdateData {
	/** 用户组 ID */
	id: number

	/** 用户组名称 */
	name?: string

	/** 备注说明 */
	remark?: string

	/** 关联的导航 ID 完整集合；空集合表示清空关联，重复 ID 自动去重 */
	navigationIds: number[]

	/** 关联的功能 ID 完整集合；空集合表示清空关联，重复 ID 自动去重 */
	functionIds: number[]
}

/** 根据 ID 修改用户组备注（参数） */
export interface AdminUserGroupUpdateRemarkData {
	/** 用户组 ID */
	id: number

	/** 备注说明，未传、null 或空白字符串时置为数据库 NULL */
	remark?: string
}

/** 查询用户组详情（响应）。GET 返回关联导航/功能整行，不是 `navigationIds` / `functionIds` */
export interface AdminUserGroupDetailResponse {
	/** 用户组 ID */
	id: number

	/** 用户组名称 */
	name: string

	/** 备注 */
	remark?: string

	/** 用户组关联的有效导航树；无关联时返回空集合 */
	navigations: AdminNavigationTreeRecord[]

	/** 用户组关联的有效功能集合；无关联时返回空集合 */
	functions: AdminFunctionPageRecord[]

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
	deleteStatus?: AdminUserGroupDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}
