<template>
	<div
		class="layout-menu-list"
		:class="{ 'is-collapsed': settingStore.isMenuCollapsed }"
	>
		<div
			v-for="item in accessibleMenu"
			:key="item.id"
			class="layout-menu-list-item"
		>
			<MenuItem
				:data="item"
				:level="0"
				:collect-ids="collectIds"
				:open-tab="props.openTab"
			/>
		</div>
	</div>
</template>
<script lang="ts" setup name="LayoutMenuList">
import { computed, type PropType } from 'vue'
import { useUserStore, useSettingStore } from '../../store'
import MenuItem from './menu-item.vue'
import type { LayoutMenuRecord, OpenTab } from '../types'

const props = defineProps({
	openTab: {
		type: Function as PropType<OpenTab>,
		required: true,
	},
})
const userStore = useUserStore()
const settingStore = useSettingStore()
const collectIds = computed(() => {
	return userStore.collectMenu.map((item) => item.id)
})
const accessibleMenu = computed(() => {
	return userStore.accessibleMenu as LayoutMenuRecord[]
})
</script>
<style scoped lang="scss">
.layout-menu-list {
	$inset-size: 7px;
	$list-min-width: calc(
		var(--menu-item-width) + var(--aside-gap) * 2 + $inset-size
	);

	// 1fr → 0fr 才能过渡内容宽；width:auto 到 0 插值不了
	display: grid;
	grid-template-columns: 1fr;
	grid-auto-rows: max-content;
	gap: calc(var(--common-gap) * 3);
	align-content: start;
	align-self: stretch;

	// 不要写死 max-width：四列 240 + 间距 29 已经超过 1086，会裁掉最后一列星星
	min-width: $list-min-width;
	height: 100%;
	min-height: 0;
	padding: var(--asize-y-gap) calc(var(--aside-gap) + $inset-size);
	overflow-x: hidden;

	// stable 预留滚动槽，出现纵向滚动时不要再挤窄最后一列
	@include overflow-y-hover(true);

	border-left: 1px solid var(--grey-color-11);
	transition:
		grid-template-columns 0.3s ease-in-out,
		min-width 0.3s ease-in-out,
		padding 0.3s ease-in-out,
		border-width 0.3s ease-in-out;

	--menu-item-width: 240px;

	.layout-menu-list-item {
		display: flex;

		// 0fr 要求 grid 子项 min-width:0，否则内容最小宽会卡住轨道
		min-width: 0;

		// overflow:hidden 会把自动 min-height 算成 0，行被压扁
		min-height: min-content;
		overflow: hidden;

		// 子树保持展开时的固有宽，收起时被裁而不是挤窄换行
		:deep(.layout-menu-item) {
			min-width: max-content;
		}
	}

	&.is-collapsed {
		grid-template-columns: 0fr;
		min-width: 0;
		padding-right: 0;
		padding-left: 0;
		overflow: hidden;

		// 收起后不要再占滚动槽，否则收藏栏右边会多出一条缝
		scrollbar-gutter: auto;
		pointer-events: none;
		border-left-width: 0;
	}
}
</style>
