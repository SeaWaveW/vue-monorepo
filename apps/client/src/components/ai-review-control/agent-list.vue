<template>
	<SacoCard
		ref="agentListRef"
		class="agent-list"
		:class="{ 'is-expand': isExpand }"
	>
		<template #header>
			<div class="card-title">
				<h2>{{ t('control_select_agent') }}</h2>
				<p>{{ t('control_agent_tips') }}</p>
			</div>
			<div
				v-if="currentAgent"
				class="card-action"
				:class="{ 'is-fold-active': isFoldActive }"
			>
				<label>
					{{ t('control_agent_current', [currentAgent?.name]) }}
				</label>
				<SacoSvg
					v-if="showExpand"
					class="card-action__icon"
					name="iconPark-double-down"
					:class="{ 'is-expand': isExpand }"
					@click="isExpand = !isExpand"
				/>
			</div>
		</template>
		<div
			class="agent-expand-box"
			:class="{ 'is-expand': isExpand }"
			:style="{
				'--agent-rows': agentRows,
				'--agent-max-rows': AGENT_MAX_ROWS,
			}"
		>
			<div class="agent-expand-box__list">
				<SacoTabs
					v-model="activeAgentId"
					sortable
					:before-leave="onAgentBeforeLeave"
					:style="{
						'--agent-sum': AGENT_SUM,
					}"
					@tab-sort="onAgentTabSort"
				>
					<SacoTabPane
						v-for="item in agentList"
						:key="item.id"
						:name="item.id"
						:draggable="true"
					>
						<template #label>
							<SacoTooltip
								placement="bottom-start"
								popper-class="agent-tab-tooltip"
								transition="agent-tab-tooltip-fade"
								:offset="8"
								:show-after="800"
							>
								<template #default="{ bindClamp }">
									<div
										class="agent-tab"
										:class="{
											'is-active':
												item.id === activeAgentId,
										}"
									>
										<div class="agent-tab__name">
											<label :ref="bindClamp">
												{{ item.name }}
											</label>
											<SacoSvg
												v-if="item.id === activeAgentId"
												class="agent-tab__check"
												name="circle-check-filled"
											/>
										</div>
										<p
											:ref="bindClamp"
											class="agent-tab__desc"
										>
											{{ item.description }}
										</p>
									</div>
								</template>
								<template #content>
									<div class="agent-tab-tooltip">
										<div class="agent-tab">
											<div class="agent-tab__name">
												<label>{{ item.name }}</label>
											</div>
											<p
												v-if="item.description"
												class="agent-tab__desc"
											>
												{{ item.description }}
											</p>
										</div>
									</div>
								</template>
							</SacoTooltip>
						</template>
					</SacoTabPane>
				</SacoTabs>
			</div>
		</div>
	</SacoCard>
</template>
<script lang="ts" setup name="AiReviewControlAgentList">
import { AGENT_SUM, AGENT_MAX_ROWS } from '@/hooks/ai-review-control/agent'
import {
	AI_REVIEW_CONTROL_KEY,
	type AiReviewControlContext,
} from '@/hooks/ai-review-control/context'

const emit = defineEmits<{
	beforeLeave: []
}>()

const { t } = useI18n()
const control = inject(AI_REVIEW_CONTROL_KEY) as AiReviewControlContext
const {
	activeAgentId,
	onAgentTabSort,
	showExpand,
	isExpand,
	agentRows,
	agentList,
	currentAgent,
} = control.agent
const agentListRef = ref<{ $el: HTMLElement } | null>(null)

/** 换签前先静默：子组件回写空值时不要再 validateField */
const onAgentBeforeLeave = () => {
	isExpand.value = false
	emit('beforeLeave')
	return true
}

/** 展开时点卡片外就收；点自己（含箭头）不收，避免刚展开被同一下 document click 关掉 */
const docClick = (event: MouseEvent) => {
	if (!isExpand.value) {
		return
	}
	const root = agentListRef.value?.$el
	const target = event.target
	if (!root || !(target instanceof Node) || root.contains(target)) {
		return
	}
	isExpand.value = false
}

const isFoldActive = computed(() => {
	const index = agentList.value.findIndex((item) => {
		return item.id === activeAgentId.value
	})
	return index >= AGENT_SUM
})

onMounted(() => {
	document.addEventListener('click', docClick)
})
onBeforeUnmount(() => {
	document.removeEventListener('click', docClick)
})
</script>
<style scoped lang="scss">
@use '#/style/dynamic-form.scss' as *;
@use './agent-tab.scss' as *;

$x-gap: calc(var(--common-gap) * 3);
$y-gap: calc(var(--common-gap) * 1.7);
$radius: 20px;

.agent-list {
	z-index: 1;

	// 库默认 inline-flex，嵌在已 deep 的块里再套 :deep 选择器对不上
	:deep(.saco-tabs__item .saco-tooltip__trigger) {
		display: flex;
		width: 100%;
		min-width: 0;
		height: 100%;
	}

	// 列 flex 子项默认 min-width:auto，长名称会把卡撑出面板，省略号没有宽度
	min-width: 0;
	overflow: visible !important;

	&.is-expand {
		z-index: 2;
	}

	:deep(.saco-card__header) {
		gap: calc(var(--common-gap) * 4);
		align-items: flex-start;
		padding: $x-gap $x-gap 0;
		margin-bottom: 0;

		.card-title {
			flex-shrink: 0;
			white-space: nowrap;
		}

		.card-action {
			display: flex;
			gap: calc(var(--common-gap) * 3.7);
			min-width: 0;

			label {
				min-width: 0;
				font-size: 18px;
				font-weight: var(--font-bold);
				color: var(--primary-color);
				cursor: auto;

				@include line-clamp(1);
			}

			.card-action__icon {
				flex-shrink: 0;
				font-size: 24px;
				color: var(--black-color);
				cursor: pointer;
				user-select: none;
				transition: transform 0.3s ease-in-out;

				&.is-expand {
					transform: rotate(180deg);
				}
			}

			&.is-fold-active {
				label {
					animation: var(--twinkle-animation);
				}
			}
		}
	}

	$open-line: 5px;

	:deep(.saco-card__body) {
		--tab-item-height: 82px;

		position: relative;
		min-height: calc(#{$y-gap} * 2 + var(--tab-item-height));
		padding: 0;
		overflow: visible !important;

		.agent-expand-box {
			// 垫在外、裁切在内：max-height 和 overflow 不能跟 padding 叠在同一盒，
			// 否则展开时底内边距下移，第一行和下一行的间距会跳一下。
			// 滚动也不能加在 .saco-tabs__header（库是 align-items:center，会裁顶）。
			$tab-height: 82px;
			$tab-gap: calc(var(--common-gap) * 1.6);
			$open-tabs: calc(
				#{$tab-height} * min(var(--agent-rows), var(--agent-max-rows)) +
					#{$tab-gap} *
					(min(var(--agent-rows), var(--agent-max-rows)) - 1)
			);

			position: absolute;
			top: 0;
			right: 0;
			left: 0;
			z-index: 2;
			padding: $y-gap $x-gap;
			background-color: var(--grey-color-20);
			border-radius: 0 0 $radius $radius;
			transition: box-shadow 0.3s ease-in-out;

			.agent-expand-box__list {
				max-height: $tab-height;
				overflow: hidden;

				// 收起也占槽，展开才出条时列宽不变；both-edges 左边补同样宽，两边齐
				scrollbar-gutter: stable both-edges;
				transition: max-height 0.3s ease-in-out;
			}

			.saco-tabs {
				@include tabs-scroll-border(
					$item-size: var(--agent-sum),
					$item-height: var(--tab-item-height),
					$item-font-size: 18px,
					$active-border-width: 5px,
					$active-border-radius: 5px,
					$item-gap: calc(var(--common-gap) * 1.6)
				);

				.saco-tabs__header {
					flex-shrink: 0;
					align-items: flex-start;
					overflow-x: hidden;

					.saco-tabs__nav {
						display: grid;
						grid-template-columns: repeat(
							var(--agent-sum),
							minmax(0, 1fr)
						);
						grid-auto-flow: row;
						width: 100%;
					}
				}

				// 只当选 Agent，空 pane 占高会把展开盒顶出去
				.saco-tabs__content {
					display: none;
				}

				.saco-tabs__item {
					padding: 0;
					color: var(--black-color);
					user-select: none;
					border-radius: 8px;

					// 不继承。只写在页签根上，长按名称和说明仍能选中并弹出「复制」，拖不起来
					-webkit-touch-callout: none;

					* {
						-webkit-touch-callout: none;
						user-select: none;
					}

					@include agent-tab-face;

					.agent-tab {
						height: 100%;
					}

					.agent-tab__name label,
					.agent-tab__desc {
						@include line-clamp(1);
					}

					&:hover,
					&.is-active {
						color: var(--black-color);
						background-color: var(--white-color);
					}
				}
			}

			&.is-expand {
				box-shadow: 0 $open-line 6px var(--grey-color-11);

				.agent-expand-box__list {
					max-height: $open-tabs;

					// 不要带 $reserve-gutter，会写成只有右边的 stable，左边空档没了
					@include overflow-y-hover;
				}
			}
		}
	}

	// &.is-expand {
	// 	box-shadow: 0 0 6px var(--grey-color-6);
	// }
}

// 气泡 Teleport 到 body，不能嵌进 .agent-list，否则选择器对不上
.agent-tab-tooltip {
	@include agent-tab-face;

	.agent-tab {
		// 不要 max-content：会按整句把气泡撑过卡片。上限由 popper-max-width 卡在卡片宽
		width: auto;
		max-width: 100%;

		.agent-tab__name label,
		.agent-tab__desc {
			margin-bottom: 0.3em;
			overflow: visible;
			text-overflow: unset;
			line-height: 1.5em;
			white-space: normal;
		}
	}
}
</style>
<style lang="scss">
@use './agent-tab.scss' as *;

// 幽灵挂 body，scoped 套不上；磨砂留给组件库，只补内部两行卡片
// :has(.agent-tab) 才套：顶栏页签也是这个类，写在根上会把顶栏字号打成 18px 并换行
.saco-tabs__sort-ghost:has(.agent-tab) {
	font-size: 18px;
	font-weight: 500;
	line-height: normal;
	color: var(--black-color);
	white-space: normal;
	user-select: none;
	background-color: var(--white-color);
	border-radius: 8px;

	// 克隆挂到 body 后，卡片里的禁选对不上；这个属性也不继承，名称和说明要再写一次
	-webkit-touch-callout: none;

	* {
		-webkit-touch-callout: none;
		user-select: none;
	}

	@include agent-tab-face;

	.agent-tab__name label,
	.agent-tab__desc {
		@include line-clamp(1);
	}

	.agent-tab {
		height: 100%;
	}

	.agent-tab__desc {
		margin: 0;
	}

	.saco-tooltip__trigger {
		display: flex;
		width: 100%;
		min-width: 0;
		height: 100%;
	}
}

.agent-tab-tooltip {
	$bg-color: color-mix(in srgb, var(--black-color) 50%, transparent);

	// 出现、消失只改透明度。默认弹出带位移，这里不要跟着挪
	&.agent-tab-tooltip-fade-enter-active,
	&.agent-tab-tooltip-fade-leave-active {
		transition: opacity 0.3s ease;
	}

	&.agent-tab-tooltip-fade-enter-from,
	&.agent-tab-tooltip-fade-leave-to {
		opacity: 0;
	}

	.popper-arrow {
		&::before {
			background-color: $bg-color !important;
		}
	}

	.popper-content {
		background-color: $bg-color !important;
		box-shadow: none !important;
		backdrop-filter: blur(5px);

		.agent-tab {
			.agent-tab__name label {
				color: var(--white-color) !important;
			}

			.agent-tab__desc {
				color: var(--grey-color-9) !important;
			}
		}
	}
}
</style>
