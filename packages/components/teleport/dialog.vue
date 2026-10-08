<template>
	<SacoDialog
		v-model="modelValue"
		fullscreen
		:append-to-body="true"
		:show-close="false"
		:close-on-click-modal="false"
		:close-on-press-escape="closeOnPressEscape"
	>
		<!-- 空 header：去掉默认 title，避免多出一条头 -->
		<template #header></template>
		<div
			class="layout-container"
			:class="[route.name]"
			:style="{ '--grid-column-size': 5 }"
		>
			<div class="layout-header">
				<div v-if="showBack" class="left-box">
					<!-- 和折叠按钮一样，padding 也要能点 -->
					<div class="expand-icon is-back" @click="closeDialog">
						<SacoSvg class="expand-icon__glyph" name="ze-arrow-down" />
					</div>
				</div>
				<div class="center-box is-single">
					{{ title }}
				</div>
			</div>
			<div v-if="hasNav" class="layout-nav">
				<div class="top-box">
					<div class="nav-teleport-top">
						<div class="teleport-top">
							<slot name="top" />
							<Search
								v-if="expand"
								v-model="showBottom"
								:twinkle="isCondition"
							/>
						</div>
					</div>
					<div class="nav-teleport-right">
						<div class="teleport-right">
							<slot name="right" />
						</div>
					</div>
				</div>
				<div v-if="$slots.bottom" class="nav-teleport-bottom">
					<!-- 和 CommonTeleportNav 同一套 wrap / inner / is-collapse，v-show 没有 0fr 过渡 -->
					<div
						class="teleport-bottom-wrap"
						:class="{ 'is-collapse': !showBottom }"
					>
						<div class="teleport-bottom">
							<div class="teleport-bottom-inner">
								<slot name="bottom" />
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="layout-main">
				<div class="router-view">
					<div class="dialog-content">
						<slot />
					</div>
				</div>
			</div>
			<div v-if="$slots.footer" class="layout-footer">
				<slot name="footer" />
			</div>
		</div>
	</SacoDialog>
</template>
<script lang="ts" setup name="CommonTeleportDialog">
import { computed, ref, useSlots, type PropType } from 'vue'
import { useRoute } from 'vue-router'
import { SacoDialog } from '@saco/ui/es/components/dialog'
import { SacoSvg } from '@saco/ui/es/components/svg'
import Search from '../../layout/components/search.vue'
import { hasConditionValue } from '../../layout/utils/hasConditionValue'
/**
 * 全屏 Dialog 套 layout 壳。须 `append-to-body=false` 挂在现有 layout 树内，
 * 同名 class 吃非 scoped 壳样式。公开出口 `CommonTeleportDialog`。
 */
const route = useRoute()
const props = defineProps({
	title: {
		type: String,
		default: '',
	},
	expand: Boolean,
	/** 查询表单对象；有有效值且收起搜索时按钮闪烁 */
	model: {
		type: Object as PropType<AnyObj>,
		default: undefined,
	},
	/** 详情全屏不要 Esc 关掉；选择弹窗默认仍能 Esc */
	closeOnPressEscape: {
		type: Boolean,
		default: true,
	},
	/** 结果详情只要完成不要返回；选择弹窗默认仍有返回 */
	showBack: {
		type: Boolean,
		default: true,
	},
	/** 返回按钮的函数 */
	backFunction: Function,
})
const modelValue = defineModel<boolean>('modelValue', {
	required: true,
})
const showBottom = ref(true)
const slots = useSlots()
/** 有 top / right / bottom / expand 才渲染 nav，与 CommonTeleportNav 显隐一致 */
const hasNav = computed(
	() => !!slots.top || !!slots.right || !!slots.bottom || !!props.expand,
)
const isCondition = computed(() => hasConditionValue(props.model))
const closeDialog = () => {
	if (props.backFunction) {
		props.backFunction()
		return
	}
	modelValue.value = false
}
</script>
<style scoped lang="scss">
/** Teleport 到 body 后吃不到 #app 直接子节点上的 overflow:hidden */
.layout-container {
	overflow: hidden;
}

/** 全屏 Dialog body 默认 overflow:auto，会把左右滚成一整页 */
:deep(.saco-dialog__body) {
	min-height: 0;
	overflow: hidden;
}

/** 仅返回箭头朝向；壳样式吃 layout 同名 class（非 scoped） */
.expand-icon.is-back {
	.expand-icon__glyph {
		transform: rotate(90deg);
	}
}

/** 默认 layout-main 是 overflow:auto，左右会跟着整页一起滚 */
.layout-main {
	overflow: hidden;
}

/** 高度链：layout-main → 内容区，左右才能各自出滚动条 */
.router-view,
.dialog-content {
	height: 100%;
	min-height: 0;
}

.dialog-content {
	display: flex;
	gap: var(--common-gap);
	overflow: hidden;
}
</style>
