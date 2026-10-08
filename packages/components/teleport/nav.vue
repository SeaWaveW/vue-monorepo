<template>
	<Teleport v-if="hasTop" to=".nav-teleport-top" defer :disabled="disabled">
		<div class="teleport-top">
			<slot name="top" />
			<!-- <Refresh v-if="refresh" /> -->
			<Search v-if="expand" v-model="modelValue" :twinkle="isCondition" />
		</div>
	</Teleport>
	<Teleport
		v-if="hasRight"
		to=".nav-teleport-right"
		defer
		:disabled="disabled"
	>
		<div class="teleport-right">
			<slot name="right" />
		</div>
	</Teleport>
	<Teleport
		v-if="hasBottom"
		to=".nav-teleport-bottom"
		defer
		:disabled="disabled"
	>
		<div
			class="teleport-bottom-wrap"
			:class="{ 'is-collapse': !modelValue }"
		>
			<!-- 内层只负责裁切；padding 再往里一层，避免 0fr 和 padding 抢高度 -->
			<div class="teleport-bottom">
				<div class="teleport-bottom-inner">
					<slot name="bottom" />
				</div>
			</div>
		</div>
	</Teleport>
</template>
<script lang="ts" setup name="CommonTeleportNav">
import { computed, onActivated, onDeactivated, ref, useSlots } from 'vue'
// import Refresh from '../../layout/components/refresh.vue'
import Search from '../../layout/components/search.vue'
import { hasConditionValue } from '../../layout/utils/hasConditionValue'

/** props 写在本文件：Volar 对跨文件 defineProps 会沿用旧缓存（仍报已删的 search） */
const props = defineProps<{
	refresh?: boolean
	expand?: boolean
	model?: AnyObj
}>()
// 展开搜索
const modelValue = defineModel<boolean>('modelValue', {
	default: true,
})
// 插槽
const slots = useSlots()
// 是否禁用
const disabled = ref(false)

const hasTop = computed(() => !!props.refresh || !!props.expand || !!slots.top)
const hasRight = computed(() => !!slots.right)
const hasBottom = computed(() => !!slots.bottom)

onActivated(() => {
	disabled.value = false
})
onDeactivated(() => {
	disabled.value = true
})

const isCondition = computed(() => hasConditionValue(props.model))
</script>
<style lang="scss">
/** 非 scoped：Dialog 内同名 teleport-* 共用 */
.teleport-top {
	display: flex;
	gap: calc(var(--common-gap) * 1.6);
	align-items: center;
	width: 100%;

	.saco-button {
		margin-left: 0 !important;
	}
}

.teleport-right {
	display: flex;
	align-items: center;
}

/** 折叠层：只过渡 0fr/1fr；padding 放 inner，和高度抢的话顶栏会抖 */
.teleport-bottom-wrap {
	display: grid;
	grid-template-rows: 1fr;
	overflow: hidden;
	opacity: 1;
	transition:
		grid-template-rows 0.3s ease-in-out,
		opacity 0.3s ease-in-out;

	&.is-collapse {
		grid-template-rows: 0fr;

		// 收起过程中表单项仍在 DOM，避免点到看不见的控件
		pointer-events: none;
		opacity: 0;
	}

	> .teleport-bottom {
		// 0fr 裁切靠这一层；内容高度交给 inner，这里不能再写 padding
		min-height: 0;
		overflow: hidden;
	}
}

.teleport-bottom-inner {
	// 钉在裁切盒顶部，center 会在收起时把表单往上挪一截
	display: flex;
	align-items: flex-start;
	padding: var(--layout-nav-gap) 0;

	.saco-form {
		// flex 子项默认按内容定宽，5 列 1fr 会挤成一坨
		flex: 1;

		// 列距走 reset 的 23px；行距跟 nav 顶底间距一致
		row-gap: var(--layout-nav-gap);
		min-width: 0;

		.saco-form-item {
			margin-bottom: 0;
		}
	}
}
</style>
