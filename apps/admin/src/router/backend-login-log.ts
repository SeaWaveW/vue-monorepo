import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/backend-login-log',
		name: 'BackendLoginLog',
		component: () => import('../views/backend-login-log/index.vue'),
		meta: {
			defCode: 'backend_login_log_title',
			layout: true,
			cache: true,
		},
	},
]

export default routes
