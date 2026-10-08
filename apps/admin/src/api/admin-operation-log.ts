export type * from './types/admin-operation-log'
export * from './paths/admin-operation-log'

import type { SearchParams } from './types'
import type {
	AdminOperationLogPageParams,
	AdminOperationLogPageResponse,
} from './types/admin-operation-log'
import { ADMIN_OPERATION_LOG_PAGE } from './paths/admin-operation-log'
import { request } from '#/axios'

/***************************** 操作日志管理（查询后台用户的数据操作日志） *****************************/

/** 分页查询操作日志（按照实体、操作、其他关键信息、操作用户、邮箱、操作时间、设备类型、机器码和 IP 分页查询操作日志） */
export const adminOperationLogPage = (
	params: SearchParams<AdminOperationLogPageParams>,
) => {
	return request.get<AdminOperationLogPageResponse>(
		ADMIN_OPERATION_LOG_PAGE,
		{
			params,
		},
	)
}
