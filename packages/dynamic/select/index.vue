<template>
	<SacoSelect
		v-model="modelValue"
		v-model:model-label="modelLabel"
		v-bind="bindProps"
	>
		<template v-for="(slot, name) in slots" :key="name" #[name]="slotProps">
			<slot :name="slot" v-bind="slotProps" />
		</template>
	</SacoSelect>
</template>
<script lang="ts" setup name="DynamicSelect">
import { computed, useSlots } from 'vue'
import type { Slots } from 'vue'
import { SacoSelect } from '@saco/ui/es/components/select'
import { selectProps } from './props'
import { selectEmits } from './emits'
import type { SelectProps } from './types'

/** 选项值纯透传；未选为 null，泛型要带上否则 default: null 过不了 vue-tsc */
const modelValue = defineModel<SelectProps['modelValue'] | null>({
	default: null,
})
const modelLabel = defineModel<SelectProps['modelLabel']>('modelLabel', {
	default: '',
})

const props = defineProps(selectProps)
defineEmits(selectEmits)
const slots: Slots = useSlots()
const bindProps = computed(() => {
	const { modelValue, modelLabel, ...rest } = props
	return {
		...rest,
	}
})
</script>
<style lang="scss" src="./style.scss" />
