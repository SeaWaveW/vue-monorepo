export type * from './types/oss'
export * from './paths/oss'

import type { OssStsResponse } from './types/oss'
import { OSS_STS } from './paths/oss'
import { request } from '#/axios'

/***************************** oss-controller *****************************/

/** 获取 OSS STS 临时上传凭证（用于前端利用临时凭证上传OSS，不用经过后端上传） */
export const ossSts = () => {
	return request.get<OssStsResponse>(OSS_STS)
}
