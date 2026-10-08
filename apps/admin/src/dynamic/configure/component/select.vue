<template>
	<div class="configure-select">
		<SacoFormItem :label="t('default_value')">
			<SacoSelect
				:data="component?.props?.data"
				v-bind="defaulBind"
				:placeholder="t('optional')"
				:clearable="true"
				:filterable="true"
				v-on="defaultOn"
			/>
		</SacoFormItem>
	</div>
</template>
<script lang="ts" setup name="ConfigureSelect">
import type { ComponentItem } from '#/dynamic'
import { usePropsDefaultBind } from '../config'

const component = defineModel<ComponentItem>('component')
const { t } = useI18n()
const { defaulBind, defaultOn } = usePropsDefaultBind(component)
</script>
<style scoped lang="scss"></style>
