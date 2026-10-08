<template>
	<CommonTeleportDialog
		v-model="modelValue"
		:title="t('select_client')"
		:expand="true"
		:model="formModel"
	>
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
		<template #right>
			<SacoButton
				icon="antOutline-check-circle"
				data-icon-color="var(--success-color)"
				@click="handleComplete"
			>
				{{ t('complete') }}
			</SacoButton>
		</template>
		<template #bottom>
			<SacoForm ref="formRef" :model="formModel">
				<SacoFormItem prop="name">
					<SacoInput
						v-model="formModel.name"
						:placeholder="t('client_name')"
						:maxlength="CLIENT_TENANT_NAME_MAX_LENGTH"
						@keyup.enter="search"
					/>
				</SacoFormItem>
				<SacoFormItem prop="status">
					<SacoSelect
						v-model="formModel.status"
						:placeholder="t('available_status')"
						:data="clientTenantStatusList"
						:clearable="true"
						:filterable="true"
						@change="search"
					/>
				</SacoFormItem>
				<SacoFormItem prop="type">
					<SacoSelect
						v-model="formModel.type"
						:placeholder="t('subject_type')"
						:data="clientTenantTypeList"
						:clearable="true"
						:filterable="true"
						@change="search"
					/>
				</SacoFormItem>
				<SacoFormItem prop="address">
					<SacoInput
						v-model="formModel.address"
						:placeholder="t('address')"
						:maxlength="CLIENT_TENANT_ADDRESS_MAX_LENGTH"
						@keyup.enter="search"
					/>
				</SacoFormItem>
				<!-- <SacoFormItem prop="remark">
					<SacoInput
						v-model="formModel.remark"
						:placeholder="t('remark')"
						:maxlength="CLIENT_TENANT_REMARK_MAX_LENGTH"
						@keyup.enter="search"
					/>
				</SacoFormItem> -->
			</SacoForm>
		</template>
		<div v-loading="loading" class="select-dialog">
			<SacoTable
				ref="tableRef"
				class="select-dialog__table"
				row-key="id"
				height="100%"
				:data="dataList"
				@selection-change="handleSelectionChange"
				@row-dblclick="noTransferDblClick"
			>
				<SacoTableColumn
					:label="t('client_name')"
					prop="name"
					width="365px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('available_status')"
					prop="status"
					width="199px"
				>
					<template #default="{ row }: { row: TableRow }">
						<SacoText :type="clientTenantStatusType[row.status!]">
							{{ clientTenantStatusFormatter(row.status) }}
						</SacoText>
					</template>
				</SacoTableColumn>
				<SacoTableColumn
					:label="t('address')"
					prop="address"
					width="502px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('use_effective_time')"
					prop="validUntil"
					width="198px"
					:formatter="ymdFormatter"
				/>
				<SacoTableColumn
					:label="t('subject_type')"
					prop="type"
					width="198px"
					:formatter="clientTenantTypeFormatter"
				/>
				<SacoTableColumn
					type="selection"
					:reserve-selection="true"
					width="65px"
				/>
			</SacoTable>
			<SacoCard class="select-dialog__selected" :header="t('selected')">
				<div
					v-for="item in tenants"
					:key="item.id"
					class="select-dialog__item"
				>
					<div class="select-dialog__name">{{ item.name }}</div>
					<SacoText type="danger" @click="handleRemove(item)">
						{{ t('remove') }}
					</SacoText>
				</div>
			</SacoCard>
		</div>
		<template #footer>
			<CommonPagination
				v-model:current-page="pageInfo.pageNum"
				v-model:page-size="pageInfo.pageSize"
				:disabled="loading"
				:total="pageInfo.total"
				@change="search"
			/>
		</template>
	</CommonTeleportDialog>
</template>
<script lang="ts" setup name="SelectClient">
import CommonPagination from '#/components/pagination/index.vue'
import CommonTeleportDialog from '#/components/teleport/dialog.vue'
import { useSearchFormTable } from '#/utils/search'
import type { TableSelectionExpose } from '#/utils/table-selection'
import { leachFormatter, ymdFormatter } from '#/utils/formatter'
import { noTransferDblClick } from '#/utils/message'
import { useTableSelection } from '#/utils/table-selection'
const { t } = useI18n()
const tenants = defineModel<ClientTenantPageRecord[]>('tenants', {
	default: () => [],
})
const modelValue = defineModel<boolean>('modelValue', {
	default: false,
})
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<ClientTenantPageParams>({
	name: '',
	status: undefined,
	type: undefined,
	address: '',
	remark: '',
})
const { clientTenantStatusList, clientTenantStatusFormatter } =
	useClientTenantStatus()
const { clientTenantTypeList, clientTenantTypeFormatter } =
	useClientTenantType()
const {
	search,
	searchLoading,
	reset,
	refreshLoading,
	dataList,
	pageInfo,
	refresh,
	loading,
} = useSearchFormTable(formRef, formModel, clientTenantPage)
type TableRow = (typeof dataList.value)[number]
const tableRef = ref<TableSelectionExpose | null>(null)
const { handleSelectionChange, handleRemove } = useTableSelection(
	tenants,
	tableRef,
	modelValue,
	refresh,
)
const handleComplete = () => {
	modelValue.value = false
}
</script>
<style lang="scss" scoped>
@use '../select-dialog.scss';
</style>
