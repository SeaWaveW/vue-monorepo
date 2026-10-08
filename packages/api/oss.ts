export type * from './types/oss'
export * from './paths/oss'

import type { OssStsResponse } from './types/oss'
import { OSS_STS } from './paths/oss'
import { request } from '../axios/http'

/***************************** OSS 管理（获取对象存储临时上传凭证） *****************************/

/** 获取 OSS STS 临时上传凭证（供前端直接上传文件到 OSS，无需经过后端中转） */
export const ossSts = () => {
	return request.get<OssStsResponse>(OSS_STS)
}
