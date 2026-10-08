<template>
	<div v-loading="loading" class="user-form">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="CLIENT_USER_UPDATE"
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
		<SacoCard class="base-card" :header="t('basic_information')">
			<SacoForm
				ref="formRef"
				:model="formModel"
				:rules="formRules"
				:disabled="updateLoading"
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
<script lang="ts" setup name="ClientUserManageEdit">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import CommonPhoneInput from '#/components/phone-input/index.vue'
import { useSameChannel } from '#/utils/broadcast'
import { leachFormatter } from '#/utils/formatter'
import { noTransferDblClick, confirmBox } from '#/utils/message'
import { getRouterParams } from '#/utils/router'
import { isValidPhone, parsePhone, composePhone } from '#/utils/phone'
import { useRouterStore, useUserStore } from '#/store'
import SelectFunction from '@/components/client-user-manage/select-function.vue'
const { t } = useI18n()
const routerStore = useRouterStore()
const route = useRoute()
const routePath = route.path
const userStore = useUserStore()
const { id } = getRouterParams<[number]>(['id'])
const parentPath = '/client-user-manage'
const sameChannel = useSameChannel(parentPath)
const formRef = ref<FormExpose | null>(null)
type ClientUserUpdateForm = Omit<ClientUserUpdateData, 'avatarUrl'> & {
	avatarUrl: string
}
const formModel = reactive<ClientUserUpdateForm>({
	id,
	username: '',
	email: '',
	phone: '',
	tenantId: undefined as unknown as number,
	// status: undefined,
	remark: '',
	avatarUrl: '',
	groupIds: [],
})
const countryCode = ref('')
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
const loading = ref(false)
const getDetail = () => {
	if (loading.value) return
	loading.value = true
	clientUserDetail(id)
		.then((res) => {
			const { userGroups, ...rest } = res.data
			apis.value = userGroups
			const phoneParts = parsePhone(rest.phone)
			Object.assign(formModel, {
				...rest,
				phone: phoneParts.localNumber,
				avatarUrl: rest.avatarUrl || '',
				// 导航授权
				groupIds: userGroups.map((item) => item.id),
			})
			countryCode.value = phoneParts.countryCode
			routerStore.setCacheValueCode(routePath, rest.username)
		})
		.finally(() => {
			loading.value = false
		})
}
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

const updateLoading = ref(false)
const handleComplete = () => {
	formRef.value?.validate((valid: boolean) => {
		if (!valid) return
		const { groupIds, phone, ...rest } = formModel
		const apiPhone = composePhone(countryCode.value, phone)
		confirmBox({
			title: 'modify',
			message: 'user_edit_message',
			api: clientUserUpdate,
			params: {
				...rest,
				phone: apiPhone,
				groupIds: apis.value.map((item) => item.id),
			},
			success: 'modified_successfully',
		}).then(() => {
			// 更新当前用户头像
			if (formModel.id === userStore.userId) {
				userStore.setUserInfo({
					userId: userStore.userId,
					userName: formModel.username!,
					email: formModel.email,
					phone: apiPhone,
					avatarUrl: formModel.avatarUrl,
				})
			}
			const parentRoute = routerStore.getParentRoute()
			// 从详情进编辑：详情已过期，先关详情签，否则会回到旧详情
			if (parentRoute?.includes?.('/detail')) {
				routerStore.delCache(parentRoute)
			}
			sameChannel.send('refresh')
			routerStore.goParentRoute(parentPath)
		})
	})
}
onMounted(() => {
	loadTenantList()
	getDetail()
})
</script>
<style lang="scss" scoped>
@use '../../style/user-form.scss';
</style>
