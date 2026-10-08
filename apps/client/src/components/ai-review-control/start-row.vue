<template>
	<div class="start-row">
		<span v-if="!isStartDisabled" class="start-row__estimate">
			{{ executeParts[0] }}
			<strong>{{ reviewDurationFormatter(averageSeconds) }}</strong>
			{{ executeParts[1] }}
			<strong>{{ reviewDurationFormatter(maxSeconds) }}</strong>
			{{ executeParts[2] }}
		</span>
		<SacoButton
			type="primary"
			icon="if-ui-play"
			:disabled="isStartDisabled"
			@click="onStart"
		>
			{{
				!isStartDisabled
					? t('control_start')
					: t('validate_please_select_any', [t('agent')])
			}}
		</SacoButton>
	</div>
</template>
<script lang="ts" setup name="AiReviewControlStartRow">
import { reviewDurationFormatter } from '#/utils/formatter'
import {
	AI_REVIEW_CONTROL_KEY,
	type AiReviewControlContext,
} from '@/hooks/ai-review-control/context'

const props = defineProps<{
	isUploading?: boolean
}>()
const emit = defineEmits<{
	start: []
}>()

const { t } = useI18n()
const { agent } = inject(AI_REVIEW_CONTROL_KEY) as AiReviewControlContext

const averageSeconds = ref<number>()
const maxSeconds = ref<number>()

const isStartDisabled = computed(() => {
	return !agent.currentAgent.value
})

/** {0}{1} 换成占位符再切开，时长单独加粗，整句不可选中复制 */
const executeParts = computed(() => {
	return t('control_execute', ['\uE000', '\uE001']).split(/[\uE000\uE001]/)
})

watch(
	() => agent.currentAgent.value?.id,
	(agentId) => {
		averageSeconds.value = undefined
		maxSeconds.value = undefined
		if (!agentId) {
			return
		}
		reviewRecordDurationStatistics(agentId).then((res) => {
			const detail = res.data
			const stillCurrent = agent.currentAgent.value?.id === agentId
			if (!detail || !stillCurrent) {
				return
			}
			averageSeconds.value = detail.averageReviewDuration
			maxSeconds.value = detail.maxReviewDuration
		})
	},
	{ immediate: true },
)

const onStart = () => {
	if (props.isUploading) {
		SacoMessage.warning(t('control_wait_file_upload_message'))
		return
	}
	emit('start')
}
</script>
<style scoped lang="scss">
.start-row {
	display: flex;
	gap: calc(var(--common-gap) * 2.1);
	align-items: center;
	justify-content: flex-end;
	color: var(--black-color);

	.start-row__estimate {
		user-select: none;

		strong {
			font-weight: var(--font-bold);
		}
	}
}
</style>
