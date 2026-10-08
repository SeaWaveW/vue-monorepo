<template>
	<div v-loading="loading" class="client-operation-audit">
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
					<SacoFormItem prop="entity">
						<SacoInput
							v-model="formModel.entity"
							:placeholder="t('entity')"
							:maxlength="CLIENT_OPERATION_LOG_ENTITY_MAX_LENGTH"
							@keyup.enter="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="operation">
						<SacoInput
							v-model="formModel.operation"
							:placeholder="t('operation')"
							:maxlength="
								CLIENT_OPERATION_LOG_OPERATION_MAX_LENGTH
							"
							@keyup.enter="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="extraInfo">
						<SacoInput
							v-model="formModel.extraInfo"
							:placeholder="t('other_key_information')"
							:maxlength="
								CLIENT_OPERATION_LOG_EXTRA_INFO_MAX_LENGTH
							"
							@keyup.enter="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="username">
						<SacoInput
							v-model="formModel.username"
							:placeholder="t('operator_user')"
							:maxlength="
								CLIENT_OPERATION_LOG_USERNAME_MAX_LENGTH
							"
							@keyup.enter="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="email">
						<SacoInput
							v-model="formModel.email"
							:placeholder="t('account')"
							:maxlength="CLIENT_OPERATION_LOG_EMAIL_MAX_LENGTH"
							@keyup.enter="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="startOperationTime">
						<SacoDatePicker
							v-model="formModel.startOperationTime"
							type="date"
							value-format="timestamp"
							:placeholder="t('start_operation_time')"
							:disabled-date="disableStartDate"
							@change="search"
							@clear="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="endOperationTime">
						<SacoDatePicker
							v-model="formModel.endOperationTime"
							type="date"
							value-format="timestamp-end"
							:placeholder="t('end_operation_time')"
							:disabled-date="disableEndDate"
							@change="search"
							@clear="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="deviceType">
						<SacoSelect
							v-model="formModel.deviceType"
							:placeholder="t('device_type')"
							:data="clientOperationLogDeviceTypeList"
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
								CLIENT_OPERATION_LOG_DEVICE_CODE_MAX_LENGTH
							"
							@keyup.enter="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="ip">
						<SacoInput
							v-model="formModel.ip"
							:placeholder="t('ip')"
							:maxlength="CLIENT_OPERATION_LOG_IP_MAX_LENGTH"
							@keyup.enter="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="tenantId">
						<SacoSelect
							v-model="formModel.tenantId"
							:placeholder="t('client')"
							:data="tenantList"
							field-label="name"
							field-value="id"
							:loading="tenantLoading"
							:loading-text="t('fetching')"
							:clearable="true"
							:filterable="true"
							@change="search"
						/>
					</SacoFormItem>
				</SacoForm>
			</template>
		</CommonTeleportNav>
		<SacoTable :data="dataList" @row-dblclick="noTransferDblClick">
			>
			<SacoTableColumn
				:label="t('entity')"
				prop="entity"
				width="253px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('operation')"
				prop="operation"
				width="150px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('other_key_information')"
				prop="extraInfo"
				width="214px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('operator_user')"
				prop="username"
				width="153px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('account')"
				prop="email"
				width="204px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('operator_time')"
				prop="operationTime"
				width="198px"
				:formatter="hmdhmsFormatter"
			/>
			<SacoTableColumn
				:label="t('device_type')"
				prop="deviceType"
				width="127px"
				:formatter="clientOperationLogDeviceTypeFormatter"
			/>
			<SacoTableColumn
				:label="t('machine_code')"
				prop="deviceCode"
				width="199px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('ip')"
				prop="ip"
				width="154px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('client_subject')"
				prop="tenantName"
				width="250px"
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
<script lang="ts" setup name="ClientOperationAudit">
import CommonPagination from '#/components/pagination/index.vue'
import CommonTeleportNav from '#/components/teleport/nav.vue'
import CommonTeleportFooter from '#/components/teleport/footer.vue'
import { useSearchFormTable } from '#/utils/search'
import { leachFormatter, hmdhmsFormatter } from '#/utils/formatter'
import { noTransferDblClick } from '#/utils/message'
const { t } = useI18n()
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<Partial<ClientOperationLogPageParams>>({
	entity: '',
	operation: '',
	extraInfo: '',
	username: '',
	tenantId: undefined,
	email: '',
	startOperationTime: undefined,
	endOperationTime: undefined,
	deviceType: undefined,
	deviceCode: '',
	ip: '',
})
const { tenantList, tenantLoading, loadTenantList } = useClientTenantOptions()

const {
	clientOperationLogDeviceTypeList,
	clientOperationLogDeviceTypeFormatter,
} = useClientOperationLogDeviceType()

const {
	search,
	searchLoading,
	reset,
	refreshLoading,
	dataList,
	pageInfo,
	loading,
} = useSearchFormTable(formRef, formModel, clientOperationLogPage)

const disableStartDate = (date: DatePickerModel) => {
	return (
		formModel.endOperationTime != null &&
		date.timestamp > formModel.endOperationTime
	)
}
const disableEndDate = (date: DatePickerModel) => {
	return (
		formModel.startOperationTime != null &&
		date.timestamp < formModel.startOperationTime
	)
}
onMounted(() => {
	loadTenantList()
	search()
})
</script>
<style scoped lang="scss">
.client-operation-audit {
	height: 100%;
	min-height: 0;
	overflow: hidden;
}
</style>
