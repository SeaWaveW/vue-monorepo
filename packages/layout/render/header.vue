<template>
	<div class="layout-header">
		<div class="left-box">
			<Expand v-model="modelExpand" />
		</div>
		<div class="center-box" :class="{ 'is-single': isSingle }">
			<template v-if="isSingle">{{ pageTitle }}</template>
			<Tabs v-else />
		</div>
		<div v-show="showTools" class="right-box">
			<Avatar />
			<Setting />
			<Fullscreen />
		</div>
	</div>
</template>
<script lang="ts" setup name="CommonLayoutHeader">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import Expand from '../components/expand.vue'
import Tabs from '../components/tabs.vue'
import Fullscreen from '../components/fullscreen.vue'
import Avatar from '../components/avatar.vue'
import Setting from '../components/setting.vue'

const { t } = useI18n()

const props = defineProps({
	modelExpand: {
		type: Boolean,
		default: false,
	},
	showTools: {
		type: Boolean,
		default: false,
	},
})
const emits = defineEmits(['update:modelExpand'])
const route = useRoute()

/** 是否为后台单页面 */
const isSingle = computed(() => route.meta?.single)
const modelExpand = computed({
	get: () => props.modelExpand,
	set: (value) => emits('update:modelExpand', value),
})
/** 页面标题 */
const pageTitle = computed(() => {
	const { defCode } = route.meta ?? {}
	return t(defCode as string)
})
</script>
<style lang="scss">
/** 非 scoped：Dialog 内同名 .layout-header 共用 */
.layout-header {
	position: relative;
	display: flex;

	.left-box,
	.right-box {
		position: relative;
		z-index: 1;
	}

	.left-box {
		padding-left: calc(var(--common-gap) * 0.8);
	}

	.center-box {
		display: flex;
		flex: 1;
		align-items: flex-end;

		// 默认 min-width:auto，页签会把中间栏撑开，裁切和左右钮都出不来
		min-width: 0;
		padding: 0 calc(var(--common-gap) * 1.5);

		/** 单页 / Dialog 居中标题 */
		&.is-single {
			position: absolute;
			inset: 0;
			z-index: 0;
			align-items: center;
			justify-content: center;
			padding: 0;
			font-size: var(--font-size);
			color: var(--black-color);
			pointer-events: none;
		}
	}

	.right-box {
		display: flex;
		gap: calc(var(--common-gap) * 3);
		align-items: center;
		padding: 0 calc(var(--common-gap) * 2.2);
		/** 单页标题绝对定位后中间栏脱离文档流，没有这行会贴到左侧；Dialog 没有右侧不受影响 */
		margin-left: auto;

		.layout-header__tool {
			font-size: 25px;
			cursor: pointer;
		}
	}
}
</style>
