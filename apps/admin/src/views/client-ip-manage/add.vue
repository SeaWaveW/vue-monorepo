<template>
	<div class="client-ip-manage-add">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="CLIENT_IP_WHITE_CREATE"
					:loading="createLoading"
					icon="antOutline-check-circle"
					data-icon-color="var(--success-color)"
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
				:disabled="createLoading"
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
			<SacoText type="warning" class="risk-tips">
				{{ t('client_system_ip_manage_risk_tips') }}
			</SacoText>
		</SacoCard>
	</div>
</template>
<script lang="ts" setup name="ClientIpManageAdd">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useSameChannel } from '#/utils/broadcast'
import { useRouterStore } from '#/store'
const { t } = useI18n()
const parentPath = '/client-ip-manage'
const routerStore = useRouterStore()
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<ClientIpWhiteCreateData>({
	ip: '',
	tenantId: undefined as unknown as number,
	remark: '',
})
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
const sameChannel = useSameChannel(parentPath)
onMounted(() => {
	loadTenantList()
})

const createLoading = ref(false)
const handleComplete = () => {
	formRef.value?.validate((valid: boolean) => {
		if (!valid) return
		createLoading.value = true
		clientIpWhiteCreate(formModel)
			.then(() => {
				SacoMessage.success(t('addition_successful'))
				sameChannel.send('reload')
				routerStore.goParentRoute(parentPath)
			})
			.finally(() => {
				createLoading.value = false
			})
	})
}
</script>
<style lang="scss" scoped>
@use '../../style/risk-tips.scss';
</style>
