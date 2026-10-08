<template>
	<div v-loading="loading" class="client-interface-manage">
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
					v-power="CLIENT_API_CREATE"
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
							:placeholder="t('interface_name')"
							:maxlength="CLIENT_API_NAME_MAX_LENGTH"
							@keyup.enter="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="path">
						<SacoInput
							v-model="formModel.path"
							:placeholder="t('interface_url')"
							:maxlength="CLIENT_API_PATH_MAX_LENGTH"
							@keyup.enter="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="level">
						<SacoSelect
							v-model="formModel.level"
							:placeholder="t('access_level')"
							:data="clientApiLevelList"
							:clearable="true"
							:filterable="true"
							@change="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="remark">
						<SacoInput
							v-model="formModel.remark"
							:placeholder="t('remark')"
							:maxlength="CLIENT_API_REMARK_MAX_LENGTH"
							@keyup.enter="search"
						/>
					</SacoFormItem>
				</SacoForm>
			</template>
		</CommonTeleportNav>
		<SacoTable :data="dataList" @row-dblclick="handleRowDblclick">
			<SacoTableColumn
				:label="t('interface_name')"
				prop="name"
				width="396px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('interface_url')"
				prop="path"
				width="498px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('access_level')"
				prop="level"
				:formatter="clientApiLevelFormatter"
				width="279px"
			/>
			<SacoTableColumn :label="t('remark')" prop="remark" width="723px">
				<template #default="{ row }: { row: TableRow }">
					<CommonRemarkInput
						:row="row"
						:handle-save="handleSaveRemark"
						:api-path="CLIENT_API_UPDATE_REMARK"
						:maxlength="CLIENT_API_REMARK_MAX_LENGTH"
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
<script lang="ts" setup name="ClientInterfaceManage">
import CommonRemarkInput from '#/components/remark-input/index.vue'
import CommonPagination from '#/components/pagination/index.vue'
import CommonTeleportNav from '#/components/teleport/nav.vue'
import CommonTeleportFooter from '#/components/teleport/footer.vue'
import { useSameChannel } from '#/utils/broadcast'
import { useSearchFormTable } from '#/utils/search'
import { leachFormatter } from '#/utils/formatter'
const { t } = useI18n()
const currentPath = '/client-interface-manage'
const router = useRouter()
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<ClientApiPageParams>({
	name: '',
	path: '',
	level: undefined,
	remark: '',
})
const { clientApiLevelList, clientApiLevelFormatter } = useClientApiLevel()

const {
	search,
	searchLoading,
	reset,
	refresh,
	refreshLoading,
	dataList,
	pageInfo,
	loading,
} = useSearchFormTable(formRef, formModel, clientApiPage)
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
	clientApiUpdateRemark({
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
.client-interface-manage {
	height: 100%;
	min-height: 0;
	overflow: hidden;
}
</style>
