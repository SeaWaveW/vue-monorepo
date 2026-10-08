<template>
	<!-- 点在 padding 上也要折叠，不能只绑图标 -->
	<div class="expand-icon" @click="updateExpand">
		<SacoSvg class="expand-icon__glyph" :name="expandName" />
	</div>
</template>
<script lang="ts" setup name="CommonLayoutExpand">
import { computed } from 'vue'
import { SacoSvg, type SvgName } from '@saco/ui/es/components/svg'

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false,
	},
})
const emits = defineEmits(['update:modelValue'])
/** 折叠图标 */
const expandName = computed<SvgName>(() => {
	return props.modelValue ? 'menu-fold' : 'menu-unfold'
})
const updateExpand = () => {
	emits('update:modelValue', !props.modelValue)
}
</script>
<style lang="scss">
/** 非 scoped：Dialog 返回按钮也可复用 .expand-icon */
.expand-icon {
	padding: calc(
		(var(--layout-header-height) - var(--layout-expand-size)) / 2
	);
	cursor: pointer;

	.expand-icon__glyph {
		font-size: var(--layout-expand-size);
		color: var(--black-color);
		/** 点事件交给外层，避免只点到 glyph 才响应 */
		pointer-events: none;
	}
}
</style>
