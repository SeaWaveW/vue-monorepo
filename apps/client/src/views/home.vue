<template>
	<div class="home-page">
		<div class="info-rows">
			<InfoOverview :items="infoList" />
		</div>
		<div class="trend-ranking-active">
			<AiTrend class="ai-trend" />
			<TokenTrend class="token-trend" />
			<AgentRanking class="agent-ranking" />
			<TenantActive class="tenant-active" />
		</div>
	</div>
</template>
<script lang="ts" setup name="Home">
import { treeToFlat } from '#/utils/tree'

import AiTrend from '@/components/home/ai-trend.vue'
import TokenTrend from '@/components/home/token-trend.vue'
import AgentRanking from '@/components/home/agent-ranking.vue'
import TenantActive from '@/components/home/tenant-active.vue'
import InfoOverview, {
	type InfoOverviewItem,
} from '@/components/home/info-overview.vue'
import { useUserStore } from '#/store'
const { t } = useI18n()
const userStore = useUserStore()
/** 概览暂无接口，先按稿面占位 */
const infoList = computed<InfoOverviewItem[]>(() => [
	{
		title: t('home_tast'),
		count: '186',
		icon: 'ze-todo-list',
		desc: t('home_yesterday'),
		direction: 'up',
		ratio: '12.4%',
		ratioType: 'success',
	},
	{
		title: t('home_file'),
		count: '742',
		icon: 'md-assignment',
		desc: t('home_yesterday'),
		direction: 'up',
		ratio: '8.7%',
		ratioType: 'success',
	},
	{
		title: t('home_project'),
		count: '3864',
		icon: 'riFill-checkbox-circle-fill',
		desc: t('home_yesterday'),
		direction: 'up',
		ratio: '10.4%',
		ratioType: 'success',
	},
	{
		title: t('home_abnor'),
		count: '217',
		icon: 'md-error',
		desc: t('home_yesterday'),
		direction: 'down',
		ratio: '15.4%',
		ratioType: 'danger',
	},
	{
		title: t('home_take_time'),
		count: '38.6s',
		icon: 'md-watch-later',
		desc: t('home_yesterday'),
		direction: 'down',
		ratio: '12.4%',
		ratioType: 'danger',
	},
	{
		title: t('home_token_use'),
		count: '8.42M',
		icon: 'riFill-database-2-fill',
		desc: t('home_yesterday'),
		direction: 'up',
		ratio: '9.3%',
		ratioType: 'success',
	},
])
// 权限列表
const getApiList = () => {
	authApiList().then((res) => {
		userStore.setApiPaths(res.data || [])
	})
}
// 收藏菜单
const getCollectMenu = () => {
	clientFavoriteNavigationList().then((res) => {
		userStore.setCollectMenu(res.data || [])
	})
}
// 可访问菜单
const getAccessibleMenu = () => {
	clientNavigationAuthorizedTree().then((res) => {
		const treeData = res.data || []
		const treeList = treeData[0]?.children || []
		userStore.setAccessibleMenu(treeList)
		const flatList = treeToFlat(treeList, 'children')
		const routerPaths = flatList
			.map((item) => item.pagePath)
			.filter(Boolean) as string[]
		userStore.setRouterPaths(routerPaths)
	})
}

onMounted(() => {
	getApiList()
	getCollectMenu()
	getAccessibleMenu()
})
</script>
<style scoped lang="scss">
.home-page {
	--home-column-gap: 35px;
	--home-row-gap: 19px;

	display: flex;
	flex-direction: column;
	height: 100%;
	min-height: 0;

	.info-rows {
		flex-shrink: 0;
		margin-bottom: var(--home-row-gap);
	}

	.trend-ranking-active {
		display: grid;
		flex: 1;
		grid-template-rows: repeat(2, minmax(0, 1fr));
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--home-row-gap) var(--home-column-gap);
		min-height: 0;

		:deep(.saco-card) {
			display: flex;
			flex-direction: column;
			height: 100%;
			min-height: 0;
			padding: 0;
			margin: 0 !important;
			background-color: var(--white-color-4) !important;
			border: none !important;
			border-radius: 20px !important;

			--top-size: 31px;
			--left-right-size: 46px;
			--bottom-size: 10px;

			.saco-card__header {
				padding: var(--top-size) var(--left-right-size) 0 !important;
				margin-bottom: calc(var(--common-gap) * 2.5) !important;
				font-size: 20px !important;
				font-weight: var(--font-bold) !important;
				color: var(--black-color-1) !important;
			}

			&.ai-trend,
			&.token-trend {
				.saco-card__body {
					display: flex;
					flex: 1;
					min-height: 0;
					padding: 0 calc(var(--left-right-size) / 2)
						var(--bottom-size) !important;

					> .chart-box {
						flex: 1;
						width: 100%;
						min-width: 0;
						min-height: 0;
					}
				}
			}

			&.agent-ranking,
			&.tenant-active {
				.saco-card__body {
					padding: 0 !important;

					.saco-table {
						flex: 1;
						width: 100%;
						min-width: 0;
						height: max-content;
						background-color: var(--white-color) !important;

						.saco-table__header {
							.saco-table__cell {
								background-color: var(--white-color) !important;
								border-color: var(--white-color) !important;
							}
						}

						.saco-table__body {
							.saco-table__cell {
								background-color: transparent !important;
								border-color: transparent !important;
							}
						}

						.saco-table__cell {
							.metric-box {
								display: flex;
								flex-direction: column;
								gap: calc(var(--common-gap) * 0.4);
								width: 100%;

								&__value {
									font-size: var(--font-size);
									color: var(--black-color);
									text-align: left;
								}

								.saco-progress {
									width: 100%;

									.saco-progress__bar-outer {
										background-color: var(--grey-color-11);
									}
								}
							}
						}
					}
				}
			}
		}
	}
}
</style>
<style scoped lang="scss">
// 短边小于 600 的 h5 / app 才按手机排首页。pc、pwa 拉窗口，以及平板，仍用桌面布局
html[data-device-type='h5'],
html[data-device-type='app'] {
	@media (width <= 599px), (height <= 599px) {
		.home-page {
			--home-column-gap: 18px;
			--home-row-gap: 10px;

			height: auto;
			min-height: 100%;

			.trend-ranking-active {
				flex: none;
				grid-template-rows: minmax(400px, auto) auto;

				:deep(.ai-trend),
				:deep(.token-trend) {
					min-height: 400px;
				}

				:deep(.agent-ranking),
				:deep(.tenant-active) {
					height: auto;
				}
			}
		}
	}
}
</style>
