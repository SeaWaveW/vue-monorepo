import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/ai-review-control',
		name: 'AiReviewControl',
		component: () => import('../views/ai-review-control/index.vue'),
		meta: {
			defCode: 'control_title',
			layout: true,
			cache: true,
			// single: true,
		},
	},
]

export default routes
