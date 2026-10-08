import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/client-subject-manage',
		name: 'ClientSubjectManage',
		component: () => import('../views/client-subject-manage/index.vue'),
		meta: {
			defCode: 'client_subject_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/add',
				name: 'ClientSubjectManageAdd',
				component: () =>
					import('../views/client-subject-manage/add.vue'),
				meta: {
					defCode: 'client_subject_manage_add_title',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/edit/:id',
				name: 'ClientSubjectManageEdit',
				component: () =>
					import('../views/client-subject-manage/edit.vue'),
				meta: {
					defCode: 'client_subject_manage_edit_title',
					labelCode: 'client_subject_manage_edit_any',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/detail/:id',
				name: 'ClientSubjectManageDetail',
				component: () =>
					import('../views/client-subject-manage/detail.vue'),
				meta: {
					defCode: 'client_subject_manage_detail_title',
					labelCode: 'client_subject_manage_detail_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
