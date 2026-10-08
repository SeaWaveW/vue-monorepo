<template>
	<div class="ai-review-control-page">
		<TaskList />

		<div class="control-panel">
			<AgentList @before-leave="onAgentBeforeLeave" />

			<AgentForm ref="agentFormRef">
				<template #footer>
					<BatchFile />

					<StartRow :is-uploading="isAnyUploading" @start="onStart" />
				</template>
			</AgentForm>
		</div>

		<ReviewPanel />

		<ReviewDialog
			v-model="reviewVisible"
			:data="reviewData"
			:task-id="reviewTaskId"
			:agent-id="reviewAgentId"
			@complete="onComplete"
		/>

		<ReviewResultDetail
			v-if="resultVisible"
			:id="resultId"
			v-model="resultVisible"
		/>
	</div>
</template>

<script lang="ts" setup name="AiReviewControl">
import TaskList from '@/components/ai-review-control/task-list.vue'
import AgentList from '@/components/ai-review-control/agent-list.vue'
import AgentForm from '@/components/ai-review-control/agent-form.vue'
import BatchFile from '@/components/ai-review-control/batch-file.vue'
import StartRow from '@/components/ai-review-control/start-row.vue'
import ReviewPanel from '@/components/ai-review-control/review-panel.vue'
import ReviewDialog from '@/components/ai-review-control/review-dialog/index.vue'
import ReviewResultDetail from '@/components/ai-review-control/review-result-detail.vue'
import { useAgent } from '@/hooks/ai-review-control/agent'
import {
	AI_REVIEW_CONTROL_KEY,
	type AiReviewControlContext,
} from '@/hooks/ai-review-control/context'
import { useData } from '@/hooks/ai-review-control/data'
import { useDynamic } from '@/hooks/ai-review-control/dynamic'
import { useTask } from '@/hooks/ai-review-control/task'

const task = useTask()
const agent = useAgent({
	taskId: task.taskId,
	agentId: task.agentId,
})
const dynamic = useDynamic({
	formKeys: agent.formKeys,
	currentAgent: agent.currentAgent,
})
const data = useData({
	formKeys: agent.formKeys,
	currentAgent: agent.currentAgent,
	dynamic,
})

provide(AI_REVIEW_CONTROL_KEY, {
	task,
	agent,
	dynamic,
	data,
} satisfies AiReviewControlContext)

const isAnyUploading = dynamic.isAnyUploading

const agentFormRef = ref<InstanceType<typeof AgentForm> | null>(null)

const reviewVisible = ref(false)

const reviewData = ref<ReviewRecordCreateData>()

/** 点开审核弹窗时锁定的任务 / Agent，避免校验通过后用户已切 tab */

const reviewTaskId = ref('')

const reviewAgentId = ref(0)

const resultVisible = ref(false)

const resultId = ref(0)

const onAgentBeforeLeave = () => {
	agentFormRef.value?.beginSilentWrite()
}

const onStart = () => {
	const startTaskId = task.taskId.value

	const startAgentId = task.agentId.value

	const startFormKeys = agent.formKeys.value

	agentFormRef.value?.validate((valid) => {
		if (!valid) {
			return
		}

		if (agent.formKeys.value !== startFormKeys) {
			return
		}

		reviewTaskId.value = startTaskId

		reviewAgentId.value = startAgentId

		reviewData.value = data.getSubmitFormData(startFormKeys)

		reviewVisible.value = true
	})
}

/** 详情已结束且弹窗还开着：侧栏已在创建回包时改过；此处只开结果详情 */

const onComplete = (id: number, openDetail = true) => {
	if (!id) {
		return
	}

	if (!openDetail) {
		return
	}

	resultId.value = id

	resultVisible.value = true
}

/** 测平板锥形收起。先钉住当前任务再开窗，才飞到那一行 */
// onMounted(async () => {
// 	await nextTick()
// 	reviewTaskId.value = task.taskId.value
// 	reviewAgentId.value = task.agentId.value
// 	reviewVisible.value = true
// })
</script>

<style scoped lang="scss">
.ai-review-control-page {
	--task-panel-width: 363px;
	--review-panel-width: 367px;

	$column-gap: calc(var(--common-gap) * 2);
	$row-gap: calc(var(--common-gap) * 2);
	$radius: 20px;

	// 顶距算在 content-box 外会把本页撑出滚动盒，三栏内部滚就变成整页滚
	box-sizing: border-box;
	display: flex;
	flex: 1;
	column-gap: 0;
	min-height: 0;
	padding-top: var(--common-gap);
	overflow: hidden;

	:deep(.saco-card) {
		.saco-card__header {
			user-select: none;
		}
	}

	.control-panel {
		display: flex;
		flex: 1;
		flex-direction: column;
		row-gap: $row-gap;

		// 中间栏宽度 = 100% - 任务栏 - 审核栏 - 列间距

		width: calc(
			100%
			- var(--task-panel-width)
			- var(--review-panel-width)
			- var(--common-gap) * 2
		);
		min-width: 0;
		min-height: 0;
		margin-right: $column-gap;

		:deep(.saco-card) {
			padding: 0 0 calc(var(--common-gap) * 2);
			margin-top: 0;
			background-color: var(--grey-color-20) !important;
			border: none !important;
			border-radius: $radius !important;
			box-shadow: 0 0 5px 2px var(--grey-color-11);

			.saco-card__header {
				display: flex;
				align-items: flex-start;
				justify-content: space-between;

				.card-title {
					h2 {
						margin-bottom: calc(var(--common-gap) / 2);
						font-size: 18px;
						color: var(--black-color);
					}

					p {
						font-size: 16px;
						color: var(--grey-color-1);
					}
				}
			}
		}
	}
}
</style>
<style lang="scss" scoped>
// 短边小于 600 的 h5 / app 才收卡片间距。pc、pwa 拉窗口，以及平板，仍用桌面间距
html[data-device-type='h5'],
html[data-device-type='app'] {
	@media (width <= 599px), (height <= 599px) {
		.ai-review-control-page {
			:deep(.saco-card) {
				padding-bottom: var(--common-gap);

				.saco-card__header {
					padding-top: calc(var(--common-gap) * 1.5);
				}
			}

			:deep(.control-panel) {
				row-gap: var(--common-gap);

				.agent-list {
					.saco-card__body {
						--tab-item-height: 65px !important;
					}
				}
			}

			:deep(.batch-file) {
				height: auto;

				.upload-container {
					flex-direction: row;
					padding-top: var(--common-gap);
					padding-bottom: var(--common-gap);
				}
			}
		}
	}
}
</style>
