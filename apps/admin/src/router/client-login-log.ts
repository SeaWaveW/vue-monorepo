import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/client-login-log',
		name: 'ClientLoginLog',
		component: () => import('../views/client-login-log/index.vue'),
		meta: {
			defCode: 'client_login_log_title',
			layout: true,
			cache: true,
		},
	},
]

export default routes
