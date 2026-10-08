<template>
	<div v-loading="loading" class="client-subject-manage">
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
					v-power="CLIENT_TENANT_CREATE"
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
					<SacoFormItem prop="address">
						<SacoInput
							v-model="formModel.address"
							:placeholder="t('address')"
							:maxlength="CLIENT_TENANT_ADDRESS_MAX_LENGTH"
							@keyup.enter="search"
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
					<SacoFormItem prop="remark">
						<SacoInput
							v-model="formModel.remark"
							:placeholder="t('remark')"
							:maxlength="CLIENT_TENANT_REMARK_MAX_LENGTH"
							@keyup.enter="search"
						/>
					</SacoFormItem>
				</SacoForm>
			</template>
		</CommonTeleportNav>
		<SacoTable :data="dataList" @row-dblclick="handleRowDblclick">
			<SacoTableColumn
				:label="t('client_name')"
				prop="name"
				width="351px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('available_status')"
				prop="status"
				width="191px"
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
				width="483px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('use_effective_time')"
				prop="validUntil"
				width="190px"
				:formatter="ymdFormatter"
			/>
			<SacoTableColumn
				:label="t('subject_type')"
				prop="type"
				width="190px"
				:formatter="clientTenantTypeFormatter"
			/>
			<SacoTableColumn :label="t('remark')" prop="remark" width="491px">
				<template #default="{ row }">
					<CommonRemarkInput
						:row="row"
						:handle-save="handleSaveRemark"
						:api-path="CLIENT_TENANT_UPDATE_REMARK"
						:maxlength="CLIENT_TENANT_REMARK_MAX_LENGTH"
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
	</div>
</template>
<script lang="ts" setup name="ClientSubjectManage">
import CommonRemarkInput from '#/components/remark-input/index.vue'
import CommonPagination from '#/components/pagination/index.vue'
import CommonTeleportNav from '#/components/teleport/nav.vue'
import CommonTeleportFooter from '#/components/teleport/footer.vue'
import { useSameChannel } from '#/utils/broadcast'
import { useSearchFormTable } from '#/utils/search'
import { leachFormatter, ymdFormatter } from '#/utils/formatter'
const { t } = useI18n()
const currentPath = '/client-subject-manage'
const router = useRouter()
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
	refresh,
	refreshLoading,
	dataList,
	pageInfo,
	loading,
} = useSearchFormTable(formRef, formModel, clientTenantPage)
type TableRow = (typeof dataList.value)[number]
onMounted(() => {
	search()
})

const handleAdd = () => {
	router.push(`${currentPath}/add`)
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
	clientTenantUpdateRemark({
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
.client-subject-manage {
	height: 100%;
	min-height: 0;
	overflow: hidden;
}
</style>
