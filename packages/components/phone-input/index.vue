<template>
	<SacoInput
		class="phone-input"
		:model-value="modelValue"
		:maxlength="localMaxlength"
		:disabled="disabled"
		:placeholder="placeholder"
		:clearable="clearable"
		@update:model-value="onLocalInput"
		@change="onLocalChange"
		@enter="emit('enter')"
	>
		<template #prepend>
			<SacoSelect
				class="phone-input__dial"
				popper-class="phone-input-dial-popper"
				:model-value="resolvedCountryCode"
				:data="PHONE_DIAL_OPTIONS"
				:disabled="disabled"
				:clearable="false"
				:filterable="false"
				@update:model-value="onCountryChange"
			>
				<template #prefix>
					<SacoSvg
						v-if="currentSvgName"
						:name="currentSvgName"
						class="phone-input__flag"
					/>
				</template>
				<template #default="{ label, svgName }">
					<span class="phone-input__option">
						<PhoneLazyFlag :name="svgName" />
						{{ label }}
					</span>
				</template>
			</SacoSelect>
		</template>
	</SacoInput>
</template>
<script lang="ts" setup name="CommonPhoneInput">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { SacoInput } from '@saco/ui/es/components/input'
import { SacoSelect } from '@saco/ui/es/components/select'
import { SacoSvg } from '@saco/ui/es/components/svg'
import PhoneLazyFlag from './lazy-flag.vue'
import {
	PHONE_DIAL_OPTIONS,
	getDefaultPhoneCountryCode,
	phoneDialSvgName,
} from '../../utils/phone'

const props = withDefaults(
	defineProps<{
		/** 本地号。接口 `phone` 由页面 `composePhone(countryCode, phone)` 再拼 */
		modelValue?: string
		/** 国家呼叫代码（无 +）。空则按当前语言：中文 86，其它 1 */
		countryCode?: string
		maxlength?: number
		disabled?: boolean
		placeholder?: string
		clearable?: boolean
	}>(),
	{
		modelValue: '',
		countryCode: '',
		clearable: true,
	},
)

const emit = defineEmits<{
	'update:modelValue': [value: string]
	'update:countryCode': [value: string]
	change: [value: string]
	enter: []
}>()

const { locale } = useI18n({ useScope: 'global' })

/** 空着按语言补默认；父级 v-model 空串也会走这里 */
const resolvedCountryCode = computed(() => {
	return props.countryCode || getDefaultPhoneCountryCode(locale.value)
})

/** 当前区号对应 country/{iso}.svg；默认国家也要画旗 */
const currentSvgName = computed(() =>
	phoneDialSvgName(resolvedCountryCode.value),
)

/** 接口总长含区号；没选国家时本地号用满接口上限 */
const localMaxlength = computed(() => {
	if (props.maxlength == null) {
		return undefined
	}
	return Math.max(0, props.maxlength - resolvedCountryCode.value.length)
})

/** 空值回写默认，校验 / composePhone 和下拉同一份 */
watch(
	() => props.countryCode,
	(code) => {
		if (!code) {
			emit('update:countryCode', getDefaultPhoneCountryCode(locale.value))
		}
	},
	{ immediate: true },
)

const onLocalInput = (value: string | number) => {
	emit('update:modelValue', String(value ?? ''))
}

const onLocalChange = (value: string | number) => {
	emit('change', String(value ?? ''))
}

const onCountryChange = (
	value: string | number | boolean | object | unknown[],
) => {
	emit(
		'update:countryCode',
		value == null || value === '' ? '' : String(value),
	)
}
</script>
<style lang="scss" src="./style.scss" />
