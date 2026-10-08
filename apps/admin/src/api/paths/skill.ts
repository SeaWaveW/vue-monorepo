/** 分页查询 Skill。与 swagger / authApiList 权限串一致 */
export const SKILL_PAGE = '/skill/page' as const

/** 新增 Skill。与 swagger / authApiList 权限串一致 */
export const SKILL_CREATE = '/skill/create' as const

/** 修改 Skill。与 swagger / authApiList 权限串一致 */
export const SKILL_UPDATE = '/skill/update' as const

/** 根据 ID 修改 Skill 备注。与 swagger / authApiList 权限串一致 */
export const SKILL_UPDATE_REMARK = '/skill/update-remark' as const

/** 删除 Skill。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const SKILL_DELETE = '/skill/delete/{id}' as const

/** 查询 Skill 详情。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const SKILL_DETAIL = '/skill/detail/{id}' as const
