/**
 * HTTP 单例（`createAxios`）。同级 `ali-oss` 等模块从此文件取 `request` / token 常量拿鉴权，
 * 不要从 `index.ts` 回环 import，避免和目录出口互相拖拽。
 */
import { createAxios, AxiosError } from '@saco/axios'
import { pinia } from '../pinia'
import { useRouterStore, useUserStore } from '../store'
// 跟 store 一样从 create 取运行时单例；`../router` 的 export type * 会把 router 只当类型
import { getAppRouter } from '../router/create'
import { i18n } from '../i18n'
/** Vite 8 / Rolldown 把 CJS 收成具名导出，没有 default；`import qs from 'qs'` 会报不提供 default */
import { stringify } from 'qs'
import { SacoMessage } from '@saco/ui/es/components/message'
// 只引路径常量。引 ../api/auth 会再回来引本文件的 request
import { AUTH_REFRESH } from '../api/paths/auth'

/** GET 数组用逗号；提到模块级，每个请求只赋值引用 */
const serializeGetParams = (params: AnyObj) => {
	return stringify(params, { arrayFormat: 'comma' })
}

/** 刷新令牌接口返回。从 `@saco/common/axios` 取类型，主包不再再导出。 */
export interface RefreshTokenResponse {
	/** 访问令牌 */
	accessToken: string
	/** 刷新令牌 */
	refreshToken: string
	/** 令牌失效时间 */
	expiresIn: number
	/** 用户 ID（与业务 TokenVO 一致为 number） */
	userId: number
	/** 用户名 */
	userName: string
	/** 当前用户邮箱（与业务 TokenVO 一致） */
	email?: string
	/** 当前用户手机号（与业务 TokenVO 一致） */
	phone?: string
	/** 当前用户头像图片链接（与业务 TokenVO 一致） */
	avatarUrl?: string
}

/** 访问令牌的 storage / header key */
export const ACCESS_TOKEN_KEY = 'Authorization'
/** 刷新令牌的 storage / header key */
export const REFRESH_TOKEN_KEY = 'refresh-token'
/** 令牌失效时间的 storage key */
export const EXPIRES_TIME_KEY = `${ACCESS_TOKEN_KEY}_expiresTime`
/** 刷新令牌的接口地址。路径在 packages/api，自动导入仍用这个名字 */
export const REFRESH_TOKEN_URL = AUTH_REFRESH

/**
 * 接口错误 toast。`grouping` 合并相同文案：refresh 401 会进两次 errorHandler，不合并会叠两条；
 * 关掉后再 401（登录页重试）还能再弹，不要用模块开关锁死。
 */
const showRequestError = (message: string) => {
	SacoMessage.error({ message, grouping: true })
}

/**
 * 跳登录页。path 取 `createAppRouter` 写入的 `loginPath`，不要写死 `/login`。
 * 循环依赖时 getAppRouter 是 undefined，不能 throw。
 */
export const replaceToLogin = () => {
	const loginPath = useRouterStore(pinia).loginPath
	const appRouter = getAppRouter()
	if (appRouter) {
		appRouter.replace(loginPath)
		return
	}
	location.replace(loginPath)
}

/** 跳首页。path 取 `createAppRouter` 写入的 `homePath`，不要写死 `/`。 */
export const replaceToHome = () => {
	const homePath = useRouterStore(pinia).homePath
	const appRouter = getAppRouter()
	if (appRouter) {
		appRouter.replace(homePath)
		return
	}
	location.replace(homePath)
}

/** 退出 / 401 清令牌后再跑；业务把草稿、OSS 凭证挂这里，不要改本函数去 import 业务 store */
const clearAuthListeners: Array<() => void> = []

/**
 * 登记清登录态时的额外收尾。`clearAuthStorage` 末尾按登记顺序调。
 * @param fn 无参；抛错不要吞，让调用方看见
 */
export const onClearAuthStorage = (fn: () => void) => {
	clearAuthListeners.push(fn)
}

/**
 * 清令牌、用户信息，并跑 `onClearAuthStorage`。不跳转；401 / 退出再调 `replaceToLogin`。
 */
export const clearAuthStorage = () => {
	localStorage.removeItem(ACCESS_TOKEN_KEY)
	localStorage.removeItem(REFRESH_TOKEN_KEY)
	localStorage.removeItem(EXPIRES_TIME_KEY)
	useUserStore(pinia).clearUserInfo()
	for (const fn of clearAuthListeners) {
		fn()
	}
}

/** 接口错误体：后端字段不统一，按常见名依次取 */
interface RequestErrorBody {
	message?: string
	msg?: string
	error?: string
	detail?: string
}

/**
 * 取出接口报错文案。
 * AxiosError.toJSON() 没有 `response`，`JSON.stringify(error)` 在 HTTPS 403 上看起来像没数据；
 * 网关 403 若不带 CORS，浏览器会丢掉 body，这时只能退回 `error.message`（Network Error）。
 */
const getRequestErrorMessage = (
	error: InstanceType<typeof AxiosError>,
): string => {
	const raw = error.response?.data
	let body: RequestErrorBody | undefined
	if (typeof raw === 'string') {
		try {
			body = JSON.parse(raw) as RequestErrorBody
		} catch {
			return raw || error.message
		}
	} else if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
		body = raw as RequestErrorBody
	}
	return (
		body?.message ||
		body?.msg ||
		body?.error ||
		body?.detail ||
		error.message
	)
}

/** 保存令牌。只写 storage / 用户，不要跳转：登录页自己 push，刷新令牌更不能踢回首页。 */
export const saveAuthStorage = (data: RefreshTokenResponse) => {
	localStorage.setItem(ACCESS_TOKEN_KEY, `Bearer ${data.accessToken}`)
	localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
	request.setExpiresTime(data.expiresIn) // 写入 expires 对应的存储 key
	useUserStore(pinia).setUserInfo(data)
}

/**
 * 单次请求额外字段。
 * 交给 createAxios 的泛型，不写进 @saco/axios 的固定字段。
 */
export interface RequestConfig {
	/** 这次失败不弹 toast。401 仍清登录并跳登录页 */
	noErrorTip?: boolean
}

/**
 * 业务 API 网络请求实例。
 * baseURL 必须写 `import.meta.env.VITE_APP_API`：取值在业务工程，库构建没有这份 env。
 * 写别的访问方式会被打成 `void 0`；vite 插件会把表达式原样留在 es 产物里。
 */
export const request = createAxios<RequestConfig>({
	baseURL: import.meta.env.VITE_APP_API,
	timeout: 1000 * 60 * 10, // 10分钟超时
	requestHandler: (config) => {
		// 如果不是刷新令牌接口/无鉴权请求，则添加令牌
		if (!config.url?.includes(REFRESH_TOKEN_URL) && !config.noAuth) {
			const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
			// 刷新 401 后 token 已清；再挂 null 仍会把白名单等原请求打出去
			if (!accessToken) {
				config.isEmpty = true
				throw new AxiosError(
					'Unauthorized',
					AxiosError.ERR_BAD_REQUEST,
					config,
				)
			}
			config.headers[ACCESS_TOKEN_KEY] = accessToken
		}

		// get请求，序列化；函数提到模块级，避免每个 GET new 一个闭包
		if (config.method === 'GET') {
			config.paramsSerializer = serializeGetParams
		}
		// post 请求且包含文件，则将数据转换为 formData
		if (config.method === 'POST' && isIncludeFile(config.data)) {
			config.headers['Content-Type'] = 'multipart/form-data'
			config.data = objToFormData(config.data)
		}
		return config
	},
	successHandler: (response, resolve, reject) => {
		// 当响应为blob，但内容却是json
		if (
			response.config.responseType === 'blob' &&
			response.data.type === 'application/json'
		) {
			parseBlobToJson(response.data).then(resolve).catch(reject)
			return
		}
		// 直接返回响应层
		resolve(response.data)
	},
	dualMode: true, // 双token模式
	refreshToken: REFRESH_TOKEN_KEY, // 刷新令牌的key
	accessToken: ACCESS_TOKEN_KEY, // 访问令牌的key
	expires: EXPIRES_TIME_KEY, // 令牌失效时间的key
	refreshTokenApi: REFRESH_TOKEN_URL, // 刷新令牌的接口
	checkTokenTime: 1000 * 30, // 提前检查令牌时间(30秒)
	refreshTokenHandler: async (instance) => {
		const { data } = await instance.post<RefreshTokenResponse>(
			REFRESH_TOKEN_URL,
			{
				refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
			},
		)
		saveAuthStorage(data)
	},
	// 错误处理
	errorHandler: (error) => {
		const status = error.response?.status
		const isEmptyAuth = Boolean(
			error.config?.isEmpty && !error.config?.noAuth,
		)
		const noErrorTip = Boolean(error.config?.noErrorTip)
		if (isEmptyAuth || status == 401) {
			clearAuthStorage()
			replaceToLogin()
			if (error.response && !noErrorTip) {
				showRequestError(getRequestErrorMessage(error))
			}
			return error
		}
		if (noErrorTip) return error
		if (error.response) {
			showRequestError(getRequestErrorMessage(error))
		} else {
			// 无 response：断网 / 超时。Axios 默认 Network Error，改用 i18n
			showRequestError(i18n.global.t('network_anomaly_message'))
		}
		return error
	},
})

/** 值是否为 File / FileList / 含 File 的数组或对象 */
const hasFile = (value: unknown): boolean => {
	if (value instanceof File) return true
	if (typeof FileList !== 'undefined' && value instanceof FileList)
		return value.length > 0
	if (Array.isArray(value)) return value.some(hasFile)
	if (value && typeof value === 'object')
		return Object.values(value).some(hasFile)
	return false
}

/** 是否包含文件 */
const isIncludeFile = (params: AnyObj) => hasFile(params)

/** 将任意值写入 FormData（支持嵌套对象 / 数组 / FileList） */
const appendFormValue = (formData: FormData, key: string, value: unknown) => {
	if (value === undefined || value === null) return
	if (value instanceof File || value instanceof Blob) {
		formData.append(key, value)
		return
	}
	if (typeof FileList !== 'undefined' && value instanceof FileList) {
		Array.from(value).forEach((file, index) => {
			formData.append(`${key}[${index}]`, file)
		})
		return
	}
	if (Array.isArray(value)) {
		value.forEach((item, index) => {
			appendFormValue(formData, `${key}[${index}]`, item)
		})
		return
	}
	if (value instanceof Date) {
		formData.append(key, value.toISOString())
		return
	}
	if (typeof value === 'object') {
		Object.entries(value).forEach(([childKey, childValue]) => {
			appendFormValue(formData, `${key}[${childKey}]`, childValue)
		})
		return
	}
	formData.append(key, String(value))
}

/** 对象转formData */
const objToFormData = (params: AnyObj) => {
	const formData = new FormData()
	Object.entries(params).forEach(([key, value]) => {
		appendFormValue(formData, key, value)
	})
	return formData
}

/** 解析blob为json */
const parseBlobToJson = (blob: Blob) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => {
			const result = reader.result as string
			resolve(JSON.parse(result))
		}
		reader.onerror = (e) => {
			reject(e)
		}
		reader.readAsText(blob)
	})
}

/** a标签下载文件 */
export const downloadFile = (url: string, filename: string) => {
	const aTag = document.createElement('a')
	aTag.href = url
	aTag.download = filename
	aTag.click()
	aTag.remove()
}
