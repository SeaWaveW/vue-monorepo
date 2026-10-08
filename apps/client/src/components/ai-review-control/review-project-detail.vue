<template>
	<SacoDialog
		v-model="modelValue"
		:title="t('control_review_detail')"
		width="41.35%"
		append-to-body
		:close-on-click-modal="false"
	>
		<SacoForm label-position="top" label-suffix="：">
			<SacoFormItem :label="t('item_name')">
				{{ leachFormatter(props.reviewItem?.name) }}
			</SacoFormItem>
			<SacoFormItem :label="t('review_record_name')">
				{{ leachFormatter(props.reviewItem?.detail) }}
			</SacoFormItem>
		</SacoForm>
		<template #footer>
			<SacoButton type="primary" @click="modelValue = false">
				{{ t('close') }}
			</SacoButton>
		</template>
	</SacoDialog>
</template>
<script lang="ts" setup name="AiReviewControlReviewProjectDetail">
import { leachFormatter } from '#/utils/formatter'

const { t } = useI18n()
const props = defineProps<{
	reviewItem: ReviewAgentChecklistRecord | null
}>()
const modelValue = defineModel<boolean>('modelValue', {
	default: false,
})
</script>
