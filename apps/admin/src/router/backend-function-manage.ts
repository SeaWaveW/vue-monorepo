import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/backend-function-manage',
		name: 'BackendFunctionManage',
		component: () => import('../views/backend-function-manage/index.vue'),
		meta: {
			defCode: 'backend_system_function_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/add',
				name: 'BackendFunctionManageAdd',
				component: () =>
					import('../views/backend-function-manage/add.vue'),
				meta: {
					defCode: 'backend_system_function_manage_add_title',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/edit/:id',
				name: 'BackendFunctionManageEdit',
				component: () =>
					import('../views/backend-function-manage/edit.vue'),
				meta: {
					defCode: 'backend_system_function_manage_edit_title',
					labelCode: 'backend_system_function_manage_edit_any',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/detail/:id',
				name: 'BackendFunctionManageDetail',
				component: () =>
					import('../views/backend-function-manage/detail.vue'),
				meta: {
					defCode: 'backend_system_function_manage_detail_title',
					labelCode: 'backend_system_function_manage_detail_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
