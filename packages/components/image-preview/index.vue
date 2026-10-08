<template>
	<img
		v-if="props.src"
		class="saco-image-preview"
		:src="props.src"
		:alt="props.alt"
		:style="{ '--image-preview-radius': radiusCss }"
	/>
	<template v-else>
		{{ leachFormatter(props.src) }}
	</template>
</template>
<script lang="ts" setup name="CommonImagePreview">
import { computed } from 'vue'
import { leachFormatter } from '../../utils/formatter'
import { imagePreviewProps } from './props'
import { imagePreviewEmits } from './emits'

const props = defineProps(imagePreviewProps)
defineEmits(imagePreviewEmits)

/** 数字当 px，字符串原样（`50%` 正圆）；非法回落默认 8px，和上传卡片同一套 */
const radiusCss = computed(() => {
	const r = props.radius
	if (typeof r === 'number' && Number.isFinite(r) && r >= 0) return `${r}px`
	if (typeof r === 'string' && r.trim()) return r
	return '8px'
})
</script>
<style scoped lang="scss" src="./style.scss" />
