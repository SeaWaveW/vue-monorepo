/** 分页查询审核 Agent。与 swagger / authApiList 权限串一致 */
export const REVIEW_AGENT_PAGE = '/review-agent/page' as const

/** 新增审核 Agent。与 swagger / authApiList 权限串一致 */
export const REVIEW_AGENT_CREATE = '/review-agent/create' as const

/** 修改审核 Agent。与 swagger / authApiList 权限串一致 */
export const REVIEW_AGENT_UPDATE = '/review-agent/update' as const

/** 根据 ID 修改审核 Agent 备注。与 swagger / authApiList 权限串一致 */
export const REVIEW_AGENT_UPDATE_REMARK = '/review-agent/update-remark' as const

/** 删除审核 Agent。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const REVIEW_AGENT_DELETE = '/review-agent/delete/{id}' as const

/** 查询审核 Agent 详情。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const REVIEW_AGENT_DETAIL = '/review-agent/detail/{id}' as const
