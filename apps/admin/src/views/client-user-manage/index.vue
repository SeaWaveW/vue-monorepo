<template>
	<div v-loading="loading" class="client-user-manage">
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
					v-power="CLIENT_USER_CREATE"
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
					<SacoFormItem prop="phone">
						<SacoInput
							v-model="formModel.phone"
							:placeholder="t('mobile_phone')"
							:maxlength="CLIENT_USER_PHONE_MAX_LENGTH"
							@keyup.enter="search"
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
					<SacoFormItem prop="tenantId">
						<SacoSelect
							v-model="formModel.tenantId"
							:placeholder="t('client_subject')"
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
							:maxlength="CLIENT_USER_REMARK_MAX_LENGTH"
							@keyup.enter="search"
						/>
					</SacoFormItem>
				</SacoForm>
			</template>
		</CommonTeleportNav>
		<SacoTable :data="dataList" @row-dblclick="handleRowDblclick">
			<SacoTableColumn
				:label="t('username')"
				prop="username"
				width="338px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('available_status')"
				prop="status"
				width="183px"
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
				width="298px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('mobile_phone_number')"
				prop="phone"
				width="270px"
				:formatter="phoneFormatter"
			/>
			<SacoTableColumn
				:label="t('client_subject')"
				prop="tenantName"
				width="373px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn :label="t('remark')" prop="remark" width="436px">
				<template #default="{ row }">
					<CommonRemarkInput
						:row="row"
						:handle-save="handleSaveRemark"
						:api-path="CLIENT_USER_UPDATE_REMARK"
						:maxlength="CLIENT_USER_REMARK_MAX_LENGTH"
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
<script lang="ts" setup name="ClientUserManage">
import CommonRemarkInput from '#/components/remark-input/index.vue'
import CommonPagination from '#/components/pagination/index.vue'
import CommonTeleportNav from '#/components/teleport/nav.vue'
import CommonTeleportFooter from '#/components/teleport/footer.vue'
import { useSameChannel } from '#/utils/broadcast'
import { useSearchFormTable } from '#/utils/search'
import { leachFormatter, phoneFormatter } from '#/utils/formatter'
const { t } = useI18n()
const currentPath = '/client-user-manage'
const router = useRouter()
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<ClientUserPageParams>({
	username: '',
	tenantId: undefined,
	status: undefined,
	phone: '',
	email: '',
	remark: '',
})

const { clientUserStatusList, clientUserStatusFormatter } =
	useClientUserStatus()
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
} = useSearchFormTable(formRef, formModel, clientUserPage)
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
	clientUserUpdateRemark({
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
.client-user-manage {
	height: 100%;
	min-height: 0;
	overflow: hidden;
}
</style>
