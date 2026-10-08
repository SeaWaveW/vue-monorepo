export type * from './types/client-user-login-log'
export * from './paths/client-user-login-log'

import type { SearchParams } from './types'
import type {
	ClientUserLoginLogPageParams,
	ClientUserLoginLogPageResponse,
} from './types/client-user-login-log'
import { CLIENT_USER_LOGIN_LOG_PAGE } from './paths/client-user-login-log'
import { request } from '#/axios'

/***************************** 客户端登录日志管理（查询客户端用户登录日志） *****************************/

/** 分页查询客户端登录日志（按照登录用户、邮箱、登录时间、设备类型、机器码、IP 和客户主体分页查询） */
export const clientUserLoginLogPage = (
	params: SearchParams<ClientUserLoginLogPageParams>,
) => {
	return request.get<ClientUserLoginLogPageResponse>(
		CLIENT_USER_LOGIN_LOG_PAGE,
		{
			params,
		},
	)
}
