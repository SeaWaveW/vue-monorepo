<template>
	<div v-loading="loading" class="client-user-group-manage">
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
					v-power="CLIENT_USER_GROUP_CREATE"
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
							:placeholder="t('user_group_name')"
							:maxlength="CLIENT_USER_GROUP_NAME_MAX_LENGTH"
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
					<SacoFormItem prop="remark">
						<SacoInput
							v-model="formModel.remark"
							:placeholder="t('remark')"
							:maxlength="CLIENT_USER_GROUP_REMARK_MAX_LENGTH"
							@keyup.enter="search"
						/>
					</SacoFormItem>
				</SacoForm>
			</template>
		</CommonTeleportNav>
		<SacoTable :data="dataList" @row-dblclick="handleRowDblclick">
			<SacoTableColumn
				:label="t('user_group_name')"
				prop="name"
				width="397px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('create_user')"
				prop="createUserName"
				width="263px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('creation_time')"
				prop="createTime"
				width="261px"
				:formatter="hmdhmsFormatter"
			/>
			<SacoTableColumn
				:label="t('client_subject')"
				prop="tenantName"
				width="373px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn :label="t('remark')" prop="remark" width="605px">
				<template #default="{ row }">
					<CommonRemarkInput
						:row="row"
						:handle-save="handleSaveRemark"
						:api-path="CLIENT_USER_GROUP_UPDATE_REMARK"
						:maxlength="CLIENT_USER_GROUP_REMARK_MAX_LENGTH"
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
<script lang="ts" setup name="ClientUserGroupManage">
import CommonRemarkInput from '#/components/remark-input/index.vue'
import CommonPagination from '#/components/pagination/index.vue'
import CommonTeleportNav from '#/components/teleport/nav.vue'
import CommonTeleportFooter from '#/components/teleport/footer.vue'
import { useSameChannel } from '#/utils/broadcast'
import { useSearchFormTable } from '#/utils/search'
import { leachFormatter, hmdhmsFormatter } from '#/utils/formatter'
const { t } = useI18n()
const currentPath = '/client-user-group-manage'
const router = useRouter()
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<ClientUserGroupPageParams>({
	name: '',
	tenantId: undefined,
	remark: '',
})
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
} = useSearchFormTable(formRef, formModel, clientUserGroupPage)
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
	if (row.editLoading || remarkLoading.value) return
	row.editLoading = true
	remarkLoading.value = true
	clientUserGroupUpdateRemark({
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
	row.isEdit = false
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
.client-user-group-manage {
	height: 100%;
	min-height: 0;
	overflow: hidden;
}
</style>
