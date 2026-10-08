export type * from './types/client-operation-log'
export * from './paths/client-operation-log'

import type { SearchParams } from './types'
import type {
	ClientOperationLogPageParams,
	ClientOperationLogPageResponse,
} from './types/client-operation-log'
import { CLIENT_OPERATION_LOG_PAGE } from './paths/client-operation-log'
import { request } from '#/axios'

/***************************** 客户端操作日志管理（查询客户端用户的数据操作日志） *****************************/

/** 分页查询客户端操作日志（按照实体、操作、其他关键信息、操作用户、邮箱、操作时间、设备类型、机器码、IP 和租户分页查询） */
export const clientOperationLogPage = (
	params: SearchParams<ClientOperationLogPageParams>,
) => {
	return request.get<ClientOperationLogPageResponse>(
		CLIENT_OPERATION_LOG_PAGE,
		{
			params,
		},
	)
}
