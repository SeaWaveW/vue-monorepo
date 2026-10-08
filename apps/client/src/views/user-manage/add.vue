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
				<SacoFormItem
					:label="t('remark')"
					prop="remark"
					:style="{ '--column-span': 2 }"
				>
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
					@click="selectFunctionVisible = true"
				>
					{{ t('select_terminal_user_group') }}
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

		<SelectUserGroup v-model="selectFunctionVisible" v-model:apis="apis" />
	</div>
</template>
<script lang="ts" setup name="UserManageAdd">
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
import SelectUserGroup from '@/components/user-manage/select-user-group.vue'
const { t, locale } = useI18n()
const parentPath = '/user-manage'
const routerStore = useRouterStore()
const formRef = ref<FormExpose | null>(null)
type UserCreateForm = Omit<ClientUserCreateData, 'avatarUrl'> & {
	avatarUrl: string
}
const formModel = reactive<UserCreateForm>({
	username: '',
	email: '',
	phone: '',
	remark: '',
	avatarUrl: '',
	groupIds: [],
})
const countryCode = ref(getDefaultPhoneCountryCode(locale.value))
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
const handleRemove = (index: number) => {
	apis.value.splice(index, 1)
}

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
</script>
<style lang="scss" scoped>
@use '../../style/user-form.scss';
</style>
