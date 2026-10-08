export type * from './types/client-tenant'
export * from './paths/client-tenant'

import type { SearchParams } from './types'
import type {
	ClientTenantPageParams,
	ClientTenantPageResponse,
	ClientTenantAllResponse,
	ClientTenantCreateData,
	ClientTenantUpdateData,
	ClientTenantUpdateStatusData,
	ClientTenantUpdateRemarkData,
	ClientTenantDetailResponse,
} from './types/client-tenant'
import { request } from '#/axios'
import {
	CLIENT_TENANT_ALL,
	CLIENT_TENANT_PAGE,
	CLIENT_TENANT_CREATE,
	CLIENT_TENANT_UPDATE,
	CLIENT_TENANT_UPDATE_STATUS,
	CLIENT_TENANT_UPDATE_REMARK,
	CLIENT_TENANT_DELETE,
	CLIENT_TENANT_DETAIL,
} from './paths/client-tenant'

/***************************** 租户管理（管理客户端租户信息） *****************************/

/** 查询所有客户（查询全部启用且未删除的客户主体，用于下拉框选择客户） */
export const clientTenantAll = () => {
	return request.get<ClientTenantAllResponse>(CLIENT_TENANT_ALL)
}

/** 分页查询租户（按照主体名称、类型、地址、备注和状态分页查询租户记录） */
export const clientTenantPage = (
	params: SearchParams<ClientTenantPageParams>,
) => {
	return request.get<ClientTenantPageResponse>(CLIENT_TENANT_PAGE, { params })
}

/** 新增租户（新增一条客户端租户记录） */
export const clientTenantCreate = (data: ClientTenantCreateData) => {
	return request.post(CLIENT_TENANT_CREATE, data)
}

/** 修改租户（根据租户 ID 修改租户信息） */
export const clientTenantUpdate = (data: ClientTenantUpdateData) => {
	return request.put(CLIENT_TENANT_UPDATE, data)
}

/** 修改租户状态（根据租户 ID 修改启用状态：1-启用，2-禁用，并更新编辑审计信息） */
export const clientTenantUpdateStatus = (
	data: ClientTenantUpdateStatusData,
) => {
	return request.put(CLIENT_TENANT_UPDATE_STATUS, data)
}

/** 根据 ID 修改租户备注（仅修改备注，不修改租户的其他字段） */
export const clientTenantUpdateRemark = (
	data: ClientTenantUpdateRemarkData,
) => {
	return request.put(CLIENT_TENANT_UPDATE_REMARK, data)
}

/** 删除租户 */
export const clientTenantDelete = (
	/** 租户 ID */
	id: number,
) => {
	return request.delete(CLIENT_TENANT_DELETE.replace('{id}', `${id}`))
}

/** 查询租户详情（根据租户 ID 查询一条租户记录） */
export const clientTenantDetail = (
	/** 租户 ID */
	id: number,
) => {
	return request.get<ClientTenantDetailResponse>(
		CLIENT_TENANT_DETAIL.replace('{id}', `${id}`),
	)
}
