import type {
	RadioGroupEmits,
	RadioGroupProps,
	RadioOption,
	RadioValueType,
} from '@saco/ui'

export type { RadioOption, RadioValueType }
export type RadioItem = RadioOption

/** 动态表单单选：底层走 RadioGroup，data 对应 options */
export type RadioProps = Omit<RadioGroupProps, 'options'> & {
	data?: RadioOption[]
	modelLabel?: RadioValueType
}

export type RadioEmits = RadioGroupEmits & {
	'update:modelLabel': [value: RadioValueType]
}
