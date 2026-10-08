/** 修改未达预期反馈。与 swagger / authApiList 权限串一致 */
export const REVIEW_RECORD_UPDATE_UNMET_EXPECTATION_FEEDBACK =
	'/review-record/update-unmet-expectation-feedback' as const

/** 审核记录重命名。与 swagger / authApiList 权限串一致 */
export const REVIEW_RECORD_RENAME = '/review-record/rename' as const

/** 匹配文件与上传组件。与 swagger / authApiList 权限串一致 */
export const REVIEW_RECORD_MATCH_FILE_UPLOAD_COMPONENTS =
	'/review-record/match-file-upload-components' as const

/** 新增审核任务记录。与 swagger / authApiList 权限串一致 */
export const REVIEW_RECORD_CREATE = '/review-record/create' as const

/** 分页查询租户审核记录。与 swagger / authApiList 权限串一致 */
export const REVIEW_RECORD_PAGE = '/review-record/page' as const

/** 分页查询本人审核记录。与 swagger / authApiList 权限串一致 */
export const REVIEW_RECORD_MY_PAGE = '/review-record/my-page' as const

/** 查询 Agent 审核时长统计。与 swagger / authApiList 权限串一致，保留 `{agentId}` */
export const REVIEW_RECORD_DURATION_STATISTICS =
	'/review-record/duration-statistics/{agentId}' as const

/** 查询审核记录详情。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const REVIEW_RECORD_DETAIL = '/review-record/detail/{id}' as const

/** 删除审核记录。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const REVIEW_RECORD_DELETE = '/review-record/delete/{id}' as const
