import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/client-navigation-manage',
		name: 'ClientNavigationManage',
		component: () => import('../views/client-navigation-manage/index.vue'),
		meta: {
			defCode: 'client_navigation_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/add/:parentId',
				name: 'ClientNavigationManageAdd',
				component: () =>
					import('../views/client-navigation-manage/add.vue'),
				meta: {
					defCode: 'client_navigation_manage_add_title',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/edit/:id',
				name: 'ClientNavigationManageEdit',
				component: () =>
					import('../views/client-navigation-manage/edit.vue'),
				meta: {
					defCode: 'client_navigation_manage_edit_title',
					labelCode: 'client_navigation_manage_edit_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
