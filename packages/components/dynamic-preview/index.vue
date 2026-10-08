<template>
	<SacoForm
		class="preview-component"
		label-position="top"
		:style="{ '--proportion-columns': Number(proportion) }"
	>
		<div v-if="!components.length" class="preview-component__empty">
			{{ t('no_data') }}
		</div>
		<div
			v-for="(item, index) in components"
			:key="item.uniqueId ?? index"
			class="preview-component__item"
			:style="{
				'--proportion-span':
					Number(item.proportion) || Number(proportion),
			}"
		>
			<div class="preview-component__mask" />
			<SacoFormItem
				:label="
					item.name && componentStore.notTitles.includes(item.name)
						? ''
						: item.title
				"
				:required="
					item.name && componentStore.notTitles.includes(item.name)
						? false
						: item.required
				"
			>
				<SacoRender :name="item.name!" v-bind="vBind(item)" />
			</SacoFormItem>
		</div>
	</SacoForm>
</template>
<script lang="ts" setup name="CommonDynamicPreview">
import { computed, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ComponentItem } from '../../dynamic'
import { useComponentStore } from '../../store'
import { PROPORTION_DEFAULT_SIZE } from '../../utils/proportion'
import { SacoForm } from '@saco/ui/es/components/form'
import { SacoFormItem } from '@saco/ui/es/components/form-item'
import { SacoRender } from '@saco/ui/es/components/render'
import type { TabPaneName } from '@saco/ui'

const props = defineProps({
	components: {
		type: Array as PropType<ComponentItem[]>,
		default: () => [],
	},
	proportion: {
		type: [Number, String] as PropType<TabPaneName>,
		default: PROPORTION_DEFAULT_SIZE,
	},
	/** 审核填写数据，按组件 id 盖过 defaultModel（提交 inputDataJson 的 key 是 id） */
	data: {
		type: Object as PropType<Record<string, any>>,
		default: () => ({}),
	},
})
const { t } = useI18n()
const componentStore = useComponentStore()
/** 详情回填优先 id，没有再 uniqueId，都没有才用 defaultModel */
const readFilled = (item: ComponentItem) => {
	const data = props.data
	if (item.id != null && data[item.id] != null) {
		return data[item.id]
	}
	if (item.uniqueId != null && data[item.uniqueId] != null) {
		return data[item.uniqueId]
	}
	return undefined
}
const vBind = computed(() => {
	return (item: ComponentItem) => {
		const { defaultModel = {}, modelBind = {} } = item
		const source = readFilled(item) ?? defaultModel
		const modelProps = Object.keys(modelBind).reduce(
			(prop, key) => {
				const dKey = modelBind[key]
				prop[key] = source?.[dKey]
				return prop
			},
			{} as ComponentItem['props'],
		)
		return {
			...item.props,
			...modelProps,
			title: item.title,
			required: item.required,
			// 详情只读：上传不要删除；点文件名仍下载
			...(item.type === 'upload' ? { preview: true } : {}),
		}
	}
})
</script>
<style scoped lang="scss">
@use '../../style/dynamic-form.scss' as *;

.preview-component.saco-form {
	@include dynamic-form-grid;

	.preview-component__empty {
		grid-column: 1 / -1;
		margin-bottom: calc(var(--common-gap) * 1.5);
		font-size: var(--font-size);
		color: var(--black-color);
		text-align: center;
	}

	.preview-component__item {
		@include dynamic-form-item-box;

		position: relative;
		pointer-events: none; // 挡改值；文件名要能点穿去下载

		.preview-component__mask {
			position: absolute;
			inset: 0;
			z-index: 5;
			pointer-events: none;
		}

		:deep(.name-tips) {
			pointer-events: auto;
			cursor: pointer;
		}
	}
}
</style>
