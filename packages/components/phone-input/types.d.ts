/** 区号下拉 + 本地号。页面传 `v-model` + `v-model:country-code`，提交再 `composePhone` */
export interface PhoneInputProps {
	/** 本地号 */
	modelValue?: string
	/** 国家呼叫代码（无 +）。空则按当前语言：中文 86，其它 1 */
	countryCode?: string
	/** 接口字段最长；本地号上限 = 这项减去当前区号位数 */
	maxlength?: number
	disabled?: boolean
	placeholder?: string
	clearable?: boolean
}

export interface PhoneInputEmits {
	'update:modelValue': [value: string]
	'update:countryCode': [value: string]
	change: [value: string]
	enter: []
}
