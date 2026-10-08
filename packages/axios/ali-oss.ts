/**
 * 阿里云 OSS 上传。换 STS 用同级 `http.ts` 的 `request`（走业务双 token），
 * 本地 STS 生命周期对齐 `@saco/axios` 双 token：提前按时间戳换票、并发单飞、上传凭证过期只重试一次。
 * 不要再 `createAxios` 一套鉴权，也不要从 `index.ts` 回环 import。
 */
import { request } from './http'
import type OSS from 'ali-oss'
// 只引路径常量。引 ../api/oss 会再回来引 request
import { OSS_STS } from '../api/paths/oss'

/** 业务换取 OSS STS 的接口。路径在 packages/api，自动导入仍用这个名字 */
export const OSS_TOKEN_URL = OSS_STS

/** STS 整包落 localStorage 的 key */
const STORAGE_TOKEN_KEY = 'ali-oss-sts'

/** 提前换票阈值（毫秒），对齐 http 的 checkTokenTime */
const CHECK_STS_TIME = 1000 * 60 * 10

/** put 超时（毫秒）。超过则 SDK 取消请求，避免上传挂死 loading */
const OSS_TIMEOUT = 1000 * 60 * 2

/**
 * OSS SDK 凭证过期类错误码。
 * 对齐 axios 里对 401 的处理：只据此触发换票重试，其它 403 权限问题不重试。
 */
const STS_EXPIRED_CODES = new Set([
	'SecurityTokenExpired',
	'InvalidSecurityToken',
	'InvalidAccessKeyId',
])

/** 换取 OSS 上传凭证的返回结构；`expiration` 为完整毫秒时间戳（与 `@saco/axios` expires 一致） */
export interface OssTokenResponse {
	/** 对象存储区域 */
	region: string
	/** 临时访问密钥 ID */
	accessKeyId: string
	/** 临时访问密钥 Secret */
	accessKeySecret: string
	/** 安全令牌 */
	securityToken: string
	/** 存储桶名称 */
	bucket: string
	/** 对象存储访问端点 */
	endpoint: string
	/** 凭证失效时间戳（毫秒） */
	expiration: number
}

/** 上传可选参数 */
export interface AliOssUploadOptions {
	/** OSS object key；不传则 `upload/{uuid}{ext}` */
	key?: string
	/** 组件卸载时 abort；put 结束后若已 abort 抛 AbortError，调用方不要再写 v-model / toast */
	signal?: AbortSignal
}

/** 是否为上传被取消；catch 里据此跳过 `any_upload_failed` */
export const isOssAbortError = (error: unknown) => {
	return error instanceof Error && error.name === 'AbortError'
}

/**
 * 是否为断网 / 超时（无 HTTP 响应）。跟 `http.ts` errorHandler 的 else 同一判断：
 * axios 看 `response`，ali-oss SDK 看正数 `status`。网络文案只由 http 弹，这里不再 toast，
 * 调用方 catch 里据此跳过 `any_upload_failed`，取消仍走 `isOssAbortError`。
 */
export const isOssNetworkError = (error: unknown) => {
	if (!error || typeof error !== 'object') {
		return false
	}
	if (isOssAbortError(error)) {
		return false
	}
	const err = error as { response?: unknown; status?: number }
	// axios 有 body：业务/鉴权错，http 已按 status toast
	if (err.response) {
		return false
	}
	// ali-oss 有正数 status：OSS HTTP 错（403 过期等），不是断网
	if (typeof err.status === 'number' && err.status > 0) {
		return false
	}
	return true
}

/** signal 已 abort 则抛 AbortError；放在 put 前后，避免卸了还重试换票 */
const throwIfAborted = (signal?: AbortSignal) => {
	if (!signal?.aborted) return
	const error = new Error('OSS upload aborted')
	error.name = 'AbortError'
	throw error
}

/** 公用阿里 OSS 客户端；换票后必须重建，否则仍带旧 stsToken */
let ossInstance: OSS | null = null

/** 并发换票共用同一次 Promise（对齐 useDualToken.refresh） */
let refreshPromise: Promise<OssTokenResponse> | null = null

/** 从本地读取 STS；脏 JSON 当空，避免抛穿业务 */
const getStorageSts = (): OssTokenResponse | null => {
	const raw = localStorage.getItem(STORAGE_TOKEN_KEY)
	if (!raw) return null
	try {
		const sts = JSON.parse(raw) as OssTokenResponse
		// 缺关键字段视为未登录态 STS，走换票
		if (
			!sts.accessKeyId ||
			!sts.accessKeySecret ||
			!sts.securityToken ||
			!sts.bucket ||
			!sts.region ||
			!sts.endpoint ||
			!(sts.expiration > 0)
		) {
			return null
		}
		return sts
	} catch {
		return null
	}
}

/** 写入 STS 整包（含 expiration 时间戳） */
const setStorageSts = (token: OssTokenResponse) => {
	localStorage.setItem(STORAGE_TOKEN_KEY, JSON.stringify(token))
}

/** 清 STS + 客户端；换票失败时调用，避免下次带着坏凭证上传 */
const clearStorageSts = () => {
	localStorage.removeItem(STORAGE_TOKEN_KEY)
	ossInstance = null
}

/**
 * Date.now() + CHECK_STS_TIME >= expiration 则应主动换票。
 * 无有效 STS（expireAt<=0 / 空）也要换，与 axios「未 set 则跳过时间判断、靠 401」不同——OSS 没票发不出请求。
 */
const shouldRefreshByTime = (): boolean => {
	const sts = getStorageSts()
	if (!sts) return true
	return Date.now() + CHECK_STS_TIME >= sts.expiration
}

/** 按当前 STS 重建 OSS 客户端（换票后必调） */
const applyStsToClient = async (sts: OssTokenResponse) => {
	const ossModule = await import('ali-oss')
	ossInstance = new ossModule.default({
		region: sts.region,
		endpoint: sts.endpoint,
		accessKeyId: sts.accessKeyId,
		accessKeySecret: sts.accessKeySecret,
		stsToken: sts.securityToken,
		bucket: sts.bucket,
		authorizationV4: true,
		secure: true,
		timeout: OSS_TIMEOUT,
	})
	return ossInstance
}

/**
 * 单飞换票：已有进行中的 Promise 则直接返回；结束后清空以便下次再刷。
 * 换票走业务 `request`，会先过 http 双 token。
 */
const refresh = (): Promise<OssTokenResponse> => {
	if (!refreshPromise) {
		refreshPromise = request
			.get(OSS_TOKEN_URL)
			.then(async (body: AnyObj) => {
				// 与 http refreshTokenHandler 一致：拦截器已解到 response.data，STS 在 body.data
				const sts = (body.data ?? body) as OssTokenResponse
				setStorageSts(sts)
				await applyStsToClient(sts)
				return sts
			})
			.catch((error) => {
				clearStorageSts()
				throw error
			})
			.finally(() => {
				refreshPromise = null
			})
	}
	return refreshPromise
}

/** 正在换票则排队；否则立刻放行（对齐 waitIfRefreshing） */
const waitIfRefreshing = (): Promise<unknown> => {
	return refreshPromise ?? Promise.resolve()
}

/** 是否为 STS / 临时密钥过期类错误（对齐响应里对 401 的判定） */
const isStsExpiredError = (error: unknown): boolean => {
	if (!error || typeof error !== 'object') return false
	const err = error as { code?: string; name?: string }
	if (err.code && STS_EXPIRED_CODES.has(err.code)) return true
	if (err.name && STS_EXPIRED_CODES.has(err.name)) return true
	return false
}

/**
 * 上传前：若需换票则 refresh，并等进行中的换票结束；保证 `ossInstance` 可用。
 * 对齐双 token 请求拦截里的 shouldRefreshByTime + waitIfRefreshing。
 */
const ensureOssClient = async () => {
	if (shouldRefreshByTime()) {
		await refresh()
	} else {
		await waitIfRefreshing()
		if (!ossInstance) {
			const sts = getStorageSts()
			if (!sts) {
				await refresh()
			} else {
				await applyStsToClient(sts)
			}
		}
	}
	if (!ossInstance) {
		throw new Error('阿里 OSS 实例未加载')
	}
	return ossInstance
}

/**
 * 对象名里的随机段。
 * 平板上的 Safari / WebView 没有 `crypto.randomUUID`，一调用上传直接抛，文件到不了 OSS。
 */
const createObjectId = () => {
	const bytes = new Uint8Array(16)
	crypto.getRandomValues(bytes)
	return Array.from(bytes, (byte) => {
		return byte.toString(16).padStart(2, '0')
	}).join('')
}

/** 默认 object key：随机段，保留原后缀便于浏览器/OSS 识别类型 */
const defaultObjectKey = (file: File) => {
	const dot = file.name.lastIndexOf('.')
	// 无后缀时不要拼出裸 `.`
	const ext = dot > 0 ? file.name.slice(dot) : ''
	return `upload/${createObjectId()}${ext}`
}

/**
 * 上传文件到 OSS。
 * 流程对齐 `@saco/axios`：先按时间戳提前换票 → put；若 SDK 报凭证过期则换票后**只重试一次**。
 * put 超过 `OSS_TIMEOUT`（1 分钟）由 SDK 取消，不重试。
 *
 * @param file 本地文件
 * @param options.key 可选 object key
 * @param options.signal 卸载时 abort，结束后不写业务状态
 */
const uploadFile = async (
	file: File,
	options: AliOssUploadOptions = {},
): Promise<OSS.PutObjectResult> => {
	const key = options.key ?? defaultObjectKey(file)
	throwIfAborted(options.signal)
	const client = await ensureOssClient()
	throwIfAborted(options.signal)
	try {
		const result = await client.put(key, file)
		throwIfAborted(options.signal)
		return result
	} catch (error) {
		if (isOssAbortError(error)) {
			throw error
		}
		// 非凭证过期：直接抛给业务；网络文案由 http / 调用方处理，这里不 toast
		if (!isStsExpiredError(error)) {
			throw error
		}
		throwIfAborted(options.signal)
		// 凭证过期：单飞换票后重试一次（对齐 401 + RETRY_FLAG）
		const retryClient = await refresh().then(() => ossInstance)
		if (!retryClient) {
			throw error
		}
		throwIfAborted(options.signal)
		const result = await retryClient.put(key, file)
		throwIfAborted(options.signal)
		return result
	}
}

/** 给业务用的 OSS 能力入口（从 `@saco/common/axios` 取） */
export const aliOss = {
	upload: uploadFile,
	/** 主动清本地 STS（登出时可调） */
	clear: clearStorageSts,
}
