<template>
	<div class="client-subject-manage-add">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="CLIENT_TENANT_CREATE"
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
				<SacoFormItem :label="t('subject_name')" prop="name">
					<SacoInput
						v-model="formModel.name"
						:maxlength="CLIENT_TENANT_NAME_MAX_LENGTH"
					/>
				</SacoFormItem>
				<SacoFormItem :label="t('subject_type')" prop="type">
					<SacoSelect
						v-model="formModel.type"
						:data="clientTenantTypeList"
						:clearable="true"
						:filterable="true"
					/>
				</SacoFormItem>
				<SacoFormItem
					:label="t('use_effective_time')"
					prop="validUntil"
				>
					<SacoDatePicker
						v-model="formModel.validUntil"
						type="date"
						value-format="timestamp-end"
					/>
				</SacoFormItem>
				<SacoFormItem
					:label="t('address')"
					prop="address"
					:style="{ '--column-span': 2 }"
				>
					<SacoInput
						v-model="formModel.address"
						:maxlength="CLIENT_TENANT_ADDRESS_MAX_LENGTH"
					/>
				</SacoFormItem>
				<SacoFormItem
					:label="t('remark')"
					prop="remark"
					:style="{ '--column-span': 2 }"
				>
					<SacoTextarea
						v-model="formModel.remark"
						:max-length="CLIENT_TENANT_REMARK_MAX_LENGTH"
						:rows="1"
					/>
				</SacoFormItem>
			</SacoForm>
		</SacoCard>
	</div>
</template>
<script lang="ts" setup name="ClientSubjectManageAdd">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useSameChannel } from '#/utils/broadcast'
import { useRouterStore } from '#/store'
const { t } = useI18n()
const parentPath = '/client-subject-manage'
const routerStore = useRouterStore()
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<ClientTenantCreateData>({
	name: '',
	type: undefined as unknown as ClientTenantType,
	validUntil: undefined,
	address: '',
	remark: '',
})
const formRules = computed<FormRules>(() => ({
	name: [
		{
			required: true,
			message: t('validate_please_enter_any', [t('subject_name')]),
		},
	],
	type: [
		{
			type: 'number',
			required: true,
			message: t('validate_please_select_any', [t('subject_type')]),
		},
	],
	validUntil: [
		{
			type: 'number',
			required: true,
			message: t('validate_please_select_any', [t('use_effective_time')]),
		},
	],
	address: [
		{
			required: true,
			message: t('validate_please_enter_any', [t('address')]),
		},
	],
	remark: [
		{
			required: false,
			message: t('validate_please_enter_any', [t('remark')]),
		},
	],
}))
const { clientTenantTypeList } = useClientTenantType()
const sameChannel = useSameChannel(parentPath)

const createLoading = ref(false)
const handleComplete = () => {
	formRef.value?.validate((valid: boolean) => {
		if (!valid) return
		createLoading.value = true
		clientTenantCreate(formModel)
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
