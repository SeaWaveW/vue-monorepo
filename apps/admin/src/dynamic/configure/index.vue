<template>
	<div class="configure-component">
		<div class="header-title">
			<p class="title">{{ t('dynamic_form_config_title') }}</p>
			<p class="tips">{{ t('dynamic_form_config_title_tips') }}</p>
		</div>
		<SacoForm
			v-show="component?.name"
			:key="component?.uniqueId"
			ref="formRef"
			label-position="top"
			:model="(component as any)"
		>
			<SacoFormItem
				:label="`${t('element_type')}:`"
				class="horizontal-item"
			>
				{{ component?.name ? t(component.name) : '' }}
			</SacoFormItem>
			<ComTitle
				v-model:title="outerModel.title"
				:component="component"
				:components="components"
				:component-index="componentIndex"
			/>
			<Description v-model:description="outerModel.description" />
			<Required v-model:required="outerModel.required" />
			<Placeholder
				v-if="placeholderBindList.includes(component?.name)"
				v-model:placeholder="propsModel.placeholder"
			/>
			<LimitLength
				v-if="lengthBindList.includes(component?.name)"
				v-model:limit-length="propsModel.limitLength"
				v-model:minlength="propsModel.minlength"
				v-model:maxlength="propsModel.maxlength"
			/>
			<Proportion
				v-model:proportion="outerModel.proportion"
				:proportion-list="proportionList"
			/>
			<!-- <ModelDefault
				v-if="!notModelBindList.includes(component?.name)"
				v-model:id="outerModel.id"
				v-model:model-bind="modelBind"
				:name="component?.name"
			/> -->
			<DataList
				v-if="dataListBindList.includes(component?.name)"
				v-model:data="propsData"
				v-model:default-model="defaultModel"
				:model-key="component?.modelKey || ''"
				:model-bind="component?.modelBind || {}"
			/>
			<component
				:is="isActiveComponent"
				v-if="isActiveComponent"
				:key="component?.uniqueId"
				v-model:component="component"
				v-on="componentOn"
			/>
		</SacoForm>
	</div>
</template>
<script lang="ts" setup name="Configure">
import type { ComponentItem, ComponentName } from '#/dynamic'
import Proportion from './common/proportion.vue'
import ComTitle from './common/com-title.vue'
import Description from './common/description.vue'
import Required from './common/required.vue'
import LimitLength from './common/limit-length.vue'
// import ModelDefault from './common/model-default.vue'
import Placeholder from './common/placeholder.vue'
import DataList from './common/data-list.vue'
import {
	configureComponents,
	placeholderBindList,
	// notModelBindList,
	dataListBindList,
	lengthBindList,
	useOuterModel,
	usePropsModel,
} from './config'
import { useTitleId, configureFormRefKey } from './utils'
import type { ProportionItem } from '#/utils/proportion'

const { t } = useI18n()
/** 双向绑定选中组件 */
const component = defineModel<ComponentItem | null>('component', {
	default: null,
})
/** 组件属性接收 */
const props = defineProps({
	components: {
		type: Array as PropType<ComponentItem[] | null>,
		default: () => [],
	},
	componentIndex: {
		type: Number,
		default: -1,
	},
	proportionList: {
		type: Array as PropType<ProportionItem[]>,
		default: () => [],
	},
})
const outerModel = useOuterModel(component)
const propsModel = usePropsModel(component)
useTitleId(component)
/** 配置区 SacoForm，类型跟登录页同一份 FormExpose */
const formRef = ref<FormExpose | null>(null)
defineExpose({
	validate: () => formRef.value?.validate(),
})
provide(configureFormRefKey, {
	validateField: (...args) =>
		formRef.value?.validateField(...args) ?? Promise.resolve(true),
})

/** 配置面板异步组件缓存（按 name 复用，避免 :is 引用变化导致重挂） */
const configureAsyncCache = new Map<
	string,
	ReturnType<typeof defineAsyncComponent>
>()

/**
 * 按组件名解析个性化配置面板
 * @param name 业务组件名，如 SacoSelect；空则无面板
 */
const resolveConfigureComponent = (name?: ComponentName) => {
	// 未选中组件时不渲染配置面板
	if (!name) return null
	// 取该组件对应的懒加载函数
	const loader = configureComponents[name]
	// 未注册配置面板
	if (!loader) return null
	// 优先走缓存，保证同名组件 :is 引用稳定
	let asyncComp = configureAsyncCache.get(name)
	// 首次使用时再创建 AsyncComponent 并写入缓存
	if (!asyncComp) {
		asyncComp = defineAsyncComponent(loader)
		configureAsyncCache.set(name, asyncComp)
	}
	return asyncComp
}

/** 当前选中组件的个性化配置面板 */
const isActiveComponent = computed(() =>
	resolveConfigureComponent(component.value?.name),
)

/**
 * 动态模型绑定（配置区编辑 modelBind 时同步重整 defaultModel）
 */
const modelBind = computed({
	get: () => component.value?.modelBind,
	set: (value) => {
		if (!component.value) return
		// 改前的绑定与默认值，用于对比「哪个字段被改名了」以及取值迁移
		const prevBind = component.value.modelBind || {}
		const nextBind = (value || {}) as NonNullable<
			ComponentItem['modelBind']
		>
		const prevDefault = component.value.defaultModel || {}
		// 只保留 nextBind 里仍引用到的字段，旧字段名不会残留
		const defaultModel: Record<string, unknown> = {}

		Object.keys(nextBind).forEach((propKey) => {
			// nextField / prevField：该 prop 对应的 defaultModel 字段名（不是 prop 名本身）
			const nextField = nextBind[propKey]
			// 空字符串视为未绑定，不占 defaultModel 坑位
			if (!nextField) return
			const prevField = prevBind[propKey]

			if (
				prevField &&
				prevField !== nextField &&
				prevField in prevDefault
			) {
				// 情况1：字段改名（如 label → lab）——把旧字段上的值挪到新字段
				defaultModel[nextField] = prevDefault[prevField]
			} else if (nextField in prevDefault) {
				// 情况2：字段名没变——沿用原值（如 value 仍为 'one'）
				defaultModel[nextField] = prevDefault[nextField]
			} else {
				// 情况3：全新字段名，且没有可迁移的旧值——给空串占位
				defaultModel[nextField] = ''
			}
		})

		component.value = {
			...component.value,
			modelBind: nextBind,
			defaultModel,
		}
	},
})

/** 个性化组件事件绑定 */
const componentOn = computed(() => {
	return Object.keys(component.value?.modelBind || {}).reduce(
		(onMap, key) => {
			onMap[`update:${key}`] = (value: unknown) => {
				if (!component.value) return
				component.value = {
					...component.value,
					[key]: value,
				}
			}
			return onMap
		},
		{} as Record<string, (value: unknown) => void>,
	)
})

/** 数据列表绑定 */
const propsData = computed({
	get: () => component.value?.props?.data ?? [],
	set: (value) => {
		if (!component.value) return
		component.value = {
			...component.value,
			props: { ...component.value.props, data: value },
		}
	},
})
/** 默认选中值（选项列表变更后可能被清空） */
const defaultModel = computed({
	get: () => component.value?.defaultModel ?? {},
	set: (value) => {
		if (!component.value) return
		component.value = { ...component.value, defaultModel: value }
	},
})
</script>
<style scoped lang="scss">
@use 'sass:math';

.configure-component {
	height: 100%;
	min-height: 0;

	@include overflow-y-hover($reserve-gutter: true);

	$left-padding: calc(var(--common-gap) * 2.4);
	$right-padding: calc(var(--common-gap) * 1.4);
	$item-gap: calc(var(--common-gap) * 2.5);

	.header-title {
		padding: 0 $right-padding 0 $left-padding;
		margin-bottom: calc(var(--common-gap) * 3.5);
	}

	:deep(.sqt-form) {
		display: flex;
		flex-direction: column;
		padding: 0 $right-padding 0 calc(var(--common-gap) * 1.6);
	}

	:deep(.sqt-form-item) {
		width: 100%;
		margin-bottom: $item-gap;

		.sqt-form-item__label,
		.sqt-form-item__content {
			font-size: var(--font-size);

			.sqt-input,
			.sqt-select,
			.sqt-textarea,
			.sqt-number {
				border-radius: 4px;
			}
		}

		&.horizontal-item {
			flex-direction: row;
			align-items: center;

			.sqt-form-item__label {
				padding-bottom: 0;
			}

			.sqt-form-item__content {
				flex: 1;
				line-height: 1.5;
				text-indent: 0.3em;
			}
		}
	}
}
</style>
