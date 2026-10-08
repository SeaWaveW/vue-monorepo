import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/backend-navigation-manage',
		name: 'BackendNavigationManage',
		component: () => import('../views/backend-navigation-manage/index.vue'),
		meta: {
			defCode: 'backend_navigation_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/add/:parentId',
				name: 'BackendNavigationManageAdd',
				component: () =>
					import('../views/backend-navigation-manage/add.vue'),
				meta: {
					defCode: 'backend_navigation_manage_add_title',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/edit/:id',
				name: 'BackendNavigationManageEdit',
				component: () =>
					import('../views/backend-navigation-manage/edit.vue'),
				meta: {
					defCode: 'backend_navigation_manage_edit_title',
					labelCode: 'backend_navigation_manage_edit_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
