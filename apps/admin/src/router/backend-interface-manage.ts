import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/backend-interface-manage',
		name: 'BackendInterfaceManage',
		component: () => import('../views/backend-interface-manage/index.vue'),
		meta: {
			defCode: 'backend_system_interface_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/add',
				name: 'BackendInterfaceManageAdd',
				component: () =>
					import('../views/backend-interface-manage/add.vue'),
				meta: {
					defCode: 'backend_system_interface_manage_add_title',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/edit/:id',
				name: 'BackendInterfaceManageEdit',
				component: () =>
					import('../views/backend-interface-manage/edit.vue'),
				meta: {
					defCode: 'backend_system_interface_manage_edit_title',
					labelCode: 'backend_system_interface_manage_edit_any',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/detail/:id',
				name: 'BackendInterfaceManageDetail',
				component: () =>
					import('../views/backend-interface-manage/detail.vue'),
				meta: {
					defCode: 'backend_system_interface_manage_detail_title',
					labelCode: 'backend_system_interface_manage_detail_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
