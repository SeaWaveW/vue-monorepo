import type { RadioEmits } from './types'

export const radioEmits: Array<keyof RadioEmits> = [
	'update:modelValue',
	'update:modelLabel',
	'change',
]
