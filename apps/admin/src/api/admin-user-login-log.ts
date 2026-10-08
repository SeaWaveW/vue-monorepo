export type * from './types/admin-user-login-log'
export * from './paths/admin-user-login-log'

import type { SearchParams } from './types'
import type {
	AdminUserLoginLogPageParams,
	AdminUserLoginLogPageResponse,
} from './types/admin-user-login-log'
import { ADMIN_USER_LOGIN_LOG_PAGE } from './paths/admin-user-login-log'
import { request } from '#/axios'

/***************************** 登录日志管理（查询后台用户登录日志） *****************************/

/** 分页查询登录日志（按照登录用户、邮箱、登录时间、设备类型、机器码和 IP 分页查询登录日志） */
export const adminUserLoginLogPage = (
	params: SearchParams<AdminUserLoginLogPageParams>,
) => {
	return request.get<AdminUserLoginLogPageResponse>(
		ADMIN_USER_LOGIN_LOG_PAGE,
		{
			params,
		},
	)
}
