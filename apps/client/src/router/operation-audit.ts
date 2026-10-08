import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/operation-audit',
		name: 'OperationAudit',
		component: () => import('../views/operation-audit/index.vue'),
		meta: {
			defCode: 'operation_audit_title',
			layout: true,
			cache: true,
		},
	},
]

export default routes
