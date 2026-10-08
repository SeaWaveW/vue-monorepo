import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/user-manage',
		name: 'UserManage',
		component: () => import('../views/user-manage/index.vue'),
		meta: {
			defCode: 'user_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/add',
				name: 'UserManageAdd',
				component: () => import('../views/user-manage/add.vue'),
				meta: {
					defCode: 'user_manage_add_title',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/edit/:id',
				name: 'UserManageEdit',
				component: () => import('../views/user-manage/edit.vue'),
				meta: {
					defCode: 'user_manage_edit_title',
					labelCode: 'user_manage_edit_any',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/detail/:id',
				name: 'UserManageDetail',
				component: () => import('../views/user-manage/detail.vue'),
				meta: {
					defCode: 'user_manage_detail_title',
					labelCode: 'user_manage_detail_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
