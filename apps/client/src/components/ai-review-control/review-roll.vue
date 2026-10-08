<template>
	<div
		class="review-roll"
		:style="{
			'--roll-item-height': `${ROLL_ITEM_HEIGHT}px`,
			'--roll-visible': visibleCount,
			'--roll-above': aboveCount,
		}"
	>
		<div class="review-roll__pane">
			<div class="review-roll__track" :style="topTrackStyle">
				<div
					v-for="(item, index) in list"
					:key="item.key"
					class="review-roll__item"
					:class="readItemClass(index)"
					:style="readItemStyle(index)"
				>
					<SacoRadio
						:model-value="index <= currentIndex"
						:label="true"
					>
						{{ readItemText(item) }}
					</SacoRadio>
				</div>
			</div>
		</div>
		<div v-if="currentItem" class="review-roll__current">
			<div
				class="review-roll__item is-current"
				:style="readItemStyle(safeIndex)"
			>
				<SacoRadio :model-value="true" :label="true">
					{{ readItemText(currentItem) }}
				</SacoRadio>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
interface ReviewCountItem {
	isFixed: boolean
}

/** 中间审核项总数，前后固定项不占份 */
export const readRestTotal = (list: ReviewCountItem[]) => {
	let total = 0
	for (const item of list) {
		if (item.isFixed) {
			continue
		}
		total += 1
	}
	return total
}

/** 播到 index（含）时占用百分比的中间项数，前后固定项不占份 */
export const readRestDoneCount = (list: ReviewCountItem[], index: number) => {
	if (index < 0) {
		return 0
	}
	let done = 0
	for (let i = 0; i <= index; i += 1) {
		if (list[i]?.isFixed) {
			continue
		}
		done += 1
	}
	return done
}

/**
 * 播完 index 时中间项应到的进度（0–100）。
 * 弹窗按本项时长从上一拍插到这个值，不瞬间跳满。
 */
export const readReviewProgress = (list: ReviewCountItem[], index: number) => {
	const total = readRestTotal(list)
	if (total <= 0) {
		return 0
	}
	return (readRestDoneCount(list, index) / total) * 100
}
</script>
<script lang="ts" setup name="ReviewRoll">
const ROLL_ITEM_HEIGHT = 30

interface ReviewRollItem {
	key: string
	name: string
	isFixed: boolean
	/** 前固定项：露出行数跟它的条数走 */
	isPrefix: boolean
}

const props = defineProps<{
	list: ReviewRollItem[]
	currentIndex: number
	/** 当前项滚到正中的过渡时长，跟弹窗这一拍一致 */
	duration: number
}>()

const { t } = useI18n()

const safeIndex = computed(() => {
	return Math.max(props.currentIndex, 0)
})

const currentItem = computed(() => {
	if (props.currentIndex < 0) {
		return undefined
	}
	return props.list[props.currentIndex]
})

/** 露出行数跟前固定项条数走，至少给当前项留一行 */
const visibleCount = computed(() => {
	let count = 0
	for (const item of props.list) {
		if (!item.isPrefix) {
			continue
		}
		count += 1
	}
	return Math.max(count, 1)
})

const aboveCount = computed(() => {
	return visibleCount.value - 1
})

const topTrackStyle = computed(() => {
	return {
		transform: `translateY(${(aboveCount.value - safeIndex.value) * ROLL_ITEM_HEIGHT}px)`,
	}
})

const readItemClass = (index: number) => {
	return {
		'is-done': index < props.currentIndex,
	}
}

const readItemStyle = (index: number) => {
	return {
		'--item-distance': Math.abs(index - safeIndex.value),
	}
}

const readItemText = (item: ReviewRollItem) => {
	if (item.isFixed) {
		return item.name
	}
	return t('control_reviewing_item', [item.name])
}
</script>
<style scoped lang="scss">
.review-roll {
	position: relative;
	flex-shrink: 0;
	width: 100%;
	height: calc(var(--roll-item-height) * var(--roll-visible));
	margin-top: calc(var(--common-gap) * 0.6);
	overflow: hidden;

	.review-roll__pane {
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		height: calc(var(--roll-item-height) * var(--roll-above));
		overflow: hidden;

		&::before {
			position: absolute;
			inset: 0;
			z-index: 1;
			pointer-events: none;
			content: '';
			background-image: linear-gradient(
				to bottom,
				var(--white-color-1),
				transparent
			);
		}
	}

	.review-roll__current {
		position: absolute;
		top: calc(var(--roll-item-height) * var(--roll-above));
		right: 0;
		left: 0;
		height: var(--roll-item-height);
	}

	.review-roll__item {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		height: var(--roll-item-height);
		color: var(--black-color);

		:deep(.saco-radio) {
			--radio-size: var(--svg-size);
			--radio-input-height: var(--svg-size);
			--radio-font-size: var(--font-size);

			height: auto;
			margin-right: 0;
			font-size: var(--font-size);
			color: inherit;
			pointer-events: none;
			cursor: default;
		}

		:deep(.saco-radio__label) {
			padding-left: calc(var(--common-gap) * 0.8);
			font-size: var(--font-size);
			color: inherit;
		}

		:deep(.saco-radio__input.is-checked .saco-radio__inner) {
			// 跟库一样空心环，只换环和点的颜色
			background-color: var(--white-color);
			border-color: var(--primary-color);

			&::after {
				background-color: var(--primary-color);
			}
		}
	}

	.review-roll__item.is-done {
		:deep(.saco-radio__input.is-checked .saco-radio__inner) {
			background-color: var(--white-color);
			border-color: var(--success-color);

			&::after {
				background-color: var(--success-color);
			}
		}
	}

	.review-roll__item.is-current {
		font-weight: var(--font-bold);
		color: var(--primary-color);

		:deep(.saco-radio) {
			font-weight: var(--font-bold);
		}

		:deep(.saco-radio__label) {
			position: relative;
			font-weight: var(--font-bold);

			&::after {
				position: absolute;
				top: 0;
				left: 0;
				width: 2em;
				height: 100%;
				pointer-events: none;
				content: '';
				background-color: var(--white-color-1);
				opacity: 0.35;
				animation: review-text-scan 1.2s linear infinite;
			}
		}

		@at-root {
			@keyframes review-text-scan {
				0% {
					left: 0;
					transform: translateX(-100%) skewX(-20deg);
				}

				100% {
					left: 100%;
					transform: translateX(0) skewX(-20deg);
				}
			}
		}
	}
}
</style>
