<template>
	<div class="layout-main">
		<RouterView v-slot="{ Component }">
			<KeepAlive ref="keepAliveRef" :include="routerStore.cacheList">
				<component :is="Component" :key="componentKey" />
			</KeepAlive>
		</RouterView>
	</div>
</template>
<script lang="ts" setup name="CommonLayoutMain">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
/** layout/render 相对 `src/store` 是两级；写成 `../` 会落到 layout 下 */
import { useRouterStore } from '../../store'

const routerStore = useRouterStore()
const route = useRoute()
/** 拼当前页 cacheKey；只有同 path 刷新才会变，切页签不能改，否则 KeepAlive 丢实例 */
const componentKey = computed(() => {
	return route.path + routerStore.cacheKey
})
</script>
<style lang="scss">
/** 非 scoped：Dialog 内同名 .layout-main 共用 */
.layout-main {
	$pad-size: var(--common-gap);
	$safe-end: calc(var(--safe-area-right) * var(--safe-area-ratio));
	$safe-start: calc(var(--safe-area-left) * var(--safe-area-ratio));

	// 默认 content-box 时 padding 加在 flex 高度外面，主区域比视口高，审核页整页就能滚
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	padding: $pad-size calc(#{$safe-end} + #{$pad-size}) $pad-size
		calc(#{$safe-start} + #{$pad-size});
	overflow: auto;
}
</style>
