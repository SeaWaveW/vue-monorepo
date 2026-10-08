<template>
	<p class="dynamic-p">
		<slot />
	</p>
</template>
<script lang="ts" setup name="DynamicP">
import { pProps } from './props'
import { pEmits } from './emits'

defineProps(pProps)
defineEmits(pEmits)
</script>
<style lang="scss" src="./style.scss" />
