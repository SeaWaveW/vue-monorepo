<template>
	<div v-loading="loading" class="backend-ip-manage">
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
					v-power="ADMIN_IP_WHITE_CREATE"
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
							:maxlength="ADMIN_IP_WHITE_IP_MAX_LENGTH"
							@keyup.enter="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="status">
						<SacoSelect
							v-model="formModel.status"
							:placeholder="t('available_status')"
							:data="adminIpWhiteStatusList"
							:clearable="true"
							:filterable="true"
							@change="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="remark">
						<SacoInput
							v-model="formModel.remark"
							:placeholder="t('remark')"
							:maxlength="ADMIN_IP_WHITE_REMARK_MAX_LENGTH"
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
				width="502px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('available_status')"
				prop="status"
				width="315px"
			>
				<template #default="{ row }: { row: TableRow }">
					<SacoText :type="adminIpWhiteStatusType[row.status]">
						{{ adminIpWhiteStatusFormatter(row.status) }}
					</SacoText>
				</template>
			</SacoTableColumn>
			<SacoTableColumn
				:label="t('create_user')"
				prop="createUserName"
				width="298px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('creation_time')"
				prop="createTime"
				:formatter="hmdhmsFormatter"
				width="296px"
			/>
			<SacoTableColumn :label="t('remark')" prop="remark" width="487px">
				<template #default="{ row }">
					<CommonRemarkInput
						:row="row"
						:handle-save="handleSaveRemark"
						:api-path="ADMIN_IP_WHITE_UPDATE_REMARK"
						:maxlength="ADMIN_IP_WHITE_REMARK_MAX_LENGTH"
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
<script lang="ts" setup name="BackendIpManage">
import CommonRemarkInput from '#/components/remark-input/index.vue'
import CommonPagination from '#/components/pagination/index.vue'
import CommonTeleportNav from '#/components/teleport/nav.vue'
import CommonTeleportFooter from '#/components/teleport/footer.vue'
import { useSameChannel } from '#/utils/broadcast'
import { useSearchFormTable } from '#/utils/search'
import { leachFormatter, hmdhmsFormatter } from '#/utils/formatter'
const { t } = useI18n()
const currentPath = '/backend-ip-manage'
const router = useRouter()
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<AdminIpWhitePageParams>({
	ip: '',
	status: undefined,
	remark: '',
})

const { adminIpWhiteStatusList, adminIpWhiteStatusFormatter } =
	useAdminIpWhiteStatus()

const {
	search,
	searchLoading,
	reset,
	refresh,
	refreshLoading,
	dataList,
	pageInfo,
	loading,
} = useSearchFormTable(formRef, formModel, adminIpWhitePage)
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
	adminIpWhiteUpdateRemark({
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
.backend-ip-manage {
	height: 100%;
	min-height: 0;
	overflow: hidden;
}
</style>
