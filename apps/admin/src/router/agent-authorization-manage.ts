import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/agent-authorization-manage',
		name: 'AgentAuthorizationManage',
		component: () =>
			import('../views/agent-authorization-manage/index.vue'),
		meta: {
			defCode: 'agent_authorization_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/add',
				name: 'AgentAuthorizationManageAdd',
				component: () =>
					import('../views/agent-authorization-manage/add.vue'),
				meta: {
					defCode: 'agent_authorization_manage_add_title',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
