import type { SearchResponse } from './index'
import type { SkillPlatformType } from '@/api/enum/skill/platform-type'
import type { SkillDeleteStatus } from '@/api/enum/skill/delete-status'

/** 分页查询 Skill（参数；不含 pageNum/pageSize，由 SearchParams / 列表 hook 交叉） */
export interface SkillPageParams {
	/** Skill 名称，支持模糊查询 */
	name?: string

	/** Skill 类型 ID */
	skillTypeId?: number

	/** 平台类型：1-阿里云百炼，2-字节跳动 Coze，3-私有部署 Dify */
	platformType?: SkillPlatformType

	/** 备注说明，支持模糊查询 */
	remark?: string
}

/** 分页查询 Skill / 详情（行） */
export interface SkillPageRecord {
	/** Skill ID */
	id: number

	/** Skill 名称 */
	name: string

	/** Skill 类型 ID */
	skillTypeId: number

	/** Skill 类型名称 */
	skillTypeName?: string

	/** 平台类型：1-阿里云百炼，2-字节跳动 Coze，3-私有部署 Dify */
	platformType: SkillPlatformType

	/** 阿里云百炼 API Key */
	bailianApiKey?: string

	/** 阿里云百炼应用 ID */
	bailianAppId?: string

	/** Coze 工作流 ID */
	cozeWorkflowId?: string

	/** Coze 应用 ID */
	cozeAppId?: string

	/** 文件匹配提示词 */
	fileMatchPrompt?: string

	/** 备注说明 */
	remark?: string

	/** 创建人 ID */
	createUserId?: number

	/** 创建人姓名 */
	createUserName?: string

	/** 创建时间戳，单位：毫秒 */
	createTime?: number

	/** 最后编辑人 ID */
	editUserId?: number

	/** 最后编辑人姓名 */
	editUserName?: string

	/** 最后编辑时间戳，单位：毫秒 */
	editTime?: number

	/** 删除状态：1-未删除，2-已删除 */
	deleteStatus?: SkillDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}

/** 分页查询 Skill（响应） */
export type SkillPageResponse = SearchResponse<SkillPageRecord>

/** 新增 Skill（参数） */
export interface SkillCreateData {
	/** Skill 名称 */
	name: string

	/** Skill 类型 ID */
	skillTypeId: number

	/** 平台类型：1-阿里云百炼，2-字节跳动 Coze，3-私有部署 Dify */
	platformType: SkillPlatformType

	/** 阿里云百炼 API Key，选择阿里云百炼时必填 */
	bailianApiKey?: string

	/** 阿里云百炼应用 ID，选择阿里云百炼时必填 */
	bailianAppId?: string

	/** Coze 工作流 ID，选择字节跳动 Coze 时必填 */
	cozeWorkflowId?: string

	/** Coze 应用 ID，选择字节跳动 Coze 时必填 */
	cozeAppId?: string

	/** 文件匹配提示词 */
	fileMatchPrompt?: string

	/** 备注说明 */
	remark?: string
}

/** 修改 Skill（参数） */
export interface SkillUpdateData {
	/** Skill ID */
	id: number

	/** Skill 名称 */
	name: string

	/** Skill 类型 ID */
	skillTypeId: number

	/** 平台类型：1-阿里云百炼，2-字节跳动 Coze，3-私有部署 Dify */
	platformType: SkillPlatformType

	/** 阿里云百炼 API Key，选择阿里云百炼时必填 */
	bailianApiKey?: string

	/** 阿里云百炼应用 ID，选择阿里云百炼时必填 */
	bailianAppId?: string

	/** Coze 工作流 ID，选择字节跳动 Coze 时必填 */
	cozeWorkflowId?: string

	/** Coze 应用 ID，选择字节跳动 Coze 时必填 */
	cozeAppId?: string

	/** 文件匹配提示词 */
	fileMatchPrompt?: string

	/** 备注说明 */
	remark?: string
}

/** 根据 ID 修改 Skill 备注（参数） */
export interface SkillUpdateRemarkData {
	/** Skill ID */
	id: number

	/** 备注，未传、null 或空白字符串时置为数据库 NULL */
	remark?: string
}

/** 查询 Skill 详情（响应） */
export type SkillDetailResponse = SkillPageRecord
