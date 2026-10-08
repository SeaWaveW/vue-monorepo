<template>
	<div v-loading="loading" class="ai-review-record-manage">
		<CommonTeleportNav refresh expand :model="formModel">
			<template #top>
				<SacoButton
					icon="md-refresh"
					:loading="refreshLoading"
					:disabled="searchLoading || feedbackLoading"
					@click="reset"
				>
					{{ t('reset') }}
				</SacoButton>
				<SacoButton
					icon="mb-search"
					type="primary"
					:loading="searchLoading"
					:disabled="refreshLoading || feedbackLoading"
					data-search
					@click="search"
				>
					{{ t('search') }}
				</SacoButton>
			</template>
			<template #bottom>
				<SacoForm
					ref="formRef"
					:model="formModel"
					:disabled="feedbackLoading"
				>
					<SacoFormItem prop="reviewRecordIdentifier">
						<SacoInput
							v-model="formModel.reviewRecordIdentifier"
							:placeholder="t('control_review_id')"
							:maxlength="
								REVIEW_RECORD_REVIEW_RECORD_IDENTIFIER_MAX_LENGTH
							"
							@keyup.enter="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="reviewStatus">
						<SacoSelect
							v-model="formModel.reviewStatus"
							:placeholder="t('review_status')"
							:data="reviewRecordReviewStatusList"
							:clearable="true"
							:filterable="true"
							@change="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="username">
						<SacoInput
							v-model="formModel.username"
							:placeholder="t('user_name')"
							:maxlength="REVIEW_RECORD_USERNAME_MAX_LENGTH"
							@keyup.enter="search"
						/>
					</SacoFormItem>
				</SacoForm>
			</template>
		</CommonTeleportNav>
		<SacoTable :data="dataList" @row-dblclick="handleRowDblclick">
			<SacoTableColumn
				:label="t('control_review_id')"
				prop="reviewRecordIdentifier"
				width="399px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('review_status')"
				prop="reviewStatus"
				width="174px"
			>
				<template #default="{ row }: { row: TableRow }">
					<SacoText
						:type="reviewRecordReviewStatusType[row.reviewStatus!]"
					>
						{{
							reviewRecordReviewStatusFormatter(row.reviewStatus)
						}}
					</SacoText>
				</template>
			</SacoTableColumn>
			<SacoTableColumn
				:label="t('model_call_count')"
				prop="modelCallCount"
				width="211px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('total_token_usage')"
				prop="totalTokenUsage"
				width="211px"
				:formatter="compactNumberFormatter"
			/>
			<SacoTableColumn
				:label="t('review_duration')"
				prop="reviewDuration"
				width="182px"
				:formatter="reviewDurationFormatter"
			/>
			<SacoTableColumn
				:label="t('exception_count')"
				prop="exceptionCount"
				width="172px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('user_name')"
				prop="username"
				width="184px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('unmet_expectation_feedback')"
				prop="unmetExpectationFeedback"
				width="369px"
			>
				<template #default="{ row }">
					<CommonRemarkInput
						:row="row"
						field="unmetExpectationFeedback"
						:handle-save="handleSaveFeedback"
						:api-path="
							REVIEW_RECORD_UPDATE_UNMET_EXPECTATION_FEEDBACK
						"
						:maxlength="
							REVIEW_RECORD_UNMET_EXPECTATION_FEEDBACK_MAX_LENGTH
						"
						:placeholder="t('unmet_expectation_feedback')"
					/>
				</template>
			</SacoTableColumn>
		</SacoTable>
		<CommonTeleportFooter>
			<CommonPagination
				v-model:current-page="pageInfo.pageNum"
				v-model:page-size="pageInfo.pageSize"
				:disabled="loading || feedbackLoading"
				:total="pageInfo.total"
				@change="search"
			/>
		</CommonTeleportFooter>
	</div>
</template>
<script lang="ts" setup name="AiReviewRecordManage">
import CommonRemarkInput from '#/components/remark-input/index.vue'
import CommonPagination from '#/components/pagination/index.vue'
import CommonTeleportNav from '#/components/teleport/nav.vue'
import CommonTeleportFooter from '#/components/teleport/footer.vue'
import { useSameChannel } from '#/utils/broadcast'
import { useSearchFormTable } from '#/utils/search'
import {
	leachFormatter,
	reviewDurationFormatter,
	compactNumberFormatter,
} from '#/utils/formatter'
const { t } = useI18n()
const currentPath = '/ai-review-record-manage'
const router = useRouter()
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<ReviewRecordPageParams>({
	reviewRecordIdentifier: '',
	reviewStatus: undefined,
	username: '',
})
const { reviewRecordReviewStatusList, reviewRecordReviewStatusFormatter } =
	useReviewRecordReviewStatus()

const {
	search,
	searchLoading,
	reset,
	refresh,
	refreshLoading,
	dataList,
	pageInfo,
	loading,
} = useSearchFormTable(formRef, formModel, reviewRecordPage)
type TableRow = (typeof dataList.value)[number]
onMounted(() => {
	search()
})

const handleRowDblclick = (row: TableRow) => {
	if (row.isEdit) return
	router.push(`${currentPath}/detail/${row.id}`)
}

const feedbackLoading = ref(false)
const handleSaveFeedback = (row: TableRow) => {
	if (row.editLoading || feedbackLoading.value) return
	row.editLoading = true
	feedbackLoading.value = true
	reviewRecordUpdateUnmetExpectationFeedback({
		id: row.id,
		unmetExpectationFeedback: row.unmetExpectationFeedback,
	})
		.then(() => {
			row.isEdit = false
			SacoMessage.success(t('modified_successfully'))
			refresh()
		})
		.finally(() => {
			row.editLoading = false
			feedbackLoading.value = false
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
.ai-review-record-manage {
	height: 100%;
	min-height: 0;
	overflow: hidden;
}
</style>
