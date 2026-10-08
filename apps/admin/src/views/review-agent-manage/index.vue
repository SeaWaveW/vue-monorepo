<template>
	<div v-loading="loading" class="review-agent-manage">
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
					v-power="REVIEW_AGENT_CREATE"
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
							:placeholder="t('agent_name')"
							:maxlength="REVIEW_AGENT_NAME_MAX_LENGTH"
							@keyup.enter="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="description">
						<SacoInput
							v-model="formModel.description"
							:placeholder="t('simple_description')"
							:maxlength="REVIEW_AGENT_DESCRIPTION_MAX_LENGTH"
							@keyup.enter="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="remark">
						<SacoInput
							v-model="formModel.remark"
							:placeholder="t('remark')"
							:maxlength="REVIEW_AGENT_REMARK_MAX_LENGTH"
							@keyup.enter="search"
						/>
					</SacoFormItem>
				</SacoForm>
			</template>
		</CommonTeleportNav>
		<SacoTable :data="dataList" @row-dblclick="handleRowDblclick">
			<SacoTableColumn
				:label="t('agent_name')"
				prop="name"
				width="368px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('skill')"
				prop="skillName"
				width="239px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('dynamic_form')"
				prop="dynamicFormName"
				width="324px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('simple_description')"
				prop="description"
				width="324px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('ai_review_duration')"
				prop="aiReviewDuration"
				width="159px"
				:formatter="reviewDurationFormatter"
			/>
			<SacoTableColumn
				:label="t('manual_review_duration')"
				prop="manualReviewDuration"
				width="159px"
				:formatter="reviewDurationFormatter"
			/>
			<SacoTableColumn :label="t('remark')" prop="remark" width="337px">
				<template #default="{ row }: { row: TableRow }">
					<CommonRemarkInput
						:row="row"
						:handle-save="handleSaveRemark"
						:api-path="REVIEW_AGENT_UPDATE_REMARK"
						:maxlength="REVIEW_AGENT_REMARK_MAX_LENGTH"
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
<script lang="ts" setup name="ReviewAgentManage">
import CommonRemarkInput from '#/components/remark-input/index.vue'
import CommonPagination from '#/components/pagination/index.vue'
import CommonTeleportNav from '#/components/teleport/nav.vue'
import CommonTeleportFooter from '#/components/teleport/footer.vue'
import { useSameChannel } from '#/utils/broadcast'
import { useSearchFormTable } from '#/utils/search'
import { leachFormatter, reviewDurationFormatter } from '#/utils/formatter'
const { t } = useI18n()
const currentPath = '/review-agent-manage'
const router = useRouter()
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<ReviewAgentPageParams>({
	name: '',
	description: '',
	remark: '',
})

const {
	search,
	searchLoading,
	reset,
	refresh,
	refreshLoading,
	dataList,
	pageInfo,
	loading,
} = useSearchFormTable(formRef, formModel, reviewAgentPage)
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
	reviewAgentUpdateRemark({
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
.review-agent-manage {
	height: 100%;
	min-height: 0;
	overflow: hidden;
}
</style>
