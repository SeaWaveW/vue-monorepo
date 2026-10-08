/** 分页查询 IP 白名单。与 swagger / authApiList 权限串一致 */
export const ADMIN_IP_WHITE_PAGE = '/admin-ip-white/page' as const

/** 新增 IP 白名单。与 swagger / authApiList 权限串一致 */
export const ADMIN_IP_WHITE_CREATE = '/admin-ip-white/create' as const

/** 修改 IP 白名单。与 swagger / authApiList 权限串一致 */
export const ADMIN_IP_WHITE_UPDATE = '/admin-ip-white/update' as const

/** 修改 IP 白名单状态。与 swagger / authApiList 权限串一致 */
export const ADMIN_IP_WHITE_UPDATE_STATUS =
	'/admin-ip-white/update-status' as const

/** 根据 ID 修改 IP 白名单备注。与 swagger / authApiList 权限串一致 */
export const ADMIN_IP_WHITE_UPDATE_REMARK =
	'/admin-ip-white/update-remark' as const

/** 克隆 IP 白名单。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const ADMIN_IP_WHITE_CLONE = '/admin-ip-white/clone/{id}' as const

/** 删除 IP 白名单。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const ADMIN_IP_WHITE_DELETE = '/admin-ip-white/delete/{id}' as const

/** 查询 IP 白名单详情。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const ADMIN_IP_WHITE_DETAIL = '/admin-ip-white/detail/{id}' as const
