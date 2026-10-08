<template>
	<span v-if="name" ref="rootRef" class="phone-input__flag">
		<SacoSvg v-if="ready" class="phone-input__glyph" :name="name" />
	</span>
</template>
<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { SacoSvg } from '@saco/ui/es/components/svg'
import type { SvgName } from '@saco/ui'

/** 下拉滚动根。用视口当 root 时，overflow 裁掉但仍在视口里的项也会被当成可见 */
const DROPDOWN_SCROLL_ROOT = '.select-dropdown'

const props = defineProps<{
	/** 对应 `country/{iso}.svg`；空则不占位、不观察 */
	name: SvgName | ''
}>()

const rootRef = ref<HTMLElement>()
/** 进过视口就一直挂着，滚走不再拆，避免来回闪 */
const ready = ref(false)

let observer: IntersectionObserver | undefined
/** 卸掉后 nextTick / IO 回调还可能进队，为 false 就不再建观察器、不写 ready */
let alive = true

const stopObserver = () => {
	observer?.disconnect()
	observer = undefined
}

const observe = () => {
	stopObserver()
	// 打开立刻关掉：onMounted 的 nextTick 会晚于卸载
	if (!alive) {
		return
	}
	const el = rootRef.value
	if (!el || !props.name) {
		return
	}
	const scrollRoot = el.closest(DROPDOWN_SCROLL_ROOT)
	if (
		!(scrollRoot instanceof Element) ||
		typeof IntersectionObserver === 'undefined'
	) {
		ready.value = true
		return
	}
	observer = new IntersectionObserver(
		(entries) => {
			if (!alive) {
				stopObserver()
				return
			}
			if (!entries.some((entry) => entry.isIntersecting)) {
				return
			}
			ready.value = true
			stopObserver()
		},
		{
			root: scrollRoot,
			// 提前半截，滚到再挂会闪空白
			rootMargin: '80px 0px',
		},
	)
	observer.observe(el)
}

watch(
	() => props.name,
	() => {
		ready.value = false
		nextTick(observe)
	},
)

onMounted(() => {
	// Popper 定位完再量，否则初次全是 0 相交
	nextTick(observe)
})

onBeforeUnmount(() => {
	alive = false
	stopObserver()
})
</script>
