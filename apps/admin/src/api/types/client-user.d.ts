import type { SearchResponse } from './index'
import type { ClientUserStatus } from '@/enum/client-user/status'
import type { ClientUserDeleteStatus } from '@/enum/client-user/delete-status'
import type { ClientUserGroupPageRecord } from './client-user-group'

/** 分页查询客户用户（参数；不含 pageNum/pageSize，由 SearchParams / 列表 hook 交叉） */
export interface ClientUserPageParams {
	/** 用户名，支持模糊查询 */
	username?: string

	/** 邮箱，支持模糊查询 */
	email?: string

	/** 手机号，支持模糊查询 */
	phone?: string

	/** 状态：1-正常，2-禁用 */
	status?: ClientUserStatus

	/** 备注说明，支持模糊查询 */
	remark?: string

	/** 所属租户 ID */
	tenantId?: number
}

/** 分页查询客户用户（行） */
export interface ClientUserPageRecord {
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
	status: ClientUserStatus

	/** 备注 */
	remark?: string

	/** 所属租户 ID */
	tenantId?: number

	/** 所属客户主体名称 */
	tenantName?: string

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
	deleteStatus?: ClientUserDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}

/** 分页查询客户用户（响应） */
export type ClientUserPageResponse = SearchResponse<ClientUserPageRecord>

/** 新增客户用户（参数） */
export interface ClientUserCreateData {
	/** 用户名 */
	username: string

	/** 邮箱 */
	email: string

	/** 手机号 */
	phone: string

	/** 头像图片链接 */
	avatarUrl?: string

	/** 状态：1-正常，2-禁用；未传时默认为 1 */
	status?: ClientUserStatus

	/** 备注 */
	remark?: string

	/** 所属租户 ID */
	tenantId: number

	/** 目标租户下关联的用户组 ID 完整集合 */
	groupIds: number[]
}

/** 修改客户用户（参数） */
export interface ClientUserUpdateData {
	/** 用户 ID */
	id: number

	/** 用户名 */
	username?: string

	/** 邮箱 */
	email?: string

	/** 手机号 */
	phone?: string

	/** 头像图片链接 */
	avatarUrl?: string

	/** 状态：1-正常，2-禁用 */
	status?: ClientUserStatus

	/** 备注 */
	remark?: string

	/** 所属租户 ID；未传时保持原值 */
	tenantId?: number

	/** 目标租户下关联的用户组 ID 完整集合 */
	groupIds: number[]
}

/** 修改客户用户备注（参数） */
export interface ClientUserUpdateRemarkData {
	/** 用户 ID */
	id: number

	/** 备注说明，未传、null 或空白字符串时置为数据库 NULL */
	remark?: string
}

/** 修改客户用户状态（参数） */
export interface ClientUserUpdateStatusData {
	/** 用户 ID */
	id: number

	/** 状态：1-正常，2-禁用 */
	status: ClientUserStatus
}

/** 查询客户用户详情（响应）。GET 返回关联用户组整行 `userGroups`，不是 `groupIds` */
export interface ClientUserDetailResponse {
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
	status: ClientUserStatus

	/** 备注 */
	remark?: string

	/** 所属租户 ID */
	tenantId?: number

	/** 所属客户主体名称 */
	tenantName?: string

	/** 关联的同租户有效用户组集合 */
	userGroups: ClientUserGroupPageRecord[]

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
	deleteStatus?: ClientUserDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}
