/** 分页查询 Skill 类型。与 swagger / authApiList 权限串一致 */
export const SKILL_TYPE_PAGE = '/skill-type/page' as const

/** 新增 Skill 类型。与 swagger / authApiList 权限串一致 */
export const SKILL_TYPE_CREATE = '/skill-type/create' as const

/** 修改 Skill 类型。与 swagger / authApiList 权限串一致 */
export const SKILL_TYPE_UPDATE = '/skill-type/update' as const

/** 根据 ID 修改 Skill 类型备注。与 swagger / authApiList 权限串一致 */
export const SKILL_TYPE_UPDATE_REMARK = '/skill-type/update-remark' as const

/** 查询所有 Skill 类型。与 swagger / authApiList 权限串一致 */
export const SKILL_TYPE_ALL = '/skill-type/all' as const

/** 删除 Skill 类型。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const SKILL_TYPE_DELETE = '/skill-type/delete/{id}' as const

/** 查询 Skill 类型详情。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const SKILL_TYPE_DETAIL = '/skill-type/detail/{id}' as const
