<template>
	<SacoFormItem
		class="configure-placeholder"
		prop="props.placeholder"
		:label="t('prompt')"
	>
		<SacoInput
			v-model="placeholder"
			:placeholder="t('optional')"
			:clearable="false"
		/>
	</SacoFormItem>
</template>
<script lang="ts" setup name="configurePlaceholder">
const placeholder = defineModel<string>('placeholder', { default: '' })
const { t } = useI18n()
</script>
