import type { SearchResponse } from './index'
import type { ClientUserLoginLogStatus } from '@/enum/user-login-log/status'
import type { ClientUserLoginLogDeviceType } from '@/enum/user-login-log/device-type'

/** 分页查询客户端登录日志（参数；不含 pageNum/pageSize，由 SearchParams / 列表 hook 交叉） */
export interface ClientUserLoginLogPageParams {
	/** 登录用户名，支持模糊查询 */
	username?: string

	/** 登录邮箱，支持模糊查询 */
	email?: string

	/** 开始登录时间戳，单位：毫秒 */
	startLoginTime?: number

	/** 结束登录时间戳，单位：毫秒 */
	endLoginTime?: number

	/** 设备类型：pc-电脑，tablet-平板，mobile-手机，industrial-工控机 */
	deviceType?: ClientUserLoginLogDeviceType

	/** 设备唯一编码，支持模糊查询 */
	deviceCode?: string

	/** 登录 IP 地址，支持模糊查询 */
	ip?: string

	/** 所属租户 ID */
	tenantId?: number
}

/** 分页查询客户端登录日志（行） */
export interface ClientUserLoginLogPageRecord {
	/** 登录记录 ID */
	id: number

	/** 用户 ID */
	userId?: number

	/** 登录用户名 */
	username?: string

	/** 登录邮箱 */
	email?: string

	/** 手机号 */
	phone?: string

	/** 登录时间戳，单位：毫秒 */
	loginTime?: number

	/** 设备类型：pc-电脑，tablet-平板，mobile-手机，industrial-工控机 */
	deviceType?: ClientUserLoginLogDeviceType

	/** 设备唯一编码 */
	deviceCode?: string

	/** 登录 IP 地址 */
	ip?: string

	/** 登录地点 */
	loginLocation?: string

	/** 登录状态：1-成功，2-失败 */
	status?: ClientUserLoginLogStatus

	/** 失败原因，登录成功时为空 */
	failureReason?: string

	/** 所属租户 ID */
	tenantId?: number

	/** 所属客户主体名称 */
	tenantName?: string
}

/** 分页查询客户端登录日志（响应） */
export type ClientUserLoginLogPageResponse =
	SearchResponse<ClientUserLoginLogPageRecord>
