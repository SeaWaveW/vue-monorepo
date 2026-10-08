/**
 * 子路径 `@saco/common/axios`。目录公开 API 只从这里具名导出。
 * 业务 `request` / token / `downloadFile` 来自 `http.ts`；`aliOss` 来自 `ali-oss.ts`（换票用同一份 `request`，勿从本文件回环 import）。
 */
import { onClearAuthStorage } from './http'
import { aliOss } from './ali-oss'

export {
	ACCESS_TOKEN_KEY,
	REFRESH_TOKEN_KEY,
	EXPIRES_TIME_KEY,
	REFRESH_TOKEN_URL,
	clearAuthStorage,
	onClearAuthStorage,
	saveAuthStorage,
	replaceToLogin,
	replaceToHome,
	request,
	downloadFile,
} from './http'
export type { RefreshTokenResponse, RequestConfig } from './http'
export {
	OSS_TOKEN_URL,
	aliOss,
	isOssAbortError,
	isOssNetworkError,
} from './ali-oss'
export type { OssTokenResponse, AliOssUploadOptions } from './ali-oss'

// 退出必须摘 STS：http 不能回引 ali-oss，只能在出口登记
onClearAuthStorage(() => {
	aliOss.clear()
})
