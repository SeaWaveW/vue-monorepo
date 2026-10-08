<template>
	<div v-loading="loading" class="backend-login-log">
		<CommonTeleportNav refresh expand :model="formModel">
			<template #top>
				<SacoButton
					icon="md-refresh"
					:loading="refreshLoading"
					:disabled="searchLoading"
					@click="reset"
				>
					{{ t('reset') }}
				</SacoButton>
				<SacoButton
					icon="mb-search"
					type="primary"
					:loading="searchLoading"
					:disabled="refreshLoading"
					data-search
					@click="search"
				>
					{{ t('search') }}
				</SacoButton>
			</template>
			<template #bottom>
				<SacoForm ref="formRef" :model="formModel">
					<SacoFormItem prop="username">
						<SacoInput
							v-model="formModel.username"
							:placeholder="t('logged_in_user')"
							:maxlength="
								ADMIN_USER_LOGIN_LOG_USERNAME_MAX_LENGTH
							"
							@keyup.enter="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="email">
						<SacoInput
							v-model="formModel.email"
							:placeholder="t('email')"
							:maxlength="ADMIN_USER_LOGIN_LOG_EMAIL_MAX_LENGTH"
							@keyup.enter="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="startLoginTime">
						<SacoDatePicker
							v-model="formModel.startLoginTime"
							type="date"
							value-format="timestamp"
							:placeholder="t('start_login_time')"
							:disabled-date="disableStartDate"
							@change="search"
							@clear="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="endLoginTime">
						<SacoDatePicker
							v-model="formModel.endLoginTime"
							type="date"
							value-format="timestamp-end"
							:placeholder="t('end_login_time')"
							:disabled-date="disableEndDate"
							@change="search"
							@clear="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="deviceType">
						<SacoSelect
							v-model="formModel.deviceType"
							:placeholder="t('device_type')"
							:data="adminUserLoginLogDeviceTypeList"
							:clearable="true"
							:filterable="true"
							@change="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="deviceCode">
						<SacoInput
							v-model="formModel.deviceCode"
							:placeholder="t('machine_code')"
							:maxlength="
								ADMIN_USER_LOGIN_LOG_DEVICE_CODE_MAX_LENGTH
							"
							@keyup.enter="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="ip">
						<SacoInput
							v-model="formModel.ip"
							:placeholder="t('ip')"
							:maxlength="ADMIN_USER_LOGIN_LOG_IP_MAX_LENGTH"
							@keyup.enter="search"
						/>
					</SacoFormItem>
				</SacoForm>
			</template>
		</CommonTeleportNav>
		<SacoTable :data="dataList" @row-dblclick="noTransferDblClick">
			<SacoTableColumn
				:label="t('logged_in_user')"
				prop="username"
				width="167px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('email')"
				prop="email"
				width="224px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('login_time')"
				prop="loginTime"
				width="218px"
				:formatter="hmdhmsFormatter"
			/>
			<SacoTableColumn
				:label="t('device_type')"
				prop="deviceType"
				width="139px"
				:formatter="adminUserLoginLogDeviceTypeFormatter"
			/>
			<SacoTableColumn
				:label="t('machine_code')"
				prop="deviceCode"
				width="221px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('ip')"
				prop="ip"
				width="170px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('login_location')"
				prop="loginLocation"
				width="321px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn :label="t('status')" prop="status" width="151px">
				<template
					#default="{ row }: { row: AdminUserLoginLogPageRecord }"
				>
					<SacoText :type="adminUserLoginLogStatusType[row.status!]">
						{{ adminUserLoginLogStatusFormatter(row.status) }}
					</SacoText>
				</template>
			</SacoTableColumn>
			<SacoTableColumn
				:label="t('reason_for_failure')"
				prop="failureReason"
				width="285px"
				:formatter="leachFormatter"
			/>
		</SacoTable>
		<CommonTeleportFooter>
			<CommonPagination
				v-model:current-page="pageInfo.pageNum"
				v-model:page-size="pageInfo.pageSize"
				:disabled="loading"
				:total="pageInfo.total"
				@change="search"
			/>
		</CommonTeleportFooter>
	</div>
</template>
<script lang="ts" setup name="BackendLoginLog">
import CommonPagination from '#/components/pagination/index.vue'
import CommonTeleportNav from '#/components/teleport/nav.vue'
import CommonTeleportFooter from '#/components/teleport/footer.vue'
import { useSearchFormTable } from '#/utils/search'
import { leachFormatter, hmdhmsFormatter } from '#/utils/formatter'
import { noTransferDblClick } from '#/utils/message'
const { t } = useI18n()
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<Partial<AdminUserLoginLogPageParams>>({
	username: '',
	email: '',
	startLoginTime: undefined,
	endLoginTime: undefined,
	deviceType: undefined,
	deviceCode: '',
	ip: '',
})

const {
	adminUserLoginLogDeviceTypeList,
	adminUserLoginLogDeviceTypeFormatter,
} = useAdminUserLoginLogDeviceType()
const { adminUserLoginLogStatusFormatter } = useAdminUserLoginLogStatus()

const {
	search,
	searchLoading,
	reset,
	refreshLoading,
	dataList,
	pageInfo,
	loading,
} = useSearchFormTable(formRef, formModel, adminUserLoginLogPage)

const disableStartDate = (date: DatePickerModel) => {
	return (
		formModel.endLoginTime != null &&
		date.timestamp > formModel.endLoginTime
	)
}
const disableEndDate = (date: DatePickerModel) => {
	return (
		formModel.startLoginTime != null &&
		date.timestamp < formModel.startLoginTime
	)
}
onMounted(() => {
	search()
})
</script>
<style scoped lang="scss">
.backend-login-log {
	height: 100%;
	min-height: 0;
	overflow: hidden;
}
</style>
