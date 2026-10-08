<template>
	<SacoFormItem class="configure-com-limit-length">
		<SacoCheckbox
			:model-value="limitLength"
			:label="t('limit_word_count')"
			@update:model-value="limitLength = $event === true"
		/>
		<div v-show="limitLength" class="number-range">
			<SacoFormItem prop="props.minlength" :rules="minRules">
				<SacoNumber
					v-model="minlength"
					:min="0"
					:placeholder="t('minimum')"
					@input="minInput"
				/>
			</SacoFormItem>
			<div class="separator">—</div>
			<SacoFormItem prop="props.maxlength" :rules="maxRules">
				<SacoNumber
					v-model="maxlength"
					:placeholder="t('maximum')"
					@input="maxInput"
				/>
			</SacoFormItem>
		</div>
	</SacoFormItem>
</template>
<script lang="ts" setup name="configure-com-required">
import { useConfigureForm } from '../utils'
const { t } = useI18n()
const limitLength = defineModel<boolean>('limitLength')
const minlength = defineModel<number | null>('minlength', { default: null })
const maxlength = defineModel<number | null>('maxlength', { default: null })
const formRef = useConfigureForm()
watch(limitLength, (value) => {
	if (!value) {
		minlength.value = null
		maxlength.value = null
		nextTick(() => {
			formRef?.validateField(['props.minlength', 'props.maxlength'])
		})
	}
})
const minInput = (value: number | null) => {
	if (value != null && maxlength.value != null && value > maxlength.value) {
		minlength.value = maxlength.value
	}
}
const maxInput = (value: number | null) => {
	if (value != null && minlength.value != null && value < minlength.value) {
		maxlength.value = minlength.value
	}
}
const minRules = computed<RulesItem[]>(() => [
	{
		required: limitLength.value,
		message: t('validate_please_enter_any', [t('minimum_value')]),
		trigger: ['change', 'blur'],
	},
])
const maxRules = computed<RulesItem[]>(() => [
	{
		required: limitLength.value,
		message: t('validate_please_enter_any', [t('maximum_value')]),
		trigger: ['change', 'blur'],
	},
])
</script>
<style scoped lang="scss">
.configure-com-limit-length {
	.number-range {
		display: flex;
		gap: var(--common-gap);
		align-items: center;
		width: 100%;

		.sqt-form-item {
			flex: 1;
			margin-bottom: 0 !important;
		}

		.separator {
			display: flex;
			align-items: center;

			$size: 20px;

			width: $size;
			height: $size;
			color: var(--grey-color-3);
		}
	}
}
</style>
