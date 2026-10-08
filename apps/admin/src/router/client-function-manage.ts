import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/client-function-manage',
		name: 'ClientFunctionManage',
		component: () => import('../views/client-function-manage/index.vue'),
		meta: {
			defCode: 'client_system_function_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/add',
				name: 'ClientFunctionManageAdd',
				component: () =>
					import('../views/client-function-manage/add.vue'),
				meta: {
					defCode: 'client_system_function_manage_add_title',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/edit/:id',
				name: 'ClientFunctionManageEdit',
				component: () =>
					import('../views/client-function-manage/edit.vue'),
				meta: {
					defCode: 'client_system_function_manage_edit_title',
					labelCode: 'client_system_function_manage_edit_any',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/detail/:id',
				name: 'ClientFunctionManageDetail',
				component: () =>
					import('../views/client-function-manage/detail.vue'),
				meta: {
					defCode: 'client_system_function_manage_detail_title',
					labelCode: 'client_system_function_manage_detail_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
