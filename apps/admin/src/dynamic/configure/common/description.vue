<template>
	<SacoFormItem
		class="configure-com-description"
		prop="description"
		:label="t('component_description')"
	>
		<SacoTextarea v-model="description" :placeholder="t('description')" />
	</SacoFormItem>
</template>
<script lang="ts" setup name="configure-com-title">
const { t } = useI18n()
const description = defineModel<string>('description')
</script>
