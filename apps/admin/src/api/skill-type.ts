export type * from './types/skill-type'
export * from './paths/skill-type'

import type { SearchParams } from './types'
import type {
	SkillTypePageParams,
	SkillTypePageResponse,
	SkillTypeAllResponse,
	SkillTypeCreateData,
	SkillTypeUpdateData,
	SkillTypeUpdateRemarkData,
	SkillTypeDetailResponse,
} from './types/skill-type'
import { request } from '#/axios'
import {
	SKILL_TYPE_PAGE,
	SKILL_TYPE_ALL,
	SKILL_TYPE_CREATE,
	SKILL_TYPE_UPDATE,
	SKILL_TYPE_UPDATE_REMARK,
	SKILL_TYPE_DELETE,
	SKILL_TYPE_DETAIL,
} from './paths/skill-type'

/***************************** Skill 类型管理（管理 Skill 类型） *****************************/

/** 分页查询 Skill 类型 */
export const skillTypePage = (params: SearchParams<SkillTypePageParams>) => {
	return request.get<SkillTypePageResponse>(SKILL_TYPE_PAGE, { params })
}

/** 查询所有 Skill 类型（查询全部未删除的 Skill 类型，用于下拉框选择） */
export const skillTypeAll = () => {
	return request.get<SkillTypeAllResponse>(SKILL_TYPE_ALL)
}

/** 新增 Skill 类型 */
export const skillTypeCreate = (data: SkillTypeCreateData) => {
	return request.post(SKILL_TYPE_CREATE, data)
}

/** 修改 Skill 类型 */
export const skillTypeUpdate = (data: SkillTypeUpdateData) => {
	return request.put(SKILL_TYPE_UPDATE, data)
}

/** 根据 ID 修改 Skill 类型备注（仅修改备注，不修改 Skill 类型的其他字段） */
export const skillTypeUpdateRemark = (data: SkillTypeUpdateRemarkData) => {
	return request.put(SKILL_TYPE_UPDATE_REMARK, data)
}

/** 删除 Skill 类型 */
export const skillTypeDelete = (
	/** Skill 类型 ID */
	id: number,
) => {
	return request.delete(SKILL_TYPE_DELETE.replace('{id}', `${id}`))
}

/** 查询 Skill 类型详情 */
export const skillTypeDetail = (
	/** Skill 类型 ID */
	id: number,
) => {
	return request.get<SkillTypeDetailResponse>(
		SKILL_TYPE_DETAIL.replace('{id}', `${id}`),
	)
}
