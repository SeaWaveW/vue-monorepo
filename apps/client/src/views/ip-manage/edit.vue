<template>
	<div v-loading="loading" class="ip-manage-edit">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="CLIENT_IP_WHITE_UPDATE"
					:loading="updateLoading"
					icon="antOutline-check-circle"
					data-icon-color="var(--success-color)"
					:disabled="loading"
					@click="handleComplete"
				>
					{{ t('complete') }}
				</SacoButton>
			</template>
		</CommonTeleportNav>
		<SacoCard :header="t('basic_information')">
			<SacoForm
				ref="formRef"
				:model="formModel"
				:rules="formRules"
				:disabled="loading || updateLoading"
				label-position="top"
			>
				<SacoFormItem :label="t('ip')" prop="ip">
					<SacoInput
						v-model="formModel.ip"
						:maxlength="CLIENT_IP_WHITE_IP_MAX_LENGTH"
					/>
				</SacoFormItem>
				<SacoFormItem
					:label="t('remark')"
					prop="remark"
					:style="{ '--column-span': 3 }"
				>
					<SacoTextarea
						v-model="formModel.remark"
						:max-length="CLIENT_IP_WHITE_REMARK_MAX_LENGTH"
						:rows="1"
					/>
				</SacoFormItem>
			</SacoForm>
		</SacoCard>
	</div>
</template>
<script lang="ts" setup name="IpManageEdit">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useRouterStore } from '#/store'
import { useSameChannel } from '#/utils/broadcast'
import { getRouterParams } from '#/utils/router'
const { t } = useI18n()
const { id } = getRouterParams<[number]>(['id'])
const parentPath = '/ip-manage'
const routerStore = useRouterStore()
const route = useRoute()
const routePath = route.path
const sameChannel = useSameChannel(parentPath)
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<ClientIpWhiteUpdateData>({
	id,
	ip: '',
	status: ClientIpWhiteStatus.Available,
	remark: '',
} as ClientIpWhiteDetailResponse)
const formRules = computed<FormRules>(() => ({
	ip: [
		{ required: true, message: t('validate_please_enter_any', [t('ip')]) },
	],
	remark: [
		{
			required: false,
			message: t('validate_please_enter_any', [t('remark')]),
		},
	],
}))

const loading = ref(false)
const getDetail = () => {
	if (loading.value) return
	loading.value = true
	clientIpWhiteDetail(id)
		.then((res) => {
			Object.assign(formModel, res.data)
			routerStore.setCacheValueCode(routePath, res.data.ip)
		})
		.finally(() => {
			loading.value = false
		})
}

const updateLoading = ref(false)
const handleComplete = () => {
	formRef.value?.validate((valid: boolean) => {
		if (!valid) return
		updateLoading.value = true
		clientIpWhiteUpdate(formModel)
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
	})
}

onMounted(() => {
	getDetail()
})
</script>
