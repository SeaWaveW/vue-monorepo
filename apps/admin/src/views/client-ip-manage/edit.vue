<template>
	<div v-loading="loading" class="client-ip-manage-edit">
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
		<SacoCard>
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
				<SacoFormItem :label="t('client_subject')" prop="tenantId">
					<SacoSelect
						v-model="formModel.tenantId"
						:data="tenantList"
						field-label="name"
						field-value="id"
						:loading="tenantLoading"
						:loading-text="t('fetching')"
						:clearable="true"
						:filterable="true"
					/>
				</SacoFormItem>
				<SacoFormItem
					:label="t('remark')"
					prop="remark"
					:style="{ '--column-span': 2 }"
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
<script lang="ts" setup name="ClientIpManageEdit">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useRouterStore } from '#/store'
import { useSameChannel } from '#/utils/broadcast'
import { getRouterParams } from '#/utils/router'
const { t } = useI18n()
const { id } = getRouterParams<[number]>(['id'])
const parentPath = '/client-ip-manage'
const routerStore = useRouterStore()
const route = useRoute()
const routePath = route.path
const sameChannel = useSameChannel(parentPath)
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<ClientIpWhiteUpdateData>({
	id,
	ip: '',
	tenantId: undefined as unknown as number,
	status: ClientIpWhiteStatus.Available,
	remark: '',
} as ClientIpWhiteDetailResponse)
const { tenantList, tenantLoading, loadTenantList } = useClientTenantOptions()
const formRules = computed<FormRules>(() => ({
	ip: [
		{ required: true, message: t('validate_please_enter_any', [t('ip')]) },
	],
	tenantId: [
		{
			type: 'number',
			required: true,
			message: t('validate_please_select_any', [t('client_subject')]),
		},
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
				// 从详情进编辑：详情已过期，先关详情签，否则会回到旧详情
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
	loadTenantList()
	getDetail()
})
</script>
