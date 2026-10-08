<template>
	<div v-show="isContext" ref="navRef" class="layout-nav">
		<div class="top-box">
			<div class="nav-teleport-top"></div>
			<div class="nav-teleport-right"></div>
		</div>
		<div class="nav-teleport-bottom"></div>
	</div>
</template>
<script lang="ts" setup name="CommonLayoutNav">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const navRef = ref<HTMLElement | null>(null)
const childCount = ref(0)
const isContext = computed(() => childCount.value > 0)

const countSlot = (selector: string) =>
	navRef.value?.querySelector(selector)?.childElementCount ?? 0

const syncContext = () => {
	const top = countSlot('.nav-teleport-top')
	const right = countSlot('.nav-teleport-right')
	const bottom = countSlot('.nav-teleport-bottom')
	childCount.value = top + right + bottom
}

let observer: MutationObserver | undefined

onMounted(() => {
	syncContext()
	const el = navRef.value
	if (!el) return
	observer = new MutationObserver(syncContext)
	observer.observe(el, { childList: true, subtree: true })
})

onBeforeUnmount(() => observer?.disconnect())
</script>
<style lang="scss">
/** 非 scoped：Dialog 内同名 .layout-nav 共用 */

/** 壳：显隐、宽高、背景；传送锚点只占 flex 位，内容样式在 teleport/nav 包裹层 */
.layout-nav {
	--layout-nav-gap: calc(var(--common-gap) * 0.9);

	display: flex;
	flex-shrink: 0;
	flex-direction: column;

	// 不能 justify-content: center：收缩时只有 top-box，会被垂直居中；
	// 展开 bottom 后整列重排，顶栏会抖一下。顶栏高度交给 .top-box 自己撑。
	justify-content: flex-start;
	min-height: var(--layout-header-height);
	// 左右原间距保留。刘海在左加 left，转到右加 right，不能写死左填充
	padding: var(--layout-nav-gap)
		calc(
			var(--common-gap) * 2.5 + var(--safe-area-right) *
				var(--safe-area-ratio)
		)
		var(--layout-nav-gap)
		calc(
			var(--common-gap) * 2.5 + var(--safe-area-left) *
				var(--safe-area-ratio)
		);
	background-color: var(--layout-nav-bg-color);
	box-shadow: 0 0 6px 0 var(--grey-color-15);

	.top-box {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		width: 100%;

		// 扣掉上下 padding，保证单行时视觉仍垂直居中在 min-height 内
		min-height: calc(var(--layout-header-height) - 13px);
	}

	.nav-teleport-top {
		flex: 1;
		min-width: 0;
	}

	.nav-teleport-right {
		flex-shrink: 0;
		margin-left: auto;
	}

	.nav-teleport-bottom {
		// 列 flex 子项默认 min-height:auto，会按表单内容撑开；
		// 不写 0 的话 0fr 折叠后这一截高度还在
		min-height: 0;
		overflow: hidden;
	}
}
</style>
