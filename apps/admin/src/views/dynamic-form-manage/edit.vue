<template>
	<div v-loading="loading" class="dynamic-form-manage-edit">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="DYNAMIC_FORM_UPDATE_SCHEMA"
					:loading="updateLoading"
					icon="antOutline-check-circle"
					data-icon-color="var(--success-color)"
					:disabled="loading"
					@click="onComplete"
				>
					{{ t('complete') }}
				</SacoButton>
			</template>
		</CommonTeleportNav>
		<Dynamic
			v-if="schemaReady"
			ref="dynamicRef"
			v-model:components="components"
			v-model:proportion="proportion"
		/>
	</div>
</template>
<script lang="ts" setup name="DynamicFormManageEdit">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useRouterStore } from '#/store'
import { useSameChannel } from '#/utils/broadcast'
import { getRouterParams } from '#/utils/router'
import { PROPORTION_DEFAULT_SIZE } from '#/utils/proportion'
import type { ComponentItem } from '#/dynamic'
import Dynamic from '@/dynamic/index.vue'
const { t } = useI18n()
const { id } = getRouterParams<[number]>(['id'])
const parentPath = '/dynamic-form-manage'
const routerStore = useRouterStore()
const route = useRoute()
const routePath = route.path
const sameChannel = useSameChannel(parentPath)
const dynamicRef = ref<InstanceType<typeof Dynamic>>()
const components = ref<ComponentItem[]>([])
const proportion = ref<TabPaneName>(PROPORTION_DEFAULT_SIZE)
const schemaReady = ref(false)
const loading = ref(false)
const updateLoading = ref(false)

const getDetail = () => {
	if (loading.value) return
	loading.value = true
	schemaReady.value = false
	dynamicFormDetail(id)
		.then((res) => {
			const list = res.data.schemaJson?.components
			components.value = Array.isArray(list) ? list : []
			proportion.value = res.data.widthLevel ?? PROPORTION_DEFAULT_SIZE
			routerStore.setCacheValueCode(routePath, res.data.name)
			schemaReady.value = true
		})
		.finally(() => {
			loading.value = false
		})
}

const onComplete = () => {
	const isValid = dynamicRef.value?.validateComponents()
	if (!isValid) return
	const schemaData: DynamicFormUpdateSchemaData = {
		id,
		schemaJson: { components: components.value },
		widthLevel: Number(proportion.value),
	}
	updateLoading.value = true
	dynamicFormUpdateSchema(schemaData)
		.then(() => {
			SacoMessage.success(t('modified_successfully'))
			const parentRoute = routerStore.getParentRoute()
			if (parentRoute?.includes?.('/detail')) {
				routerStore.delCache(parentRoute)
			}
			sameChannel.send('refresh')
			routerStore.goParentRoute(parentPath)
		})
		.finally(() => {
			updateLoading.value = false
		})
}

onMounted(() => {
	getDetail()
})
</script>
<style scoped lang="scss">
.dynamic-form-manage-edit {
	display: flex;
	flex: 1;
	flex-direction: column;
	min-height: 0;
	overflow: hidden;

	:deep(.dynamic-component) {
		flex: 1;
		min-height: 0;
	}
}
</style>
