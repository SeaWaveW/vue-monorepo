<template>
	<div v-loading="loading" class="dynamic-form-manage">
		<CommonTeleportNav refresh expand :model="formModel">
			<template #top>
				<SacoButton
					icon="md-refresh"
					:loading="refreshLoading"
					:disabled="searchLoading || remarkLoading"
					@click="reset"
				>
					{{ t('reset') }}
				</SacoButton>
				<SacoButton
					icon="mb-search"
					type="primary"
					:loading="searchLoading"
					:disabled="refreshLoading || remarkLoading"
					data-search
					@click="search"
				>
					{{ t('search') }}
				</SacoButton>
			</template>
			<template #right>
				<SacoButton
					v-power="DYNAMIC_FORM_CREATE"
					icon="antOutline-plus"
					data-icon-color="var(--primary-color)"
					:disabled="loading || remarkLoading"
					@click="handleAdd"
				>
					{{ t('addition') }}
				</SacoButton>
			</template>
			<template #bottom>
				<SacoForm
					ref="formRef"
					:model="formModel"
					:disabled="remarkLoading"
				>
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
					<SacoFormItem prop="isDraft">
						<SacoSelect
							v-model="formModel.isDraft"
							:placeholder="t('data_status')"
							:data="dynamicFormIsDraftList"
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
		</CommonTeleportNav>
		<SacoTable :data="dataList" @row-dblclick="handleRowDblclick">
			<SacoTableColumn
				:label="t('dynamic_form_name')"
				prop="name"
				width="502px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('available_status')"
				prop="status"
				width="223px"
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
				width="324px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('data_status')"
				prop="isDraft"
				width="219px"
			>
				<template #default="{ row }: { row: TableRow }">
					<SacoText :type="dynamicFormIsDraftType[row.isDraft]">
						{{ dynamicFormIsDraftFormatter(row.isDraft) }}
					</SacoText>
				</template>
			</SacoTableColumn>
			<SacoTableColumn :label="t('remark')" prop="remark" width="627px">
				<template #default="{ row }: { row: TableRow }">
					<CommonRemarkInput
						:row="row"
						:handle-save="handleSaveRemark"
						:api-path="DYNAMIC_FORM_UPDATE_REMARK"
						:maxlength="DYNAMIC_FORM_REMARK_MAX_LENGTH"
					/>
				</template>
			</SacoTableColumn>
		</SacoTable>
		<CommonTeleportFooter>
			<CommonPagination
				v-model:current-page="pageInfo.pageNum"
				v-model:page-size="pageInfo.pageSize"
				:disabled="loading || remarkLoading"
				:total="pageInfo.total"
				@change="search"
			/>
		</CommonTeleportFooter>
		<DynamicFormAddDialog v-model="addVisible" @reload="onAddReload" />
	</div>
</template>
<script lang="ts" setup name="DynamicFormManage">
import CommonRemarkInput from '#/components/remark-input/index.vue'
import CommonPagination from '#/components/pagination/index.vue'
import CommonTeleportNav from '#/components/teleport/nav.vue'
import CommonTeleportFooter from '#/components/teleport/footer.vue'
import { useSameChannel } from '#/utils/broadcast'
import { useSearchFormTable } from '#/utils/search'
import { leachFormatter } from '#/utils/formatter'
import DynamicFormAddDialog from '@/components/dynamic-form-manage/add-dialog.vue'
import { useFormTypeOptions } from '@/utils/form-type'
const { t } = useI18n()
const currentPath = '/dynamic-form-manage'
const router = useRouter()
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<DynamicFormPageParams>({
	name: '',
	status: undefined,
	formTypeId: undefined,
	isDraft: undefined,
	remark: '',
})
const { dynamicFormStatusList, dynamicFormStatusFormatter } =
	useDynamicFormStatus()
const { dynamicFormIsDraftList, dynamicFormIsDraftFormatter } =
	useDynamicFormIsDraft()
const { formTypeList, formTypeLoading, loadFormTypeList } = useFormTypeOptions()
const addVisible = ref(false)

const {
	search,
	searchLoading,
	reset,
	refresh,
	refreshLoading,
	dataList,
	pageInfo,
	loading,
} = useSearchFormTable(formRef, formModel, dynamicFormPage)
type TableRow = (typeof dataList.value)[number]
onMounted(() => {
	loadFormTypeList()
	search()
})

const handleAdd = () => {
	addVisible.value = true
}

const onAddReload = () => {
	pageInfo.pageNum = 1
	refresh()
}

const handleRowDblclick = (row: TableRow) => {
	if (row.isEdit) return
	router.push(`${currentPath}/detail/${row.id}`)
}
const remarkLoading = ref(false)
const handleSaveRemark = (row: TableRow) => {
	if (loading.value || remarkLoading.value || row.editLoading) return
	row.editLoading = true
	remarkLoading.value = true
	dynamicFormUpdateRemark({
		id: row.id,
		remark: row.remark,
	})
		.then(() => {
			row.isEdit = false
			SacoMessage.success(t('remark_modified_successfully'))
			refresh()
		})
		.finally(() => {
			row.editLoading = false
			remarkLoading.value = false
		})
}
const sameChannel = useSameChannel(currentPath)
sameChannel.on((type: 'refresh' | 'reload') => {
	if (type === 'reload') {
		pageInfo.pageNum = 1
	}
	refresh()
})
</script>
<style scoped lang="scss">
.dynamic-form-manage {
	height: 100%;
	min-height: 0;
	overflow: hidden;
}
</style>
