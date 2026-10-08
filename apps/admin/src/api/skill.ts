export type * from './types/skill'
export * from './paths/skill'

import type { SearchParams } from './types'
import type {
	SkillPageParams,
	SkillPageResponse,
	SkillCreateData,
	SkillUpdateData,
	SkillUpdateRemarkData,
	SkillDetailResponse,
} from './types/skill'
import { request } from '#/axios'
import {
	SKILL_PAGE,
	SKILL_CREATE,
	SKILL_UPDATE,
	SKILL_UPDATE_REMARK,
	SKILL_DELETE,
	SKILL_DETAIL,
} from './paths/skill'

/***************************** Skill 配置管理（管理不同 AI 应用开发平台的 Skill 配置） *****************************/

/** 分页查询 Skill */
export const skillPage = (params: SearchParams<SkillPageParams>) => {
	return request.get<SkillPageResponse>(SKILL_PAGE, { params })
}

/** 新增 Skill */
export const skillCreate = (data: SkillCreateData) => {
	return request.post(SKILL_CREATE, data)
}

/** 修改 Skill */
export const skillUpdate = (data: SkillUpdateData) => {
	return request.put(SKILL_UPDATE, data)
}

/** 根据 ID 修改 Skill 备注（仅修改备注，不修改 Skill 的其他字段） */
export const skillUpdateRemark = (data: SkillUpdateRemarkData) => {
	return request.put(SKILL_UPDATE_REMARK, data)
}

/** 删除 Skill */
export const skillDelete = (
	/** Skill ID */
	id: number,
) => {
	return request.delete(SKILL_DELETE.replace('{id}', `${id}`))
}

/** 查询 Skill 详情 */
export const skillDetail = (
	/** Skill ID */
	id: number,
) => {
	return request.get<SkillDetailResponse>(
		SKILL_DETAIL.replace('{id}', `${id}`),
	)
}
