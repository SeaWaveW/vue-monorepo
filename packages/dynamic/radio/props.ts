import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { RadioProps } from './types'

export const radioProps = {
	modelValue: {
		type: [String, Number, Boolean] as PropType<RadioProps['modelValue']>,
		default: '',
	},
	modelLabel: {
		type: [String, Number, Boolean] as PropType<RadioProps['modelLabel']>,
		default: '',
	},
	data: {
		type: Array as PropType<RadioProps['data']>,
		default: () => [],
	},
	direction: {
		type: String as PropType<RadioProps['direction']>,
		default: 'vertical',
	},
} satisfies ComponentObjectPropsOptions<RadioProps>
