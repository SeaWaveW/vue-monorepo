import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/user-group-manage',
		name: 'UserGroupManage',
		component: () => import('../views/user-group-manage/index.vue'),
		meta: {
			defCode: 'user_group_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/add',
				name: 'UserGroupManageAdd',
				component: () => import('../views/user-group-manage/add.vue'),
				meta: {
					defCode: 'user_group_manage_add_title',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/edit/:id',
				name: 'UserGroupManageEdit',
				component: () => import('../views/user-group-manage/edit.vue'),
				meta: {
					defCode: 'user_group_manage_edit_title',
					labelCode: 'user_group_manage_edit_any',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/detail/:id',
				name: 'UserGroupManageDetail',
				component: () =>
					import('../views/user-group-manage/detail.vue'),
				meta: {
					defCode: 'user_group_manage_detail_title',
					labelCode: 'user_group_manage_detail_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
