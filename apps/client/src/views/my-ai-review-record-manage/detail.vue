<template>
	<div v-loading="loading" class="my-ai-review-record-manage-detail">
		<CommonTeleportNav>
			<!-- <template v-if="fromControl" #top>
				<SacoButton
					icon="arrow-left"
					data-icon-color="var(--black-color-1)"
					@click="onBack"
				>
					{{ t('back') }}
				</SacoButton>
			</template> -->
			<template #right>
				<SacoButton
					v-power="REVIEW_RECORD_RENAME"
					icon="md-border_color"
					data-icon-color="var(--black-color-1)"
					:disabled="loading || renameLoading"
					@click="onRename"
				>
					{{ t('rename') }}
				</SacoButton>
				<SacoButton
					v-power="REVIEW_RECORD_DELETE"
					icon="riLine-delete-bin-6-line"
					data-icon-color="var(--danger-color)"
					:disabled="loading || renameLoading"
					@click="onDelete"
				>
					{{ t('delete') }}
				</SacoButton>
			</template>
		</CommonTeleportNav>
		<SacoCard :header="t('execution_information')">
			<SacoForm label-position="top" label-suffix="：">
				<SacoFormItem
					:label="t('control_review_id')"
					prop="reviewRecordIdentifier"
				>
					{{ leachFormatter(detailData.reviewRecordIdentifier) }}
				</SacoFormItem>
				<SacoFormItem :label="t('review_status')" prop="reviewStatus">
					<SacoText
						:type="
							reviewRecordReviewStatusType[
								detailData.reviewStatus!
							]
						"
					>
						{{
							reviewRecordReviewStatusFormatter(
								detailData.reviewStatus,
							)
						}}
					</SacoText>
				</SacoFormItem>
				<SacoFormItem
					:label="t('control_review_agent')"
					prop="reviewAgentName"
				>
					{{ leachFormatter(detailData.reviewAgentName) }}
				</SacoFormItem>
				<SacoFormItem
					:label="t('review_duration')"
					prop="reviewDuration"
				>
					{{ reviewDurationFormatter(detailData.reviewDuration) }}
				</SacoFormItem>
				<SacoFormItem
					:label="t('exception_count')"
					prop="exceptionCount"
				>
					{{ leachFormatter(detailData.exceptionCount) }}
				</SacoFormItem>
				<SacoFormItem
					:label="t('input_token_usage')"
					prop="inputTokenUsage"
				>
					{{ compactNumberFormatter(detailData.inputTokenUsage) }}
				</SacoFormItem>
				<SacoFormItem
					:label="t('output_token_usage')"
					prop="outputTokenUsage"
				>
					{{ compactNumberFormatter(detailData.outputTokenUsage) }}
				</SacoFormItem>
				<SacoFormItem
					:label="t('total_token_usage')"
					prop="totalTokenUsage"
				>
					{{ compactNumberFormatter(detailData.totalTokenUsage) }}
				</SacoFormItem>
				<SacoFormItem
					:label="t('model_call_count')"
					prop="modelCallCount"
				>
					{{ leachFormatter(detailData.modelCallCount) }}
				</SacoFormItem>
				<!-- <SacoFormItem
					:label="t('review_failure_reason')"
					prop="failureMessage"
				>
					{{ leachFormatter(detailData.failureMessage) }}
				</SacoFormItem>
				<SacoFormItem
					:label="t('other_related_information')"
					prop="extraInfo"
				>
					{{ leachFormatter(detailData.extraInfo) }}
				</SacoFormItem> -->
				<SacoFormItem
					:label="t('unmet_expectation_feedback')"
					prop="unmetExpectationFeedback"
				>
					{{ leachFormatter(detailData.unmetExpectationFeedback) }}
				</SacoFormItem>
			</SacoForm>
		</SacoCard>
		<SacoCard :header="t('ai_review_result')">
			<CommonMarkdown :source="detailData.reviewResult" />
		</SacoCard>
		<SacoCard :header="t('uploaded_materials')">
			<CommonDynamicPreview
				:components="components"
				:proportion="proportion"
				:data="formData"
			/>
		</SacoCard>
		<SacoCard :header="t('audit_information')">
			<SacoForm label-position="top" label-suffix="：">
				<SacoFormItem :label="t('create_user')" prop="createUserName">
					{{ leachFormatter(detailData.createUserName) }}
				</SacoFormItem>
				<SacoFormItem :label="t('creation_time')" prop="createTime">
					{{ hmdhmsFormatter(detailData.createTime) }}
				</SacoFormItem>
				<SacoFormItem :label="t('modify_user')" prop="editUserName">
					{{ leachFormatter(detailData.editUserName) }}
				</SacoFormItem>
				<SacoFormItem :label="t('modification_time')" prop="editTime">
					{{ hmdhmsFormatter(detailData.editTime) }}
				</SacoFormItem>
			</SacoForm>
		</SacoCard>
	</div>
</template>
<script lang="ts" setup name="MyAiReviewRecordManageDetail">
import CommonDynamicPreview from '#/components/dynamic-preview/index.vue'
import CommonMarkdown from '#/components/markdown/index.vue'
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useSameChannel } from '#/utils/broadcast'
import { getRouterParams } from '#/utils/router'
import {
	leachFormatter,
	hmdhmsFormatter,
	reviewDurationFormatter,
	compactNumberFormatter,
} from '#/utils/formatter'
import { deleteBox } from '#/utils/message'
import { PROPORTION_DEFAULT_SIZE } from '#/utils/proportion'
import { useRouterStore } from '#/store'
const { t } = useI18n()
const route = useRoute()
const routePath = route.path
const routerStore = useRouterStore()
const { id } = getRouterParams<[number]>(['id'])
const parentPath = '/my-ai-review-record-manage'
const sameChannel = useSameChannel(parentPath)
const { reviewRecordReviewStatusFormatter } = useReviewRecordReviewStatus()
const loading = ref(false)
const renameLoading = ref(false)
const detailData = reactive({} as ReviewRecordDetailResponse)

// const fromControl = computed(() => {
// 	return !!routerStore.getParentRoute()?.includes('/ai-review-control')
// })
const components = computed(() => {
	const list = detailData.dynamicForm?.schemaJson?.components
	return Array.isArray(list) ? list : []
})
const proportion = computed(() => {
	return detailData.dynamicForm?.widthLevel ?? PROPORTION_DEFAULT_SIZE
})
const formData = computed(() => {
	return detailData.dynamicFormData?.inputDataJson ?? {}
})

const getDetail = () => {
	if (loading.value) return
	loading.value = true
	reviewRecordDetail(id)
		.then((res) => {
			Object.assign(detailData, res.data)
			routerStore.setCacheValueCode(
				routePath,
				res.data.reviewRecordIdentifier,
			)
		})
		.finally(() => {
			loading.value = false
		})
}

const onRename = () => {
	if (renameLoading.value) return
	SacoMessageBox.prompt('', t('rename'), {
		customClass: 'rename-message-box',
		inputValue: detailData.reviewRecordIdentifier ?? '',
		inputPlaceholder: t('control_review_id'),
		inputValidator: (value) => {
			if (!value?.trim()) {
				return t('validate_please_enter_any', [t('control_review_id')])
			}
			return true
		},
		confirmButtonText: t('confirm'),
		cancelButtonText: t('cancel'),
		closeOnClickModal: false,
	})
		.then((data) => {
			const reviewRecordIdentifier = (data.value ?? '')
				.trim()
				.slice(0, REVIEW_RECORD_REVIEW_RECORD_IDENTIFIER_MAX_LENGTH)
			renameLoading.value = true
			return reviewRecordRename({
				id: detailData.id,
				reviewRecordIdentifier,
			}).then(() => {
				SacoMessage.success(t('rename_successfully'))
				sameChannel.send('refresh')
				getDetail()
			})
		})
		.finally(() => {
			renameLoading.value = false
		})
}

// const onBack = () => {
// 	routerStore.goParentRoute()
// }

const onDelete = () => {
	deleteBox({
		params: detailData.id,
		api: reviewRecordDelete,
	}).then(() => {
		sameChannel.send('refresh')
		routerStore.goParentRoute(parentPath)
	})
}

onMounted(() => {
	getDetail()
})
</script>
<style lang="scss">
.rename-message-box {
	.saco-message-box {
		width: 450px;
	}
}
</style>
