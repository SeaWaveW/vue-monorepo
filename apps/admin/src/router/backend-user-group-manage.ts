import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/backend-user-group-manage',
		name: 'BackendUserGroupManage',
		component: () => import('../views/backend-user-group-manage/index.vue'),
		meta: {
			defCode: 'backend_user_group_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/add',
				name: 'BackendUserGroupManageAdd',
				component: () =>
					import('../views/backend-user-group-manage/add.vue'),
				meta: {
					defCode: 'backend_user_group_manage_add_title',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/edit/:id',
				name: 'BackendUserGroupManageEdit',
				component: () =>
					import('../views/backend-user-group-manage/edit.vue'),
				meta: {
					defCode: 'backend_user_group_manage_edit_title',
					labelCode: 'backend_user_group_manage_edit_any',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/detail/:id',
				name: 'BackendUserGroupManageDetail',
				component: () =>
					import('../views/backend-user-group-manage/detail.vue'),
				meta: {
					defCode: 'backend_user_group_manage_detail_title',
					labelCode: 'backend_user_group_manage_detail_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
