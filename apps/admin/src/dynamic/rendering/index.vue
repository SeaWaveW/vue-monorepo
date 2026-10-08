<template>
	<div class="rendering-component">
		<div class="canvas-header header-title">
			<div class="left-box">
				<p class="title">{{ t('dynamic_form_draw_title') }}</p>
				<p class="tips">
					<label>{{ t('dynamic_form_draw_count') }}:</label>
					<span
						:class="{
							'is-max':
								props.components.length >= maxComponentsCount,
							'is-half':
								props.components.length >=
								maxComponentsCount / 2,
						}"
					>
						{{ props.components.length }}/{{ maxComponentsCount }}
					</span>
				</p>
			</div>
		</div>
		<div class="canvas-area">
			<div
				class="component-container"
				:style="{ '--proportion-columns': Number(proportion) }"
			>
				<div
					v-for="(item, index) in props.components"
					:key="item.uniqueId"
					class="component-item"
					:draggable="true"
					:data-index="index"
					:class="{
						'is-not-title':
							!!item.name &&
							componentStore.notTitles.includes(item.name),
						'is-active': item.uniqueId === props.uniqueId,
						'is-enter': index === props.enterIndex,
						[`enter-${props.enterSide}`]:
							index === props.enterIndex,
					}"
					:style="{
						'--proportion-span':
							Number(item.proportion) || Number(proportion),
					}"
				>
					<div class="operation-tools">
						<SacoSvg
							class="tool-item"
							name="delete"
							:title="t('delete')"
							data-action="delete"
						/>
					</div>
					<SacoFormItem
						:label="
							item.name &&
							componentStore.notTitles.includes(item.name)
								? ''
								: item.title
						"
						:required="
							item.name &&
							componentStore.notTitles.includes(item.name)
								? false
								: item.required
						"
					>
						<SacoRender
							:name="item.name!"
							v-bind="vBind(item, index)"
							v-on="vOn(item, index)"
						/>
					</SacoFormItem>
				</div>
			</div>
		</div>
	</div>
</template>
<script lang="ts" setup name="Rendering">
import { useComponentStore } from '#/store'

import type { ComponentItem } from '#/dynamic'
import { PROPORTION_DEFAULT_SIZE } from '#/utils/proportion'
const { t } = useI18n()
const props = defineProps({
	components: {
		type: Array as PropType<ComponentItem[]>,
		default: () => [],
	},
	uniqueId: {
		type: Number,
		default: -1,
	},
	enterIndex: {
		type: Number,
		default: -1,
	},
	enterSide: {
		type: String as PropType<'left' | 'right' | null>,
		default: '',
	},
	maxComponentsCount: {
		type: Number,
		default: Number.MAX_SAFE_INTEGER,
	},
})
const proportion = defineModel<TabPaneName>('proportion', {
	default: PROPORTION_DEFAULT_SIZE,
})
const emits = defineEmits(['update:components', 'update:uniqueId'])
const componentStore = useComponentStore()
const vBind = computed(() => {
	return (item: ComponentItem, index: number) => {
		const { defaultModel = {}, modelBind = {} } = item
		// 根据modelBind取default的值
		const modelProps = Object.keys(modelBind).reduce(
			(prop, key) => {
				const dKey = modelBind[key]
				prop[key] = defaultModel?.[dKey]
				return prop
			},
			{} as ComponentItem['props'],
		)
		return {
			// 统一透传
			...item.props,
			...modelProps,
			// 上传组件特例
			title: item.title,
			required: item.required,
		}
	}
})
const vOn = computed(() => {
	return (_item: ComponentItem, index: number) => {
		const modelBind = props.components[index]?.modelBind || {}
		// 同 tick 双发时合并进 defaultModel，避免后一次盖掉前一次
		return Object.keys(modelBind).reduce(
			(update, key) => {
				const fieldKey = modelBind[key]
				if (!fieldKey) return update
				update[`update:${key}`] = (value: any) => {
					const current = props.components[index]
					if (!current) return
					current.defaultModel = {
						...current.defaultModel,
						[fieldKey]: value,
					}
					const components = [...props.components]
					components[index] = {
						...current,
						defaultModel: { ...current.defaultModel },
					}
					emits('update:components', components)
				}
				return update
			},
			{} as Record<string, (value: any) => void>,
		)
	}
})
</script>
<style scoped lang="scss">
@use 'sass:math';
@use '#/style/dynamic-form.scss' as *;

.rendering-component {
	display: flex;
	flex-direction: column;
	height: 100%;
	min-height: 0;

	@include overflow-y-hover;

	border-radius: 20px;
	box-shadow: 0 0 7px 1px var(--grey-color-16);

	.canvas-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: calc(var(--common-gap) * 3 - var(--header-top))
			calc(var(--common-gap) * 4.6) calc(var(--common-gap) * 0.8)
			calc(var(--common-gap) * 3.4) !important;
		margin-bottom: 0 !important;

		.left-box {
			.tips {
				span {
					margin-left: 0.5em;
					color: var(--success-color);

					&.is-half {
						color: var(--warning-color);
					}

					&.is-max {
						color: var(--danger-color);
					}
				}
			}
		}
	}

	.canvas-area {
		z-index: 1;
		flex: 1;
		min-height: 0;
		padding: calc(var(--common-gap) * 1.6) calc(var(--common-gap) * 1.4);

		.component-container {
			@include dynamic-form-grid;

			padding: calc(var(--common-gap) * 0.1);

			.component-item {
				$tran-duration: 0.25s;

				@include dynamic-form-item-box;

				position: relative;

				// 勿用 transform：会新建层叠上下文，导致下拉被后续格子挡住
				overflow: visible;
				cursor: grab;
				list-style: none;
				border-radius: $dynamic-form-item-radius;
				transition: box-shadow $tran-duration ease-in-out;

				&.is-not-title {
					:deep(.sqt-form-item__label) {
						display: none;
					}
				}

				&:hover {
					z-index: 5;
					box-shadow: 0 0 0 1px var(--primary-color);

					.operation-tools {
						pointer-events: auto;
						opacity: 1;
					}
				}

				&.is-active {
					z-index: 6;
					box-shadow: 0 0 0 1px var(--primary-color);
				}

				&.is-enter {
					$line-width: 4px;

					&::after {
						position: absolute;
						top: 0;
						width: $line-width;
						height: 100%;
						content: '';
						background-color: var(--primary-color);
					}

					&.enter-left {
						&::after {
							left: #{-$line-width};
						}
					}

					&.enter-right {
						&::after {
							right: #{-$line-width};
						}
					}
				}

				&::before {
					position: absolute;
					inset: 0;
					z-index: 5;
					content: '';
				}

				// 操作栏
				.operation-tools {
					position: absolute;
					top: 0;
					right: 0;
					z-index: 15;
					padding: calc(var(--common-gap) * 0.4)
						calc(var(--common-gap) * 0.8);
					pointer-events: none;
					user-select: none;
					opacity: 0;
					transition: opacity $tran-duration ease-in-out;

					.tool-item {
						padding: calc(var(--common-gap) * 0.4);
						font-size: calc(var(--font-size) + 4px);
						cursor: pointer;
						background-color: var(--white-color);
						border-radius: 50%;
						box-shadow: 0 0 0 1px
							#{alpha-color(var(--black-color), 15%)};

						&:hover {
							color: var(--danger-color);
						}
					}
				}
			}
		}
	}
}
</style>
