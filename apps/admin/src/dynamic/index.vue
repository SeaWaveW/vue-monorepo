<template>
	<SacoForm
		label-position="top"
		class="dynamic-component"
		:style="{
			'--proportion-max': PROPORTION_MAX_SIZE,
			'--proportion-sum': proportion,
		}"
	>
		<!-- 材料区 -->
		<Material
			ref="materialAreaRef"
			v-model:proportion="proportion"
			class="material-area"
		/>
		<!-- 渲染区 -->
		<Rendering
			ref="renderAreaRef"
			v-model:components="components"
			v-model:proportion="proportion"
			class="rendering-area"
			:unique-id="activeComponent?.uniqueId"
			:enter-index="renderEnterIndex"
			:enter-side="renderEnterSide"
			:max-components-count="MAX_COMPONENTS_COUNT"
		/>
		<!-- 配置区 -->
		<Configure
			ref="configureRef"
			class="configuration-area"
			:components="components"
			:component="components[componentIndex]"
			:component-index="componentIndex"
			:proportion-list="proportionList"
			@update:component="onUpdateComponent"
		/>
	</SacoForm>
</template>
<script lang="ts" setup name="Dinamic">
import type { ComponentItem } from '#/dynamic'
import type { DynamicExpose } from './utils/types'
import { useDynamicPropsData } from './utils/props'
import { useComponentDrag, useRenderingComponentClick } from './utils/events'
import Material from './material/index.vue'
import Rendering from './rendering/index.vue'
import Configure from './configure/index.vue'
import { useValidate } from './utils/validate'
import {
	PROPORTION_MAX_SIZE,
	PROPORTION_DEFAULT_SIZE,
	useProportion,
} from '#/utils/proportion'
const MAX_COMPONENTS_COUNT = 100
const components = defineModel<ComponentItem[]>('components', {
	default: () => [],
})
const proportion = defineModel<TabPaneName>('proportion', {
	default: PROPORTION_DEFAULT_SIZE,
})
const { proportionList } = useProportion(proportion, components)

const materialAreaRef = ref<ComponentPublicInstance | null>(null)
const renderAreaRef = ref<ComponentPublicInstance | null>(null)
const configureRef = ref<InstanceType<typeof Configure> | null>(null)

const propsModel = useDynamicPropsData(components)
const { activeComponent, componentIndex, updateComponent } = propsModel

const onUpdateComponent = (value: ComponentItem | null) => {
	if (!value) return
	updateComponent(componentIndex.value, value)
}

const { renderEnterIndex, renderEnterSide } = useComponentDrag(
	materialAreaRef,
	renderAreaRef,
	propsModel,
	proportion,
)
useRenderingComponentClick(renderAreaRef, propsModel)

const validateComponents = useValidate(
	propsModel.components,
	propsModel.activeComponent,
	propsModel.componentIndex,
	configureRef,
)

defineExpose<DynamicExpose>({
	validateComponents,
})
</script>
<style scoped lang="scss">
.dynamic-component.sqt-form {
	$off-size: 9px;

	box-sizing: border-box;
	display: flex;
	gap: var(--common-gap);
	align-items: stretch;
	width: 100%;
	height: 100%;
	min-height: 0;
	padding: calc(var(--common-gap) * 2) 0;

	--header-top: 7px;

	:deep(.header-title) {
		position: sticky;
		top: 0;
		z-index: 10;
		width: 100%;
		padding-top: var(--header-top);
		margin-bottom: calc(var(--common-gap) * 3.2);

		// background-color: var(--white-color-1);
		// 取主背景色
		background-color: var(--layout-main-bg-color);
		backdrop-filter: blur(2px);

		.title {
			font-size: 18px;
			font-weight: var(--font-bold);
			color: var(--black-color);
		}

		.tips {
			font-size: 14px;
			color: var(--info-color);
		}
	}

	.material-area,
	.configuration-area,
	.rendering-area {
		min-height: 0;
	}

	.material-area,
	.configuration-area {
		width: #{389px - $off-size};

		:deep(.sqt-form-item__label) {
			text-indent: 0.2em;
		}
	}

	.rendering-area {
		flex: 1;
	}
}
</style>
