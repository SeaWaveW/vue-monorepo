export type * from './types/auth'
export * from './paths/auth'

import type {
	AuthSendLoginCodeData,
	AuthLoginByMailData,
	AuthLoginByMailResponse,
	AuthRefreshData,
	AuthRefreshResponse,
	AuthChangeLanguageData,
	AuthApiListResponse,
} from './types/auth'
import {
	request,
	saveAuthStorage,
	clearAuthStorage,
	replaceToLogin,
} from '../axios/http'
import {
	AUTH_SEND_LOGIN_CODE,
	AUTH_LOGIN_BY_MAIL,
	AUTH_REFRESH,
	AUTH_LOGOUT,
	AUTH_CHANGE_LANGUAGE,
	AUTH_API_LIST,
} from './paths/auth'

/***************************** 认证管理（登录验证码、邮箱登录、令牌刷新、退出登录、切换语言及接口权限） *****************************/

/** 发送登录验证码（向已注册邮箱发送登录验证码） */
export const authSendLoginCode = (data: AuthSendLoginCodeData) => {
	return request.post(AUTH_SEND_LOGIN_CODE, data, { noAuth: true })
}

/** 邮箱验证码登录（校验 IP 白名单和邮箱验证码，登录成功后返回访问令牌及刷新令牌） */
export const authLoginByMail = (data: AuthLoginByMailData) => {
	return new Promise<AuthLoginByMailResponse>((resolve, reject) => {
		request
			.post<AuthLoginByMailResponse>(AUTH_LOGIN_BY_MAIL, data, {
				noAuth: true,
			})
			.then((res) => {
				saveAuthStorage(res.data)
				resolve(res.data)
			})
			.catch(reject)
	})
}

/** 刷新登录令牌（不需访问令牌；使用有效的刷新令牌获取新的访问令牌） */
export const authRefresh = (data: AuthRefreshData) => {
	return request.post<AuthRefreshResponse>(AUTH_REFRESH, data, {
		noAuth: true,
	})
}

/** 退出登录（注销当前访问令牌对应的登录会话） */
export const authLogout = () => {
	return new Promise<void>((resolve, reject) => {
		request
			.post(AUTH_LOGOUT)
			.then(() => {
				// 服务端会话作废后清本地令牌，避免旧 token 还被带上
				clearAuthStorage()
				replaceToLogin()
				resolve()
			})
			.catch(reject)
	})
}

/** 切换语言（修改当前登录会话缓存中的界面及业务提示语言） */
export const authChangeLanguage = (data: AuthChangeLanguageData) => {
	return request.post(AUTH_CHANGE_LANGUAGE, data)
}

/** 获取当前用户接口权限（从当前登录会话的 Redis 缓存中获取用户可访问的 API 路径集合，用于前端控制按钮权限） */
export const authApiList = () => {
	return request.get<AuthApiListResponse>(AUTH_API_LIST)
}
