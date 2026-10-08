import type { SearchResponse } from './index'
import type { AdminUserStatus } from '@/enum/admin-user/status'
import type { AdminUserDeleteStatus } from '@/enum/admin-user/delete-status'
import type { AdminUserGroupPageRecord } from './admin-user-group'

/** 分页查询后台用户（参数；不含 pageNum/pageSize，由 SearchParams / 列表 hook 交叉） */
export interface AdminUserPageParams {
	/** 用户名，支持模糊查询 */
	username?: string

	/** 备注说明，支持模糊查询 */
	remark?: string

	/** 邮箱，支持模糊查询 */
	email?: string

	/** 手机号，支持模糊查询 */
	phone?: string

	/** 状态：1-正常，2-禁用 */
	status?: AdminUserStatus
}

/** 分页查询后台用户（行） */
export interface AdminUserPageRecord {
	/** 用户 ID */
	id: number

	/** 用户名 */
	username: string

	/** 邮箱 */
	email: string

	/** 手机号 */
	phone: string

	/** 头像图片链接 */
	avatarUrl?: string

	/** 状态：1-正常，2-禁用 */
	status: AdminUserStatus

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
	deleteStatus?: AdminUserDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}

/** 分页查询后台用户（响应） */
export type AdminUserPageResponse = SearchResponse<AdminUserPageRecord>

/** 新增后台用户（参数） */
export interface AdminUserCreateData {
	/** 用户名 */
	username: string

	/** 邮箱 */
	email: string

	/** 手机号 */
	phone: string

	/** 头像图片链接 */
	avatarUrl?: string

	/** 状态：1-正常，2-禁用；未传时默认为 1 */
	status?: AdminUserStatus

	/** 备注 */
	remark?: string

	/** 关联的用户组 ID 完整集合；空集合表示清空关联，重复 ID 自动去重 */
	groupIds: number[]
}

/** 修改后台用户（参数） */
export interface AdminUserUpdateData {
	/** 用户 ID */
	id: number

	/** 用户名 */
	username?: string

	/** 邮箱 */
	email?: string

	/** 手机号 */
	phone?: string

	/** 头像图片链接；未传时保持原值 */
	avatarUrl?: string

	/** 状态：1-正常，2-禁用；未传时保持原值 */
	status?: AdminUserStatus

	/** 备注 */
	remark?: string

	/** 关联的用户组 ID 完整集合；空集合表示清空关联，重复 ID 自动去重 */
	groupIds: number[]
}

/** 根据 ID 修改后台用户备注（参数） */
export interface AdminUserUpdateRemarkData {
	/** 用户 ID */
	id: number

	/** 备注说明，未传、null 或空白字符串时置为数据库 NULL */
	remark?: string
}

/** 修改后台用户状态（参数） */
export interface AdminUserUpdateStatusData {
	/** 用户 ID */
	id: number

	/** 状态：1-正常，2-禁用 */
	status: AdminUserStatus
}

/** 查询后台用户详情（响应）。GET 返回关联用户组整行 `userGroups`，不是 `groupIds` */
export interface AdminUserDetailResponse {
	/** 用户 ID */
	id: number

	/** 用户名 */
	username: string

	/** 邮箱 */
	email: string

	/** 手机号 */
	phone: string

	/** 头像图片链接 */
	avatarUrl?: string

	/** 状态：1-正常，2-禁用 */
	status: AdminUserStatus

	/** 备注 */
	remark?: string

	/** 关联的有效用户组集合；无关联时返回空集合 */
	userGroups: AdminUserGroupPageRecord[]

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
	deleteStatus?: AdminUserDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}
