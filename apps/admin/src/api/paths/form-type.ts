/** 分页查询表单类型。与 swagger / authApiList 权限串一致 */
export const FORM_TYPE_PAGE = '/form-type/page' as const

/** 新增表单类型。与 swagger / authApiList 权限串一致 */
export const FORM_TYPE_CREATE = '/form-type/create' as const

/** 修改表单类型。与 swagger / authApiList 权限串一致 */
export const FORM_TYPE_UPDATE = '/form-type/update' as const

/** 根据 ID 修改表单类型备注。与 swagger / authApiList 权限串一致 */
export const FORM_TYPE_UPDATE_REMARK = '/form-type/update-remark' as const

/** 查询所有表单类型。与 swagger / authApiList 权限串一致 */
export const FORM_TYPE_ALL = '/form-type/all' as const

/** 删除表单类型。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const FORM_TYPE_DELETE = '/form-type/delete/{id}' as const

/** 查询表单类型详情。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const FORM_TYPE_DETAIL = '/form-type/detail/{id}' as const
