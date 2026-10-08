/** 分页查询动态表单。与 swagger / authApiList 权限串一致 */
export const DYNAMIC_FORM_PAGE = '/dynamic-form/page' as const

/** 新增动态表单。与 swagger / authApiList 权限串一致 */
export const DYNAMIC_FORM_CREATE = '/dynamic-form/create' as const

/** 修改动态表单基本信息。与 swagger / authApiList 权限串一致 */
export const DYNAMIC_FORM_UPDATE = '/dynamic-form/update' as const

/** 修改动态表单状态。与 swagger / authApiList 权限串一致 */
export const DYNAMIC_FORM_UPDATE_STATUS = '/dynamic-form/update-status' as const

/** 修改动态表单结构。与 swagger / authApiList 权限串一致 */
export const DYNAMIC_FORM_UPDATE_SCHEMA = '/dynamic-form/update-schema' as const

/** 修改动态表单备注。与 swagger / authApiList 权限串一致 */
export const DYNAMIC_FORM_UPDATE_REMARK = '/dynamic-form/update-remark' as const

/** 克隆动态表单。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const DYNAMIC_FORM_CLONE = '/dynamic-form/clone/{id}' as const

/** 删除动态表单。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const DYNAMIC_FORM_DELETE = '/dynamic-form/delete/{id}' as const

/** 查询动态表单详情。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const DYNAMIC_FORM_DETAIL = '/dynamic-form/detail/{id}' as const

/** 判断动态表单是否被使用。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const DYNAMIC_FORM_IS_USED = '/dynamic-form/is-used/{id}' as const
