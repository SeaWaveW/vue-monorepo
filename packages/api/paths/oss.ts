/**
 * OSS 路径。只有常量，不引 `request`。
 * `packages/axios` 换 STS 要读 `OSS_STS`；请求函数在 `../oss.ts`。
 */

/** 获取 OSS STS 临时上传凭证。与 swagger / authApiList 权限串一致 */
export const OSS_STS = '/oss/sts' as const
