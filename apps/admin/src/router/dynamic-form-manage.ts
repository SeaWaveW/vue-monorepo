import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/dynamic-form-manage',
		name: 'DynamicFormManage',
		component: () => import('../views/dynamic-form-manage/index.vue'),
		meta: {
			defCode: 'dynamic_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/edit/:id',
				name: 'DynamicFormManageEdit',
				component: () =>
					import('../views/dynamic-form-manage/edit.vue'),
				meta: {
					defCode: 'dynamic_form_edit',
					labelCode: 'dynamic_form_edit_any',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/detail/:id',
				name: 'DynamicFormManageDetail',
				component: () =>
					import('../views/dynamic-form-manage/detail.vue'),
				meta: {
					defCode: 'dynamic_form_detail',
					labelCode: 'dynamic_form_detail_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
