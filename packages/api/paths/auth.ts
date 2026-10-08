/**
 * 认证路径。只有常量，不引 `request`。
 * `packages/axios` 刷新令牌要读 `AUTH_REFRESH`；请求函数在 `../auth.ts`，两边对引会绕回来。
 */

/** 发送登录验证码。与 swagger / authApiList 权限串一致 */
export const AUTH_SEND_LOGIN_CODE = '/auth/send-login-code' as const

/** 邮箱验证码登录。与 swagger / authApiList 权限串一致 */
export const AUTH_LOGIN_BY_MAIL = '/auth/login-by-mail' as const

/** 刷新登录令牌。与 swagger / authApiList 权限串一致 */
export const AUTH_REFRESH = '/auth/refresh' as const

/** 退出登录。与 swagger / authApiList 权限串一致 */
export const AUTH_LOGOUT = '/auth/logout' as const

/** 切换语言。与 swagger / authApiList 权限串一致 */
export const AUTH_CHANGE_LANGUAGE = '/auth/change-language' as const

/** 获取当前用户接口权限。与 swagger / authApiList 权限串一致 */
export const AUTH_API_LIST = '/auth/api-list' as const
