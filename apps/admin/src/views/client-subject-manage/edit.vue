<template>
	<div v-loading="loading" class="client-subject-manage-edit">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="CLIENT_TENANT_UPDATE"
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
<script lang="ts" setup name="ClientSubjectManageEdit">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useRouterStore } from '#/store'
import { useSameChannel } from '#/utils/broadcast'
import { getRouterParams } from '#/utils/router'
const { t } = useI18n()
const { id } = getRouterParams<[number]>(['id'])
const parentPath = '/client-subject-manage'
const routerStore = useRouterStore()
const route = useRoute()
const routePath = route.path
const sameChannel = useSameChannel(parentPath)
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<ClientTenantUpdateData>({
	id,
	name: '',
	type: undefined as unknown as ClientTenantType,
	validUntil: undefined,
	address: '',
	status: ClientTenantStatus.Available,
	remark: '',
} as ClientTenantDetailResponse)
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

const loading = ref(false)
const getDetail = () => {
	if (loading.value) return
	loading.value = true
	clientTenantDetail(id)
		.then((res) => {
			Object.assign(formModel, res.data)
			routerStore.setCacheValueCode(routePath, res.data.name)
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
		clientTenantUpdate(formModel)
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
	getDetail()
})
</script>
