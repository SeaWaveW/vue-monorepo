<template>
	<SacoInput v-model="modelValue" v-bind="bindProps" v-on="onEvents">
		<template v-for="(slot, name) in slots" :key="name" #[name]="slotProps">
			<slot :name="slot" v-bind="slotProps" />
		</template>
	</SacoInput>
</template>
<script lang="ts" setup name="DynamicInput">
import { computed, useSlots } from 'vue'
import type { Slots } from 'vue'
import { SacoInput } from '@saco/ui/es/components/input'
import { inputProps } from './props'
import { inputEmits } from './emits'
import type { InputProps } from './types'

/** 纯透传双绑；default 必须是 string，不能 null（vue-tsc 的 DefineModelDefault） */
const modelValue = defineModel<InputProps['modelValue']>({ default: '' })

const props = defineProps(inputProps)
const emit = defineEmits(inputEmits)
const slots: Slots = useSlots()
const bindProps = computed(() => {
	const { modelValue, prefixIcon, suffixIcon, ...rest } = props
	return {
		prefixIcon: prefixIcon as any,
		suffixIcon: suffixIcon as any,
		...rest,
	}
})
const onEvents = computed(() => {
	return {
		focus: () => emit('focus'),
		blur: () => emit('blur'),
		clear: () => emit('clear'),
		input: (value: string) => emit('input', value),
		enter: () => emit('enter'),
	}
})
</script>
<style lang="scss" src="./style.scss" />
