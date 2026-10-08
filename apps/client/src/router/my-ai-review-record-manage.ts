import type { AppRouteRecordRaw } from '#/router'

const routes: AppRouteRecordRaw[] = [
	{
		path: '/my-ai-review-record-manage',
		name: 'MyAiReviewRecordManage',
		component: () =>
			import('../views/my-ai-review-record-manage/index.vue'),
		meta: {
			defCode: 'my_ai_review_record_manage_title',
			layout: true,
			cache: true,
		},
		children: [
			{
				path: '/detail/:id',
				name: 'MyAiReviewRecordManageDetail',
				component: () =>
					import('../views/my-ai-review-record-manage/detail.vue'),
				meta: {
					defCode: 'my_ai_review_record_manage_detail_title',
					labelCode: 'my_ai_review_record_manage_detail_any',
					layout: true,
					cache: true,
				},
			},
		],
	},
]

export default routes
