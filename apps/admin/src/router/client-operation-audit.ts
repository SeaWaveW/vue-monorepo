import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/client-operation-audit',
		name: 'ClientOperationAudit',
		component: () => import('../views/client-operation-audit/index.vue'),
		meta: {
			defCode: 'client_operation_audit_title',
			layout: true,
			cache: true,
		},
	},
]

export default routes
