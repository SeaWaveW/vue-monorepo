<template>
	<CommonTeleportDialog
		v-model="modelValue"
		:title="t('select_dynamic_form')"
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
		<template #bottom>
			<SacoForm ref="formRef" :model="formModel">
				<SacoFormItem prop="name">
					<SacoInput
						v-model="formModel.name"
						:placeholder="t('dynamic_form_name')"
						:maxlength="DYNAMIC_FORM_NAME_MAX_LENGTH"
						@keyup.enter="search"
					/>
				</SacoFormItem>
				<SacoFormItem prop="status">
					<SacoSelect
						v-model="formModel.status"
						:placeholder="t('available_status')"
						:data="dynamicFormStatusList"
						:clearable="true"
						:filterable="true"
						@change="search"
					/>
				</SacoFormItem>
				<SacoFormItem prop="formTypeId">
					<SacoSelect
						v-model="formModel.formTypeId"
						:placeholder="t('type')"
						:data="formTypeList"
						field-label="name"
						field-value="id"
						:loading="formTypeLoading"
						:loading-text="t('fetching')"
						:clearable="true"
						:filterable="true"
						@change="search"
					/>
				</SacoFormItem>
				<SacoFormItem prop="remark">
					<SacoInput
						v-model="formModel.remark"
						:placeholder="t('remark')"
						:maxlength="DYNAMIC_FORM_REMARK_MAX_LENGTH"
						@keyup.enter="search"
					/>
				</SacoFormItem>
			</SacoForm>
		</template>
		<div v-loading="loading" class="select-dynamic-form">
			<SacoTable
				height="100%"
				:data="dataList"
				@row-dblclick="noTransferDblClick"
			>
				<SacoTableColumn
					:label="t('dynamic_form_name')"
					prop="name"
					width="512px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('available_status')"
					prop="status"
					width="191px"
				>
					<template #default="{ row }: { row: TableRow }">
						<SacoText :type="dynamicFormStatusType[row.status]">
							{{ dynamicFormStatusFormatter(row.status) }}
						</SacoText>
					</template>
				</SacoTableColumn>
				<SacoTableColumn
					:label="t('type')"
					prop="formTypeName"
					width="298px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('remark')"
					prop="remark"
					width="621px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn :label="t('operation')" width="115px">
					<template #default="{ row }: { row: TableRow }">
						<SacoText type="primary" @click="handleSelect(row)">
							{{ t('choice') }}
						</SacoText>
					</template>
				</SacoTableColumn>
			</SacoTable>
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
<script lang="ts" setup name="SelectDynamicForm">
import CommonPagination from '#/components/pagination/index.vue'
import CommonTeleportDialog from '#/components/teleport/dialog.vue'
import { useSearchFormTable } from '#/utils/search'
import { noTransferDblClick } from '#/utils/message'
import { leachFormatter } from '#/utils/formatter'
import { useTableSelection } from '#/utils/table-selection'
import { useFormTypeOptions } from '@/utils/form-type'

const { t } = useI18n()
const emit = defineEmits<{
	select: [row: DynamicFormPageRecord]
}>()
const modelValue = defineModel<boolean>('modelValue', {
	default: false,
})
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<DynamicFormPageParams>({
	name: '',
	status: undefined,
	formTypeId: undefined,
	remark: '',
})
const { dynamicFormStatusList, dynamicFormStatusFormatter } =
	useDynamicFormStatus()
const { formTypeList, formTypeLoading, loadFormTypeList } = useFormTypeOptions()
const {
	search,
	searchLoading,
	reset,
	refreshLoading,
	dataList,
	pageInfo,
	refresh,
	loading,
} = useSearchFormTable(formRef, formModel, dynamicFormPage)
type TableRow = (typeof dataList.value)[number]
watch(modelValue, (visible) => {
	if (!visible) return
	loadFormTypeList()
	// 与 select-function 的 useTableSelection(..., modelValue, refresh) 同一条：打开后 nextTick 再 refresh
	nextTick(() => {
		refresh()
	})
})
const handleSelect = (row: TableRow) => {
	emit('select', row)
	modelValue.value = false
}
</script>
<style scoped lang="scss">
.select-dynamic-form {
	flex: 1;
	width: 100%;
	height: 100%;
	min-height: 0;

	.saco-text {
		cursor: pointer;
	}
}
</style>
