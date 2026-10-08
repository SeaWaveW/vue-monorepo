<template>
	<CommonTeleportDialog
		v-model="modelValue"
		:title="t('select_user')"
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
				<SacoFormItem prop="username">
					<SacoInput
						v-model="formModel.username"
						:placeholder="t('username')"
						:maxlength="CLIENT_USER_USERNAME_MAX_LENGTH"
						@keyup.enter="search"
					/>
				</SacoFormItem>
				<SacoFormItem prop="status">
					<SacoSelect
						v-model="formModel.status"
						:placeholder="t('available_status')"
						:data="clientUserStatusList"
						:clearable="true"
						:filterable="true"
						@change="search"
					/>
				</SacoFormItem>
				<SacoFormItem prop="email">
					<SacoInput
						v-model="formModel.email"
						:placeholder="t('email')"
						:maxlength="CLIENT_USER_EMAIL_MAX_LENGTH"
						@keyup.enter="search"
					/>
				</SacoFormItem>
				<SacoFormItem prop="phone">
					<SacoInput
						v-model="formModel.phone"
						:placeholder="t('mobile_phone')"
						:maxlength="CLIENT_USER_PHONE_MAX_LENGTH"
						@keyup.enter="search"
					/>
				</SacoFormItem>
				<SacoFormItem prop="remark">
					<SacoInput
						v-model="formModel.remark"
						:placeholder="t('remark')"
						:maxlength="CLIENT_USER_REMARK_MAX_LENGTH"
						@keyup.enter="search"
					/>
				</SacoFormItem>
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
					:label="t('username')"
					prop="username"
					width="280px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('available_status')"
					prop="status"
					width="160px"
				>
					<template #default="{ row }: { row: TableRow }">
						<SacoText :type="clientUserStatusType[row.status]">
							{{ clientUserStatusFormatter(row.status) }}
						</SacoText>
					</template>
				</SacoTableColumn>
				<SacoTableColumn
					:label="t('email')"
					prop="email"
					width="280px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('mobile_phone_number')"
					prop="phone"
					width="220px"
					:formatter="phoneFormatter"
				/>
				<SacoTableColumn
					:label="t('remark')"
					prop="remark"
					width="522px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					type="selection"
					:reserve-selection="true"
					width="65px"
				/>
			</SacoTable>
			<SacoCard class="select-dialog__selected" :header="t('selected')">
				<div
					v-for="item in users"
					:key="item.id"
					class="select-dialog__item"
				>
					<div class="select-dialog__name">{{ item.username }}</div>
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
<script lang="ts" setup name="SelectUser">
import CommonPagination from '#/components/pagination/index.vue'
import CommonTeleportDialog from '#/components/teleport/dialog.vue'
import { useSearchFormTable } from '#/utils/search'
import { leachFormatter, phoneFormatter } from '#/utils/formatter'
import { noTransferDblClick } from '#/utils/message'
import {
	useTableSelection,
	type TableSelectionExpose,
} from '#/utils/table-selection'
const { t } = useI18n()
const users = defineModel<ClientUserPageRecord[]>('users', {
	default: () => [],
})
const modelValue = defineModel<boolean>('modelValue', {
	default: false,
})
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<ClientUserPageParams>({
	username: '',
	status: undefined,
	email: '',
	phone: '',
	remark: '',
})
const { clientUserStatusList, clientUserStatusFormatter } =
	useClientUserStatus()
const {
	search,
	searchLoading,
	reset,
	refreshLoading,
	dataList,
	pageInfo,
	refresh,
	loading,
} = useSearchFormTable(formRef, formModel, clientUserPage)
type TableRow = (typeof dataList.value)[number]
const tableRef = ref<TableSelectionExpose | null>(null)
const { handleSelectionChange, handleRemove } = useTableSelection(
	users,
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
