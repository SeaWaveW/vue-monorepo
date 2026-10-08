import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/form-type-manage',
		name: 'FormTypeManage',
		component: () => import('../views/form-type-manage/index.vue'),
		meta: {
			defCode: 'form_type_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/add',
				name: 'FormTypeManageAdd',
				component: () => import('../views/form-type-manage/add.vue'),
				meta: {
					defCode: 'form_type_manage_add_title',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/edit/:id',
				name: 'FormTypeManageEdit',
				component: () => import('../views/form-type-manage/edit.vue'),
				meta: {
					defCode: 'form_type_manage_edit_title',
					labelCode: 'form_type_manage_edit_any',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/detail/:id',
				name: 'FormTypeManageDetail',
				component: () => import('../views/form-type-manage/detail.vue'),
				meta: {
					defCode: 'form_type_manage_detail_title',
					labelCode: 'form_type_manage_detail_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
