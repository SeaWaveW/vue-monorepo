import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/client-user-group-manage',
		name: 'ClientUserGroupManage',
		component: () => import('../views/client-user-group-manage/index.vue'),
		meta: {
			defCode: 'client_user_group_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/add',
				name: 'ClientUserGroupManageAdd',
				component: () =>
					import('../views/client-user-group-manage/add.vue'),
				meta: {
					defCode: 'client_user_group_manage_add_title',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/edit/:id',
				name: 'ClientUserGroupManageEdit',
				component: () =>
					import('../views/client-user-group-manage/edit.vue'),
				meta: {
					defCode: 'client_user_group_manage_edit_title',
					labelCode: 'client_user_group_manage_edit_any',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/detail/:id',
				name: 'ClientUserGroupManageDetail',
				component: () =>
					import('../views/client-user-group-manage/detail.vue'),
				meta: {
					defCode: 'client_user_group_manage_detail_title',
					labelCode: 'client_user_group_manage_detail_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
