import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { SelectProps } from './types'

export const selectProps = {
	data: {
		type: Array as PropType<SelectProps['data']>,
		default: () => [],
	},
	modelValue: {
		type: [String, Number, Boolean, Object, Array] as PropType<
			SelectProps['modelValue']
		>,
		default: null,
	},
	modelLabel: {
		type: [String, Number, Boolean, Object, Array] as PropType<
			SelectProps['modelLabel']
		>,
		default: '',
	},
	disabled: {
		type: Boolean as PropType<SelectProps['disabled']>,
		default: false,
	},
	placeholder: {
		type: String as PropType<SelectProps['placeholder']>,
		default: '',
	},
	clearable: {
		type: Boolean as PropType<SelectProps['clearable']>,
		default: true,
	},
	filterable: {
		type: Boolean as PropType<SelectProps['filterable']>,
		default: true,
	},
	filterPlaceholder: {
		type: String as PropType<SelectProps['filterPlaceholder']>,
		default: '',
	},
	filterDelay: {
		type: Number as PropType<SelectProps['filterDelay']>,
		default: 150,
	},
	multiple: {
		type: Boolean as PropType<SelectProps['multiple']>,
		default: false,
	},
	fieldLabel: {
		type: String as PropType<SelectProps['fieldLabel']>,
		default: 'label',
	},
	fieldValue: {
		type: String as PropType<SelectProps['fieldValue']>,
		default: 'value',
	},
	popperClass: {
		type: String as PropType<SelectProps['popperClass']>,
		default: '',
	},
} satisfies ComponentObjectPropsOptions<SelectProps>
