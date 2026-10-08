import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/ai-review-record-manage',
		name: 'AiReviewRecordManage',
		component: () => import('../views/ai-review-record-manage/index.vue'),
		meta: {
			defCode: 'ai_review_record_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/detail/:id',
				name: 'AiReviewRecordManageDetail',
				component: () =>
					import('../views/ai-review-record-manage/detail.vue'),
				meta: {
					defCode: 'ai_review_record_manage_detail_title',
					labelCode: 'ai_review_record_manage_detail_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
