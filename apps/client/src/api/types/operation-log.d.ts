import type { SearchResponse } from './index'
import type { ClientOperationLogDeviceType } from '@/api/enum/operation-log/device-type'

/** 分页查询客户端操作日志（参数；不含 pageNum/pageSize，由 SearchParams / 列表 hook 交叉） */
export interface ClientOperationLogPageParams {
	/** 操作用户名，支持模糊查询 */
	username?: string

	/** 操作用户邮箱，支持模糊查询 */
	email?: string

	/** 开始操作时间戳，单位：毫秒 */
	startOperationTime?: number

	/** 结束操作时间戳，单位：毫秒 */
	endOperationTime?: number

	/** 设备类型：pc-电脑，tablet-平板，mobile-手机，industrial-工控机 */
	deviceType?: ClientOperationLogDeviceType

	/** 设备唯一编码，支持模糊查询 */
	deviceCode?: string

	/** 操作 IP 地址，支持模糊查询 */
	ip?: string

	/** 操作描述，支持模糊查询 */
	operation?: string

	/** 被操作的实体名称，支持模糊查询 */
	entity?: string

	/** 其他关键信息，支持模糊查询 */
	extraInfo?: string

	/** 所属租户 ID */
	tenantId?: number
}

/** 分页查询客户端操作日志（行） */
export interface ClientOperationLogPageRecord {
	/** 操作日志 ID */
	id: number

	/** 用户 ID */
	userId?: number

	/** 用户名 */
	username?: string

	/** 邮箱 */
	email?: string

	/** 手机号 */
	phone?: string

	/** 操作时间戳，单位：毫秒 */
	operationTime?: number

	/** 设备类型：pc-电脑，tablet-平板，mobile-手机，industrial-工控机 */
	deviceType?: ClientOperationLogDeviceType

	/** 设备唯一编码 */
	deviceCode?: string

	/** 操作 IP 地址 */
	ip?: string

	/** 操作地点 */
	operationLocation?: string

	/** 操作描述，如新增、删除、修改 */
	operation?: string

	/** 被操作的实体 */
	entity?: string

	/** 其他相关信息 */
	extraInfo?: string

	/** 所属租户 ID */
	tenantId?: number

	/** 所属客户主体名称 */
	tenantName?: string
}

/** 分页查询客户端操作日志（响应） */
export type ClientOperationLogPageResponse =
	SearchResponse<ClientOperationLogPageRecord>
