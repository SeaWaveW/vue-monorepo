<template>
	<SacoFormItem class="configure-com-required" prop="required">
		<SacoCheckbox
			:model-value="required === true"
			:label="t('mandatory_or_not')"
			@update:model-value="required = $event === true"
		/>
	</SacoFormItem>
</template>
<script lang="ts" setup name="configure-com-required">
const { t } = useI18n()
const required = defineModel<boolean>('required')
</script>
