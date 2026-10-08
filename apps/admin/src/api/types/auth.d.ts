import type { Language } from '#/i18n'

/** 发送登录验证码（参数） */
export interface AuthSendLoginCodeData {
	/** 接收登录验证码的邮箱地址 */
	email: string

	/** 验证码邮件语言，可选 chinese 或 english */
	language?: Language
}

/** 邮箱验证码登录（参数） */
export interface AuthLoginByMailData {
	/** 登录邮箱 */
	email: string

	/** 邮件中的六位数字验证码 */
	code: string

	/** 界面及业务提示语言，可选 chinese 或 english */
	language?: Language

	/** 登录设备类型 */
	deviceType: 'pc' | 'tablet' | 'mobile'

	/** 用于标识当前设备的唯一编码 */
	deviceCode: string
}

/** 邮箱验证码登录（响应） */
export interface AuthLoginByMailResponse {
	/** 访问令牌，用于调用需要认证的接口 */
	accessToken: string

	/** 刷新令牌，用于获取新的访问令牌 */
	refreshToken: string

	/** 访问令牌过期时间戳，单位：毫秒 */
	expiresIn: number

	/** 当前用户 ID */
	userId: number

	/** 当前用户名称 */
	userName: string

	/** 当前用户邮箱 */
	email?: string

	/** 当前用户手机号 */
	phone?: string

	/** 当前用户头像图片链接 */
	avatarUrl?: string
}

/** 刷新登录令牌（参数） */
export interface AuthRefreshData {
	/** 登录成功或上次刷新时返回的刷新令牌 */
	refreshToken: string
}

/** 刷新登录令牌（响应） */
export interface AuthRefreshResponse {
	/** 访问令牌，用于调用需要认证的接口 */
	accessToken: string

	/** 刷新令牌，用于获取新的访问令牌 */
	refreshToken: string

	/** 访问令牌过期时间戳，单位：毫秒 */
	expiresIn: number

	/** 当前用户 ID */
	userId: number

	/** 当前用户名称 */
	userName: string

	/** 当前用户邮箱 */
	email?: string

	/** 当前用户手机号 */
	phone?: string

	/** 当前用户头像图片链接 */
	avatarUrl?: string
}

/** 切换语言（参数） */
export interface AuthChangeLanguageData {
	/** 界面及业务提示语言，可选 chinese 或 english */
	language: Language
}

/** 获取当前用户接口权限（响应） */
export type AuthApiListResponse = string[]
