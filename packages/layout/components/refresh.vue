<template>
	<SacoSvg
		name="md-sync"
		class="refresh-icon"
		@click="refreshPage"
	/>
</template>
<script lang="ts" setup name="LayoutRefresh">
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { SacoSvg } from '@saco/ui/es/components/svg'
import { SacoMessage } from '@saco/ui/es/components/message'
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const refreshPage = () => {
	router.replace(route.path).then(() => {
		SacoMessage.success(t('router_refresh_successful'))
	})
}
</script>
<style scoped lang="scss">
.refresh-icon {
	font-size: 20px;
	color: var(--black-color-1);
	cursor: pointer;
}
</style>
