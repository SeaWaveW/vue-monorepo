<template>
	<SacoRadioGroup
		v-model="modelValue"
		:options="props.data"
		:direction="props.direction"
		v-bind="bindProps"
		@change="onChange"
	/>
</template>
<script lang="ts" setup name="DynamicRadio">
import { computed } from 'vue'
import { SacoRadioGroup } from '@saco/ui/es/components/radio-group'
import { radioProps } from './props'
import { radioEmits } from './emits'
import type { RadioProps, RadioValueType } from './types'

/** 选中值纯透传 */
const modelValue = defineModel<RadioProps['modelValue']>({ default: '' })
/**
 * 文案双绑：点选时在 onChange 里同步 label，不是纯透传 setter，
 * 但仍用 defineModel 承接父级 v-model:model-label
 */
const modelLabel = defineModel<RadioProps['modelLabel']>('modelLabel', {
	default: '',
})

const props = defineProps(radioProps)
const emit = defineEmits(radioEmits)
const bindProps = computed(() => {
	const {
		modelValue,
		modelLabel,
		data,
		direction,
		...rest
	} = props
	return rest
})
const onChange = (value: RadioValueType) => {
	emit('change', value)
	const item = props.data?.find((opt) => (opt.value ?? opt.label) === value)
	// 有匹配项才回写 label，避免空点把父级文案清掉
	if (item?.label != null) modelLabel.value = item.label
}
</script>
<style scoped lang="scss" src="./style.scss" />
