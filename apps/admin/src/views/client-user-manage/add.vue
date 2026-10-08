<template>
	<div class="user-form">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="CLIENT_USER_CREATE"
					:loading="createLoading"
					icon="antOutline-check-circle"
					data-icon-color="var(--success-color)"
					@click="handleComplete"
				>
					{{ t('complete') }}
				</SacoButton>
			</template>
		</CommonTeleportNav>
		<SacoCard class="base-card" :header="t('basic_information')">
			<SacoForm
				ref="formRef"
				:model="formModel"
				:rules="formRules"
				:disabled="createLoading"
				label-position="top"
			>
				<SacoFormItem :label="t('username')" prop="username">
					<SacoInput
						v-model="formModel.username"
						:maxlength="CLIENT_USER_USERNAME_MAX_LENGTH"
					/>
				</SacoFormItem>
				<SacoFormItem :label="t('email')" prop="email">
					<SacoInput
						v-model="formModel.email"
						:maxlength="CLIENT_USER_EMAIL_MAX_LENGTH"
					/>
				</SacoFormItem>
				<SacoFormItem :label="t('mobile_phone_number')" prop="phone">
					<CommonPhoneInput
						v-model="formModel.phone"
						v-model:country-code="countryCode"
						:maxlength="CLIENT_USER_PHONE_MAX_LENGTH"
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
				<SacoFormItem :label="t('remark')" prop="remark">
					<SacoTextarea
						v-model="formModel.remark"
						:max-length="CLIENT_USER_REMARK_MAX_LENGTH"
						:rows="1"
					/>
				</SacoFormItem>
				<SacoFormItem :label="t('avatar')" prop="avatarUrl">
					<DynamicUploadImage
						v-model:file-url="formModel.avatarUrl"
					/>
				</SacoFormItem>
			</SacoForm>
		</SacoCard>
		<SacoCard class="function-card">
			<template #header>
				{{ t('granting_user_groups') }}
				<SacoButton
					v-power="CLIENT_USER_GROUP_PAGE"
					icon="riLine-checkbox-multiple-line"
					@click="handleSelectFunction"
				>
					{{ t('selection_user_group') }}
				</SacoButton>
			</template>
			<SacoTable :data="apis" @row-dblclick="noTransferDblClick">
				<SacoTableColumn
					:label="t('user_group_name')"
					prop="name"
					width="542px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('remark')"
					prop="remark"
					width="1242px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn :label="t('operation')" width="115px">
					<template #default="{ $index }">
						<SacoText type="danger" @click="handleRemove($index)">
							{{ t('remove') }}
						</SacoText>
					</template>
				</SacoTableColumn>
			</SacoTable>
		</SacoCard>

		<SelectFunction
			v-model="selectFunctionVisible"
			v-model:apis="apis"
			:tenant-id="formModel.tenantId"
		/>
	</div>
</template>
<script lang="ts" setup name="ClientUserManageAdd">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import CommonPhoneInput from '#/components/phone-input/index.vue'
import { useSameChannel } from '#/utils/broadcast'
import { leachFormatter } from '#/utils/formatter'
import { noTransferDblClick } from '#/utils/message'
import {
	isValidPhone,
	composePhone,
	getDefaultPhoneCountryCode,
} from '#/utils/phone'
import { useRouterStore } from '#/store'
import SelectFunction from '@/components/client-user-manage/select-function.vue'
const { t, locale } = useI18n()
const parentPath = '/client-user-manage'
const routerStore = useRouterStore()
const formRef = ref<FormExpose | null>(null)
type ClientUserCreateForm = Omit<ClientUserCreateData, 'avatarUrl'> & {
	avatarUrl: string
}
const formModel = reactive<ClientUserCreateForm>({
	username: '',
	email: '',
	phone: '',
	tenantId: undefined as unknown as number,
	// status: undefined,
	remark: '',
	avatarUrl: '',
	groupIds: [],
})
const countryCode = ref(getDefaultPhoneCountryCode(locale.value))
const { tenantList, tenantLoading, loadTenantList } = useClientTenantOptions()
const formRules = computed<FormRules>(() => ({
	username: [
		{
			required: true,
			message: t('validate_please_enter_any', [t('username')]),
		},
	],
	email: [
		{
			required: true,
			message: t('validate_please_enter_any', [t('email')]),
			validator: (value) => {
				if (
					!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
						value,
					)
				) {
					return t('validate_any_incorrect_format', [t('email')])
				}

				return true
			},
		},
	],
	tenantId: [
		{
			type: 'number',
			required: true,
			message: t('validate_please_select_any', [t('client_subject')]),
		},
	],
	phone: [
		{
			required: true,
			message: t('validate_please_enter_any', [t('mobile_phone_number')]),
			validator: (value) => {
				if (!countryCode.value) {
					return t('validate_please_select_any', [
						t('country_calling_code'),
					])
				}
				if (!value) {
					return true
				}
				if (!isValidPhone(composePhone(countryCode.value, value))) {
					return t('validate_any_incorrect_format', [
						t('mobile_phone_number'),
					])
				}
				return true
			},
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

const selectFunctionVisible = ref(false)
const apis = ref<ClientUserGroupPageRecord[]>([])
const handleSelectFunction = () => {
	if (!formModel.tenantId) {
		SacoMessage.warning(
			t('validate_please_select_any', [t('client_subject')]),
		)
		formRef.value?.validateField('tenantId')
		return
	}
	selectFunctionVisible.value = true
}
const handleRemove = (index: number) => {
	apis.value.splice(index, 1)
}
watch(
	() => formModel.tenantId,
	(next, prev) => {
		if (prev == null || next === prev) return
		apis.value = []
	},
)

const createLoading = ref(false)
const handleComplete = () => {
	formRef.value?.validate((valid: boolean) => {
		if (!valid) return
		createLoading.value = true
		const { groupIds, phone, ...rest } = formModel
		clientUserCreate({
			...rest,
			phone: composePhone(countryCode.value, phone),
			groupIds: apis.value.map((item) => item.id),
		})
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
onMounted(() => {
	loadTenantList()
})
</script>
<style lang="scss" scoped>
@use '../../style/user-form.scss';
</style>
