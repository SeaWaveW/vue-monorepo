<template>
	<div v-show="isContext" ref="footerRef" class="layout-footer"></div>
</template>
<script lang="ts" setup name="CommonLayoutFooter">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const footerRef = ref<HTMLElement | null>(null)
const childCount = ref(0)
const isContext = computed(() => childCount.value > 0)

const syncContext = () => {
	childCount.value = footerRef.value?.childElementCount ?? 0
}

let observer: MutationObserver | undefined

onMounted(() => {
	syncContext()
	const el = footerRef.value
	if (!el) return
	observer = new MutationObserver(syncContext)
	observer.observe(el, { childList: true })
})

onBeforeUnmount(() => observer?.disconnect())
</script>
<style lang="scss">
/** 非 scoped：Dialog 内同名 .layout-footer 共用 */
.layout-footer {
	display: flex;
	place-content: center end;
	min-height: var(--layout-footer-height);
	padding: 0
		calc(
			var(--common-gap) * 2 + var(--safe-area-right) * var(--safe-area-ratio)
		)
		0
		calc(
			var(--common-gap) * 2 + var(--safe-area-left) * var(--safe-area-ratio)
		);
	background-color: var(--white-color-1);
	box-shadow: 0 0 6px 0 var(--grey-color-5);
}
</style>
