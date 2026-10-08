export type * from './types/user-login-log'
export * from './paths/user-login-log'

import type { SearchParams } from './types'
import type {
	ClientUserLoginLogPageParams,
	ClientUserLoginLogPageResponse,
} from './types/user-login-log'
import { CLIENT_USER_LOGIN_LOG_PAGE } from './paths/user-login-log'
import { request } from '#/axios'

/***************************** 登录日志（查询当前租户的客户端用户登录日志） *****************************/

/** 分页查询登录日志（按照登录用户、邮箱、登录时间、设备类型、机器码和 IP 分页查询） */
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
