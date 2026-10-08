<template>
	<div v-loading="loading" class="review-agent-manage">
		<CommonTeleportNav refresh expand :model="formModel">
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
							:placeholder="t('agent_name')"
							:maxlength="REVIEW_AGENT_NAME_MAX_LENGTH"
							@keyup.enter="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="status">
						<SacoSelect
							v-model="formModel.status"
							:placeholder="t('available_status')"
							:data="reviewAgentStatusList"
							:clearable="true"
							:filterable="true"
							@change="search"
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
				:label="t('available_status')"
				prop="status"
				width="172px"
			>
				<template #default="{ row }: { row: TableRow }">
					<SacoText :type="reviewAgentStatusType[row.status!]">
						{{ reviewAgentStatusFormatter(row.status) }}
					</SacoText>
				</template>
			</SacoTableColumn>
			<SacoTableColumn
				:label="t('skill')"
				prop="skillName"
				width="215px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('dynamic_form')"
				prop="dynamicFormName"
				width="334px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('simple_description')"
				prop="description"
				width="447px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('ai_review_duration')"
				prop="aiReviewDuration"
				width="181px"
				:formatter="reviewDurationFormatter"
			/>
			<SacoTableColumn
				:label="t('manual_review_duration')"
				prop="manualReviewDuration"
				width="181px"
				:formatter="reviewDurationFormatter"
			/>
		</SacoTable>
		<CommonTeleportFooter>
			<CommonPagination
				v-model:current-page="pageInfo.pageNum"
				v-model:page-size="pageInfo.pageSize"
				:disabled="loading"
				:total="pageInfo.total"
				@change="search"
			/>
		</CommonTeleportFooter>
	</div>
</template>
<script lang="ts" setup name="ReviewAgentManage">
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
	status: undefined,
	description: '',
})
const { reviewAgentStatusList, reviewAgentStatusFormatter } =
	useReviewAgentStatus()

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

const handleRowDblclick = (row: TableRow) => {
	router.push(`${currentPath}/detail/${row.id}`)
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
