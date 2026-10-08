/** 分页查询客户 IP 白名单。与 swagger / authApiList 权限串一致 */
export const CLIENT_IP_WHITE_PAGE = '/client-ip-white/page' as const

/** 新增客户 IP 白名单。与 swagger / authApiList 权限串一致 */
export const CLIENT_IP_WHITE_CREATE = '/client-ip-white/create' as const

/** 修改客户 IP 白名单。与 swagger / authApiList 权限串一致 */
export const CLIENT_IP_WHITE_UPDATE = '/client-ip-white/update' as const

/** 修改客户 IP 白名单状态。与 swagger / authApiList 权限串一致 */
export const CLIENT_IP_WHITE_UPDATE_STATUS =
	'/client-ip-white/update-status' as const

/** 修改客户 IP 白名单备注。与 swagger / authApiList 权限串一致 */
export const CLIENT_IP_WHITE_UPDATE_REMARK =
	'/client-ip-white/update-remark' as const

/** 克隆客户 IP 白名单。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const CLIENT_IP_WHITE_CLONE = '/client-ip-white/clone/{id}' as const

/** 删除客户 IP 白名单。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const CLIENT_IP_WHITE_DELETE = '/client-ip-white/delete/{id}' as const

/** 查询客户 IP 白名单详情。与 swagger / authApiList 权限串一致，保留 `{id}` */
export const CLIENT_IP_WHITE_DETAIL = '/client-ip-white/detail/{id}' as const
