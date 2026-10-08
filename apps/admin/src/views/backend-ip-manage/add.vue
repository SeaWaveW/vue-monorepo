<template>
	<div class="backend-ip-manage-add">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="ADMIN_IP_WHITE_CREATE"
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
						:maxlength="ADMIN_IP_WHITE_IP_MAX_LENGTH"
					/>
				</SacoFormItem>
				<SacoFormItem
					:label="t('remark')"
					prop="remark"
					:style="{ '--column-span': 2 }"
				>
					<SacoTextarea
						v-model="formModel.remark"
						:max-length="ADMIN_IP_WHITE_REMARK_MAX_LENGTH"
						:rows="1"
					/>
				</SacoFormItem>
			</SacoForm>
			<SacoText type="warning" class="risk-tips">
				{{ t('backend_system_ip_manage_risk_tips') }}
			</SacoText>
		</SacoCard>
	</div>
</template>
<script lang="ts" setup name="BackendIpManageAdd">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useSameChannel } from '#/utils/broadcast'
import { useRouterStore } from '#/store'
const { t } = useI18n()
const parentPath = '/backend-ip-manage'
const routerStore = useRouterStore()
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<AdminIpWhiteCreateData>({
	ip: '',
	remark: '',
})
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
const sameChannel = useSameChannel(parentPath)

const createLoading = ref(false)
const handleComplete = () => {
	formRef.value?.validate((valid: boolean) => {
		if (!valid) return
		createLoading.value = true
		adminIpWhiteCreate(formModel)
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
