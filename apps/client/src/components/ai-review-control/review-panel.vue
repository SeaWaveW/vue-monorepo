<template>
	<div class="review-panel">
		<SacoCard
			v-for="block in reviewBlocks"
			:key="block.key"
			:class="block.className"
			:header="block.header"
		>
			<template v-if="block.list.length">
				<div
					v-for="(item, index) in block.list"
					:key="item.id"
					class="review-item"
					@click="onReviewItemDblclick(item)"
				>
					<span class="review-item__name">
						{{ t('control_list_item', [index + 1, item.name]) }}
					</span>
				</div>
			</template>
			<div v-else-if="block.empty" class="saco-table">
				<div class="saco-table__empty">
					{{ t('no_data') }}
					<SacoSvg
						class="saco-table__empty-icon"
						name="arcoDesign-empty"
					/>
				</div>
			</div>
		</SacoCard>

		<ReviewProjectDetail
			v-model="dialogVisible"
			:review-item="reviewItem"
		/>
	</div>
</template>
<script lang="ts" setup name="AiReviewControlReviewPanel">
import ReviewProjectDetail from './review-project-detail.vue'
import {
	AI_REVIEW_CONTROL_KEY,
	type AiReviewControlContext,
} from '@/hooks/ai-review-control/context'

interface ReviewBlock {
	key: string
	className: string
	header: string
	list: ReviewAgentChecklistRecord[]
	empty: boolean
}

const { t } = useI18n()
const { task, agent } = inject(AI_REVIEW_CONTROL_KEY) as AiReviewControlContext
const dialogVisible = ref(false)
const reviewItem = ref<ReviewAgentChecklistRecord | null>(null)

const reviewBlocks = computed<ReviewBlock[]>(() => {
	const current = agent.currentAgent.value
	return [
		{
			key: 'ai',
			className: 'ai-review-list',
			header: t('control_ai_list'),
			list: current?.aiReviewChecklists ?? [],
			empty: false,
		},
		{
			key: 'manual',
			className: 'manual-review-list',
			header: t('control_artificial_list'),
			list: current?.manualReviewChecklists ?? [],
			empty: true,
		},
	]
})

watch(
	() => [task.taskId.value, task.agentId.value] as const,
	() => {
		dialogVisible.value = false
		reviewItem.value = null
	},
)

/** 审核双击查看详情 */
const onReviewItemDblclick = (item: ReviewAgentChecklistRecord) => {
	reviewItem.value = item
	dialogVisible.value = true
}
</script>
<style scoped lang="scss">
.review-panel {
	display: flex;
	flex-direction: column;

	$gap-size: var(--common-gap);

	gap: $gap-size;
	width: var(--review-panel-width);
	min-height: 0;

	:deep(.saco-card) {
		position: relative;
		padding: 0 0 calc(#{$gap-size} * 2);
		background-color: transparent !important;
		border: none !important;
		box-shadow: none !important;

		$item-height: 43px;
		$item-x-padding: calc(var(--common-gap) * 1.2);

		&.ai-review-list {
			flex: 2;
			min-height: 0;
			overflow: auto;
		}

		&.manual-review-list {
			flex: 1;
			min-height: 0;
			overflow: auto;
		}

		.saco-card__header {
			align-items: center;
			height: $item-height;
			padding: 0 $item-x-padding;
			margin-bottom: calc(var(--common-gap) * 0.9);
			font-size: 18px;
			font-weight: var(--font-bold);
			color: var(--black-color);
		}

		.saco-card__body {
			.review-item {
				display: flex;
				align-items: center;
				height: $item-height;
				padding: 0 $item-x-padding;
				margin-bottom: calc(var(--common-gap) * 0.1);
				font-size: 16px;
				cursor: pointer;
				user-select: none;
				border-radius: 8px;

				.review-item__name {
					// flex 子项默认 min-width:auto，不收会把省略号顶没
					flex: 1;
					min-width: 0;

					@include line-clamp(1);
				}

				&:hover {
					background-color: var(--white-color);
				}
			}
		}

		// &::after {
		// 	position: absolute;
		// 	right: 0;
		// 	bottom: 0;
		// 	left: 0;
		// 	height: 30px;
		// 	pointer-events: none;
		// 	content: '';
		// 	background-image: linear-gradient(
		// 		to bottom,
		// 		var(--grey-color-6),
		// 		var(--grey-color-11)
		// 	);
		// }
	}
}
</style>
