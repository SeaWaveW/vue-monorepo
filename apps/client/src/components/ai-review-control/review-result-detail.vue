<template>
	<CommonTeleportDialog
		v-model="modelValue"
		:title="t('control_review_title')"
		:close-on-press-escape="false"
		:show-back="true"
		:back-function="onComplete"
	>
		<template #right>
			<SacoButton
				icon="antOutline-check-circle"
				data-icon-color="var(--success-color)"
				:loading="submitLoading"
				@click="onComplete"
			>
				{{ t('complete') }}
			</SacoButton>
		</template>
		<div v-loading="loading" class="review-result-detail">
			<SacoCard
				class="execute-card"
				:header="t('control_execute_status')"
			>
				<SacoForm label-position="top" label-suffix="：">
					<SacoFormItem
						:label="t('control_review_id')"
						prop="reviewRecordIdentifier"
					>
						{{ leachFormatter(detailData.reviewRecordIdentifier) }}
					</SacoFormItem>
					<SacoFormItem
						:label="t('control_review_agent')"
						prop="reviewAgentName"
					>
						{{ leachFormatter(detailData.reviewAgentName) }}
					</SacoFormItem>
					<SacoFormItem
						:label="t('review_status')"
						prop="reviewStatus"
					>
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
						:label="t('model_call_count')"
						prop="modelCallCount"
					>
						{{ leachFormatter(detailData.modelCallCount) }}
					</SacoFormItem>
					<SacoFormItem
						:label="t('review_duration')"
						prop="reviewDuration"
					>
						{{ reviewDurationFormatter(detailData.reviewDuration) }}
					</SacoFormItem>
					<SacoFormItem
						:label="t('review_failure_reason')"
						prop="failureMessage"
					>
						{{ leachFormatter(detailData.failureMessage) }}
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
						{{
							compactNumberFormatter(detailData.outputTokenUsage)
						}}
					</SacoFormItem>
				</SacoForm>
			</SacoCard>
			<SacoCard class="result-card" :header="t('control_review_result')">
				<CommonMarkdown :source="detailData.reviewResult" />
			</SacoCard>
			<div class="info-wrap">
				<SacoCard
					class="order-card"
					:header="t('control_artificial_list')"
				>
					<SacoCheckboxGroup
						v-if="checkList.length"
						v-model="checkedIds"
						direction="vertical"
						:disabled="isReviewFailed"
						:class="{ 'is-failed': isReviewFailed }"
					>
						<SacoCheckbox
							v-for="(item, index) in checkList"
							:key="item.id"
							:value="item.id"
						>
							<label>
								{{
									t('control_list_item', [
										index + 1,
										item.name,
									])
								}}
							</label>
							<SacoSvg
								class="order-card__help"
								name="antOutline-question-circle"
								@click.stop.prevent="onOpenItem(item)"
							/>
						</SacoCheckbox>
					</SacoCheckboxGroup>
					<div v-else class="saco-table">
						<div class="saco-table__empty">
							{{ t('no_data') }}
							<SacoSvg
								class="saco-table__empty-icon"
								name="arcoDesign-empty"
							/>
						</div>
					</div>
				</SacoCard>
				<SacoCard
					class="remark-card"
					:header="t('control_review_feedback')"
				>
					<p class="remark-tips">
						{{ t('control_review_fdtips') }}
					</p>
					<SacoTextarea
						v-model="feedback"
						:max-length="
							REVIEW_RECORD_UNMET_EXPECTATION_FEEDBACK_MAX_LENGTH
						"
						:auto-resize="false"
						:placeholder="t('control_review_feedback')"
					/>
				</SacoCard>
			</div>
		</div>
		<ReviewProjectDetail v-model="itemVisible" :review-item="reviewItem" />
	</CommonTeleportDialog>
</template>
<script lang="ts" setup name="AiReviewControlReviewResultDetail">
import CommonMarkdown from '#/components/markdown/index.vue'
import CommonTeleportDialog from '#/components/teleport/dialog.vue'
import {
	leachFormatter,
	reviewDurationFormatter,
	compactNumberFormatter,
} from '#/utils/formatter'
import type { ComponentItem } from '#/dynamic'
import { findAgent } from '@/hooks/ai-review-control/agent'
import { ensureAgent } from '@/hooks/ai-review-control/agent'
import ReviewProjectDetail from './review-project-detail.vue'

const props = defineProps<{
	id?: number
}>()
const modelValue = defineModel<boolean>('modelValue', {
	default: false,
})
const { t } = useI18n()
const { reviewRecordReviewStatusFormatter } = useReviewRecordReviewStatus()

const loading = ref(false)
const submitLoading = ref(false)
const detailData = reactive({} as ReviewRecordDetailResponse)
const checkList = ref<ReviewAgentChecklistRecord[]>([])
const checkedIds = ref<CheckboxValueType[]>([])
const itemVisible = ref(false)
const reviewItem = ref<ReviewAgentChecklistRecord | null>(null)
const feedback = ref('')

const isReviewFailed = computed(() => {
	return detailData.reviewStatus === ReviewRecordReviewStatus.Fail
})

const resetState = () => {
	Object.assign(detailData, {} as ReviewRecordDetailResponse)
	checkList.value = []
	checkedIds.value = []
	itemVisible.value = false
	reviewItem.value = null
	feedback.value = ''
}

interface AgentDetailReadySource {
	components: ComponentItem[]
	aiReviewChecklists: ReviewAgentChecklistRecord[]
	manualReviewChecklists: ReviewAgentChecklistRecord[]
}

/** 详情已经进过列表：有组件或任一侧清单，空清单也算加载过 */
const isAgentDetailReady = (
	agent?: AgentDetailReadySource,
): agent is AgentDetailReadySource => {
	if (!agent) {
		return false
	}
	return (
		agent.components.length > 0 ||
		agent.aiReviewChecklists.length > 0 ||
		agent.manualReviewChecklists.length > 0
	)
}

/** 按本条记录的 Agent 取协同补充清单，不跟当前选中任务走 */
const applyManualCheckList = (agentId?: number) => {
	if (!agentId) {
		checkList.value = []
		return Promise.resolve()
	}
	const apply = (agent: ReturnType<typeof findAgent>) => {
		checkList.value = [...(agent?.manualReviewChecklists ?? [])]
	}
	const cached = findAgent(agentId)
	if (isAgentDetailReady(cached)) {
		apply(cached)
		return Promise.resolve()
	}
	return ensureAgent(agentId).then(() => {
		apply(findAgent(agentId))
	})
}

const getDetail = () => {
	if (!props.id || loading.value) {
		return
	}
	loading.value = true
	reviewRecordDetail(props.id)
		.then((res) => {
			Object.assign(detailData, res.data)
			feedback.value = res.data.unmetExpectationFeedback ?? ''
			return applyManualCheckList(res.data.reviewAgentId)
		})
		.finally(() => {
			loading.value = false
		})
}

const onOpenItem = (item: ReviewAgentChecklistRecord) => {
	reviewItem.value = item
	itemVisible.value = true
}

const onComplete = () => {
	if (submitLoading.value) {
		return
	}
	const allChecked = checkList.value.every((item) => {
		return checkedIds.value.includes(item.id)
	})
	const needCheck = checkList.value.length && !isReviewFailed.value
	if (needCheck && !allChecked) {
		SacoMessageBox({
			title: t('message'),
			message: t('review_not_all_check_message'),
			customClass: 'review-result-message-box',
			confirmButtonText: t('confirm'),
		})
		return
	}
	if (!props.id) {
		return
	}
	submitLoading.value = true
	reviewRecordUpdateUnmetExpectationFeedback({
		id: props.id,
		unmetExpectationFeedback: feedback.value.trim(),
	})
		.then(() => {
			modelValue.value = false
		})
		.finally(() => {
			submitLoading.value = false
		})
}

watch(
	modelValue,
	(visible) => {
		if (!visible) {
			resetState()
			return
		}
		getDetail()
	},
	{ immediate: true },
)
</script>
<style scoped lang="scss">
.review-result-detail {
	display: flex;
	flex: 1;

	$gap-size: var(--common-gap);

	column-gap: $gap-size;
	width: 100%;
	height: 100%;
	min-height: 0;

	--aside-width: 419px;

	:deep(.saco-card) {
		padding: 0 0 calc(#{$gap-size} * 2) !important;
		margin-top: 0 !important;
		background-color: var(--grey-color-20) !important;
		border-radius: 20px !important;

		.saco-card__header {
			padding: calc(var(--common-gap) * 2.2) calc(var(--common-gap) * 2.7)
				calc(var(--common-gap) * 2.4) !important;
			margin-bottom: 0 !important;
			font-size: 20px;
			font-weight: normal;
			color: var(--black-color);
		}

		.saco-card__body {
			padding: 0 calc(var(--common-gap) * 1.8);
		}

		&.result-card {
			.saco-card__body {
				padding: 0 calc(var(--common-gap) * 2.9);
			}
		}
	}

	.execute-card {
		width: var(--aside-width);

		:deep(.saco-form) {
			display: flex;
			flex-direction: column;
			gap: calc(var(--common-gap) * 1.5);
		}
	}

	.result-card {
		flex: 1;
	}

	.info-wrap {
		display: flex;
		flex-direction: column;
		row-gap: $gap-size;
		width: var(--aside-width);
		min-height: 0;

		.order-card,
		.remark-card {
			flex: 1;
			min-height: 0;
			overflow: auto;
		}

		.order-card {
			:deep(.saco-checkbox-group) {
				gap: var(--common-gap);
				width: 100%;

				.saco-checkbox {
					display: flex;
					flex-direction: row-reverse;
					gap: 20px;
					justify-content: space-between;
					width: 100%;

					.saco-checkbox__label {
						display: flex;
						flex: 1;
						align-items: center;
						overflow: hidden;
						font-weight: normal;
						color: var(--black-color);

						label {
							@include line-clamp(1);

							margin-bottom: 0;
						}

						.order-card__help {
							margin-left: calc(var(--common-gap) * 0.4);
							color: var(--grey-color-7);
							transform: translateY(1px);
						}
					}
				}

				&.is-failed {
					.saco-checkbox {
						color: var(--black-color);
						cursor: default;

						.saco-checkbox__input {
							display: none;
						}
					}
				}
			}
		}

		.remark-card {
			display: flex;
			flex-direction: column;
			padding-bottom: 0 !important;

			:deep(.saco-card__body) {
				display: flex;
				flex: 1;
				flex-direction: column;
				min-height: 0;
				padding-bottom: calc(var(--common-gap) * 1.8);
			}

			.remark-tips {
				flex-shrink: 0;
				margin-bottom: calc(var(--common-gap) * 1.5);
				font-size: 16px;
				color: var(--black-color);
			}

			:deep(.saco-textarea) {
				display: flex;
				flex: 1;
				min-height: 0;

				textarea {
					height: 100%;
				}
			}
		}
	}
}
</style>
<style lang="scss">
.review-result-message-box {
	.saco-message-box {
		width: 470px;
	}
}
</style>
