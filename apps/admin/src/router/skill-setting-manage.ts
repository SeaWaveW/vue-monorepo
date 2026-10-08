import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/skill-setting-manage',
		name: 'SkillSettingManage',
		component: () => import('../views/skill-setting-manage/index.vue'),
		meta: {
			defCode: 'skill_setting_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/add',
				name: 'SkillSettingManageAdd',
				component: () =>
					import('../views/skill-setting-manage/add.vue'),
				meta: {
					defCode: 'skill_setting_manage_add_title',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/edit/:id',
				name: 'SkillSettingManageEdit',
				component: () =>
					import('../views/skill-setting-manage/edit.vue'),
				meta: {
					defCode: 'skill_setting_manage_edit_title',
					labelCode: 'skill_setting_manage_edit_any',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/detail/:id',
				name: 'SkillSettingManageDetail',
				component: () =>
					import('../views/skill-setting-manage/detail.vue'),
				meta: {
					defCode: 'skill_setting_manage_detail_title',
					labelCode: 'skill_setting_manage_detail_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
