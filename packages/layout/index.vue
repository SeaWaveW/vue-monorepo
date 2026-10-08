<template>
	<div
		class="layout-container"
		:class="[route.name]"
		:style="{ '--grid-column-size': 5 }"
	>
		<LayoutHeader v-model:model-expand="isExpand" :show-tools="true" />
		<LayoutNav />
		<LayoutAside v-model="isExpand" />
		<LayoutMain />
		<LayoutFooter />
	</div>
</template>
<script lang="ts" setup name="CommonLayout">
import { provide, ref } from 'vue'
import { useRoute } from 'vue-router'
import LayoutHeader from './render/header.vue'
import LayoutNav from './render/nav.vue'
import LayoutAside from './render/aside.vue'
import LayoutMain from './render/main.vue'
import LayoutFooter from './render/footer.vue'
import { useWebFullscreen } from './utils/webFullscreen'
import { LAYOUT_MENU_KEY } from './utils/menuContext'
import type { LayoutFavoriteApi } from './types'
import logo from '../assets/img/logo.png'

const props = defineProps<{
	/** 收藏增删排序，两端接口不同 */
	favorite: LayoutFavoriteApi
}>()

const route = useRoute()
// logo 两端同一张，放公共布局里；favorite 仍由应用传入
provide(LAYOUT_MENU_KEY, {
	logo,
	favorite: props.favorite,
})

useWebFullscreen({ sync: true })

/** 是否展开 */
const isExpand = ref(false)
</script>
<style lang="scss">
/** 非 scoped：全屏 Dialog 内同名 .layout-container 壳也能吃到 */
.layout-container {
	/** 头部高度 */
	--layout-header-height: 57px;

	/** 底部高度 */
	--layout-footer-height: 57px;

	/** 展开关闭按钮大小 */
	--layout-expand-size: 35px;

	/** 侧栏菜单间距（原业务 app-layout） */
	--aside-gap: calc(var(--common-gap) * 1.5);
	--asize-y-gap: calc(var(--common-gap) * 3.3);

	/** 布局颜色 */
	--layout-header-bg-color: var(--grey-color-11);
	--layout-header-tabs-bg-color: var(--white-color-1);
	--layout-nav-bg-color: var(--white-color-1);
	--layout-main-bg-color: var(--white-color-1);

	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;

	.layout-header {
		z-index: 5;
		height: var(--layout-header-height);
		background-color: var(--layout-header-bg-color);
	}

	.layout-nav {
		z-index: 4;
	}

	.layout-main {
		z-index: 2;
		flex: 1;
		min-height: 0;
		background-color: var(--layout-main-bg-color);
	}

	.layout-footer {
		z-index: 3;
	}

	/** route.name 在容器上；工作台和首页一样要白底，:has 找不到页根上的类 */
	&:not(.Home, .AiReviewControl) {
		--layout-main-bg-color: var(--grey-color-12);
	}
}
</style>
