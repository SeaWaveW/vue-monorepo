import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/backend-operation-audit',
		name: 'BackendOperationAudit',
		component: () => import('../views/backend-operation-audit/index.vue'),
		meta: {
			defCode: 'backend_operation_audit_title',
			layout: true,
			cache: true,
		},
	},
]

export default routes
