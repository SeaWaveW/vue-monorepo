import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/backend-ip-manage',
		name: 'BackendIpManage',
		component: () => import('../views/backend-ip-manage/index.vue'),
		meta: {
			defCode: 'backend_system_ip_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/add',
				name: 'BackendIpManageAdd',
				component: () => import('../views/backend-ip-manage/add.vue'),
				meta: {
					defCode: 'backend_system_ip_manage_add_title',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/edit/:id',
				name: 'BackendIpManageEdit',
				component: () => import('../views/backend-ip-manage/edit.vue'),
				meta: {
					defCode: 'backend_system_ip_manage_edit_title',
					labelCode: 'backend_system_ip_manage_edit_any',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/detail/:id',
				name: 'BackendIpManageDetail',
				component: () =>
					import('../views/backend-ip-manage/detail.vue'),
				meta: {
					defCode: 'backend_system_ip_manage_detail_title',
					labelCode: 'backend_system_ip_manage_detail_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
