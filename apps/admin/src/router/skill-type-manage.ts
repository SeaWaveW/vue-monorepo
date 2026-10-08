import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/skill-type-manage',
		name: 'SkillTypeManage',
		component: () => import('../views/skill-type-manage/index.vue'),
		meta: {
			defCode: 'skill_type_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/add',
				name: 'SkillTypeManageAdd',
				component: () => import('../views/skill-type-manage/add.vue'),
				meta: {
					defCode: 'skill_type_manage_add_title',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/edit/:id',
				name: 'SkillTypeManageEdit',
				component: () => import('../views/skill-type-manage/edit.vue'),
				meta: {
					defCode: 'skill_type_manage_edit_title',
					labelCode: 'skill_type_manage_edit_any',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/detail/:id',
				name: 'SkillTypeManageDetail',
				component: () =>
					import('../views/skill-type-manage/detail.vue'),
				meta: {
					defCode: 'skill_type_manage_detail_title',
					labelCode: 'skill_type_manage_detail_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
