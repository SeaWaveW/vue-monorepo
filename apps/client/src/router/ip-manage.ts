import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/ip-manage',
		name: 'IpManage',
		component: () => import('../views/ip-manage/index.vue'),
		meta: {
			defCode: 'system_ip_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/add',
				name: 'IpManageAdd',
				component: () => import('../views/ip-manage/add.vue'),
				meta: {
					defCode: 'system_ip_manage_add_title',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/edit/:id',
				name: 'IpManageEdit',
				component: () => import('../views/ip-manage/edit.vue'),
				meta: {
					defCode: 'system_ip_manage_edit_title',
					labelCode: 'system_ip_manage_edit_any',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/detail/:id',
				name: 'IpManageDetail',
				component: () => import('../views/ip-manage/detail.vue'),
				meta: {
					defCode: 'system_ip_manage_detail_title',
					labelCode: 'system_ip_manage_detail_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
