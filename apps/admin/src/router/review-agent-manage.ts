import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/review-agent-manage',
		name: 'ReviewAgentManage',
		component: () => import('../views/review-agent-manage/index.vue'),
		meta: {
			defCode: 'review_agent_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/add',
				name: 'ReviewAgentManageAdd',
				component: () => import('../views/review-agent-manage/add.vue'),
				meta: {
					defCode: 'review_agent_manage_add_title',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/edit/:id',
				name: 'ReviewAgentManageEdit',
				component: () =>
					import('../views/review-agent-manage/edit.vue'),
				meta: {
					defCode: 'review_agent_manage_edit_title',
					labelCode: 'review_agent_manage_edit_any',
					layout: true,
					cache: true,
				},
			},
			{
				path: '/detail/:id',
				name: 'ReviewAgentManageDetail',
				component: () =>
					import('../views/review-agent-manage/detail.vue'),
				meta: {
					defCode: 'review_agent_manage_detail_title',
					labelCode: 'review_agent_manage_detail_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
