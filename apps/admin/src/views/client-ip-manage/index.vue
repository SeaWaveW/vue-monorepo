<template>
	<div v-loading="loading" class="client-ip-manage">
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
					v-power="CLIENT_IP_WHITE_CREATE"
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
					<SacoFormItem prop="ip">
						<SacoInput
							v-model="formModel.ip"
							:placeholder="t('ip')"
							:maxlength="CLIENT_IP_WHITE_IP_MAX_LENGTH"
							@keyup.enter="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="status">
						<SacoSelect
							v-model="formModel.status"
							:placeholder="t('available_status')"
							:data="clientIpWhiteStatusList"
							:clearable="true"
							:filterable="true"
							@change="search"
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
					<SacoFormItem prop="remark">
						<SacoInput
							v-model="formModel.remark"
							:placeholder="t('remark')"
							:maxlength="CLIENT_IP_WHITE_REMARK_MAX_LENGTH"
							@keyup.enter="search"
						/>
					</SacoFormItem>
				</SacoForm>
			</template>
		</CommonTeleportNav>
		<SacoTable :data="dataList" @row-dblclick="handleRowDblclick">
			<SacoTableColumn
				:label="t('ip')"
				prop="ip"
				width="375px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('available_status')"
				prop="status"
				width="209px"
			>
				<template #default="{ row }: { row: TableRow }">
					<SacoText :type="clientIpWhiteStatusType[row.status]">
						{{ clientIpWhiteStatusFormatter(row.status) }}
					</SacoText>
				</template>
			</SacoTableColumn>
			<SacoTableColumn
				:label="t('create_user')"
				prop="createUserName"
				width="271px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('creation_time')"
				prop="createTime"
				:formatter="hmdhmsFormatter"
				width="269px"
			/>
			<SacoTableColumn
				:label="t('client_subject')"
				prop="tenantName"
				width="373px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn :label="t('remark')" prop="remark" width="401px">
				<template #default="{ row }">
					<CommonRemarkInput
						:row="row"
						:handle-save="handleSaveRemark"
						:api-path="CLIENT_IP_WHITE_UPDATE_REMARK"
						:maxlength="CLIENT_IP_WHITE_REMARK_MAX_LENGTH"
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
<script lang="ts" setup name="ClientIpManage">
import CommonRemarkInput from '#/components/remark-input/index.vue'
import CommonPagination from '#/components/pagination/index.vue'
import CommonTeleportNav from '#/components/teleport/nav.vue'
import CommonTeleportFooter from '#/components/teleport/footer.vue'
import { useSameChannel } from '#/utils/broadcast'
import { useSearchFormTable } from '#/utils/search'
import { leachFormatter, hmdhmsFormatter } from '#/utils/formatter'
const { t } = useI18n()
const currentPath = '/client-ip-manage'
const router = useRouter()
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<ClientIpWhitePageParams>({
	ip: '',
	tenantId: undefined,
	status: undefined,
	remark: '',
})

const { clientIpWhiteStatusList, clientIpWhiteStatusFormatter } =
	useClientIpWhiteStatus()
const { tenantList, tenantLoading, loadTenantList } = useClientTenantOptions()

const {
	search,
	searchLoading,
	reset,
	refresh,
	refreshLoading,
	dataList,
	pageInfo,
	loading,
} = useSearchFormTable(formRef, formModel, clientIpWhitePage)
type TableRow = (typeof dataList.value)[number]
onMounted(() => {
	loadTenantList()
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
	clientIpWhiteUpdateRemark({
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
	loadTenantList()
	refresh()
})
</script>
<style scoped lang="scss">
.client-ip-manage {
	height: 100%;
	min-height: 0;
	overflow: hidden;
}
</style>
