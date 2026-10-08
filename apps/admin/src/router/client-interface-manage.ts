import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/client-interface-manage',
		name: 'ClientInterfaceManage',
		component: () => import('../views/client-interface-manage/index.vue'),
		meta: {
			defCode: 'client_system_interface_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/add',
				name: 'ClientInterfaceManageAdd',
				component: () =>
					import('../views/client-interface-manage/add.vue'),
				meta: {
					defCode: 'client_system_interface_manage_add_title',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/edit/:id',
				name: 'ClientInterfaceManageEdit',
				component: () =>
					import('../views/client-interface-manage/edit.vue'),
				meta: {
					defCode: 'client_system_interface_manage_edit_title',
					labelCode: 'client_system_interface_manage_edit_any',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/detail/:id',
				name: 'ClientInterfaceManageDetail',
				component: () =>
					import('../views/client-interface-manage/detail.vue'),
				meta: {
					defCode: 'client_system_interface_manage_detail_title',
					labelCode: 'client_system_interface_manage_detail_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
