import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/client-user-manage',
		name: 'ClientUserManage',
		component: () => import('../views/client-user-manage/index.vue'),
		meta: {
			defCode: 'client_user_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/add',
				name: 'ClientUserManageAdd',
				component: () => import('../views/client-user-manage/add.vue'),
				meta: {
					defCode: 'client_user_manage_add_title',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/edit/:id',
				name: 'ClientUserManageEdit',
				component: () => import('../views/client-user-manage/edit.vue'),
				meta: {
					defCode: 'client_user_manage_edit_title',
					labelCode: 'client_user_manage_edit_any',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/detail/:id',
				name: 'ClientUserManageDetail',
				component: () =>
					import('../views/client-user-manage/detail.vue'),
				meta: {
					defCode: 'client_user_manage_detail_title',
					labelCode: 'client_user_manage_detail_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
