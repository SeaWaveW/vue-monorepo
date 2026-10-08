import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { InputProps } from './types'

export const inputProps = {
	modelValue: {
		type: [String, Number, Boolean, Object, Array] as PropType<
			InputProps['modelValue']
		>,
		default: null,
	},
	type: {
		type: String as PropType<InputProps['type']>,
		default: 'text',
	},
	disabled: {
		type: Boolean as PropType<InputProps['disabled']>,
		default: false,
	},
	maxlength: {
		type: Number as PropType<InputProps['maxlength']>,
		default: 100,
	},
	placeholder: {
		type: String as PropType<InputProps['placeholder']>,
		default: '',
	},
	prefixIcon: {
		type: String as PropType<InputProps['prefixIcon']>,
		default: null,
	},
	suffixIcon: {
		type: String as PropType<InputProps['suffixIcon']>,
		default: null,
	},
	clearable: {
		type: Boolean as PropType<InputProps['clearable']>,
		default: true,
	},
	readonly: {
		type: Boolean as PropType<InputProps['readonly']>,
		default: false,
	},
} satisfies ComponentObjectPropsOptions<InputProps>
