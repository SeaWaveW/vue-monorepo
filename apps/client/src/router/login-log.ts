import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/login-log',
		name: 'LoginLog',
		component: () => import('../views/login-log/index.vue'),
		meta: {
			defCode: 'login_log_title',
			layout: true,
			cache: true,
		},
	},
]

export default routes
