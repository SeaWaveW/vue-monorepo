import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/client-ip-manage',
		name: 'ClientIpManage',
		component: () => import('../views/client-ip-manage/index.vue'),
		meta: {
			defCode: 'client_system_ip_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/add',
				name: 'ClientIpManageAdd',
				component: () => import('../views/client-ip-manage/add.vue'),
				meta: {
					defCode: 'client_system_ip_manage_add_title',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/edit/:id',
				name: 'ClientIpManageEdit',
				component: () => import('../views/client-ip-manage/edit.vue'),
				meta: {
					defCode: 'client_system_ip_manage_edit_title',
					labelCode: 'client_system_ip_manage_edit_any',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/detail/:id',
				name: 'ClientIpManageDetail',
				component: () => import('../views/client-ip-manage/detail.vue'),
				meta: {
					defCode: 'client_system_ip_manage_detail_title',
					labelCode: 'client_system_ip_manage_detail_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
