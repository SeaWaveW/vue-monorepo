<template>
	<div
		class="batch-file"
		@click.capture="onGuardBatch"
		@drop.capture="onGuardBatch"
	>
		<DynamicUploadMultiple
			v-model="batchFileFiles"
			:loading="batchLoading"
			light-effect
			:params="batchUploadParams"
			:accept="batchFileAccept"
			:before-upload="onBeforeUpload"
			icon="fa5-folder-open-fas"
			:tips="t('control_batch_upload_tips')"
		/>
	</div>
</template>
<script lang="ts" setup name="AiReviewControlBatchFile">
import {
	AI_REVIEW_CONTROL_KEY,
	type AiReviewControlContext,
} from '@/hooks/ai-review-control/context'
import type { AiReviewUploadSessionParams } from '@/hooks/ai-review-control/types'

const { t } = useI18n()
const { agent, dynamic, data } = inject(
	AI_REVIEW_CONTROL_KEY,
) as AiReviewControlContext

const formKeys = agent.formKeys
const batchUploadParams = computed((): AiReviewUploadSessionParams => ({
	formKeys: formKeys.value,
}))
const batchLoading = dynamic.batchLoading
const { batchFileFiles, batchFileAccept, onBeforeUpload, onGuardBatch } = data
</script>
<style scoped lang="scss">
.batch-file {
	height: 186px;

	:deep(.saco-upload-multiple) {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		background-color: var(--grey-color-21);
		border-radius: 20px;

		.upload-container {
			.saco-upload-multiple__icon {
				font-size: 68px;
				color: var(--info-color);
			}

			p {
				font-size: 16px;
				color: var(--black-color);
				user-select: none;
			}
		}
	}
}
</style>
