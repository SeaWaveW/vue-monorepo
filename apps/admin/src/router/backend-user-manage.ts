import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/backend-user-manage',
		name: 'BackendUserManage',
		component: () => import('../views/backend-user-manage/index.vue'),
		meta: {
			defCode: 'backend_user_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/add',
				name: 'BackendUserManageAdd',
				component: () => import('../views/backend-user-manage/add.vue'),
				meta: {
					defCode: 'backend_user_manage_add_title',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/edit/:id',
				name: 'BackendUserManageEdit',
				component: () =>
					import('../views/backend-user-manage/edit.vue'),
				meta: {
					defCode: 'backend_user_manage_edit_title',
					labelCode: 'backend_user_manage_edit_any',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/detail/:id',
				name: 'BackendUserManageDetail',
				component: () =>
					import('../views/backend-user-manage/detail.vue'),
				meta: {
					defCode: 'backend_user_manage_detail_title',
					labelCode: 'backend_user_manage_detail_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
