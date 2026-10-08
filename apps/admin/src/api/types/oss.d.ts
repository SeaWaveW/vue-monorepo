/** 获取 OSS STS 临时上传凭证（响应） */
export interface OssStsResponse {
	/** 临时访问密钥 ID */
	accessKeyId: string

	/** 临时访问密钥 Secret */
	accessKeySecret: string

	/** 安全令牌 */
	securityToken: string

	/** 凭证过期时间（毫秒级时间戳） */
	expiration: number

	/** 对象存储区域 */
	region: string

	/** 存储桶名称 */
	bucket: string

	/** 对象存储访问端点 */
	endpoint: string
}
