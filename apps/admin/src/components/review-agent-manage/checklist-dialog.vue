<template>
	<SacoDialog
		v-model="modelValue"
		:title="dialogTitle"
		width="41.35%"
		align-center
		append-to-body
		:close-on-click-modal="false"
	>
		<SacoForm
			ref="formRef"
			:model="formModel"
			:rules="formRules"
			label-position="top"
		>
			<SacoFormItem :label="t('item_name')" prop="name">
				<SacoInput
					v-model="formModel.name"
					:maxlength="REVIEW_AGENT_NAME_MAX_LENGTH"
				/>
			</SacoFormItem>
			<SacoFormItem :label="t('detailed_description')" prop="detail">
				<SacoTextarea
					v-model="formModel.detail"
					:max-length="REVIEW_AGENT_DESCRIPTION_MAX_LENGTH"
					:rows="4"
				/>
			</SacoFormItem>
		</SacoForm>
		<template #footer>
			<SacoButton @click="modelValue = false">
				{{ t('cancel') }}
			</SacoButton>
			<SacoButton
				type="primary"
				:icon="isEdit ? undefined : 'antOutline-plus'"
				@click="handleConfirm"
			>
				{{ isEdit ? t('modify') : t('addition') }}
			</SacoButton>
		</template>
	</SacoDialog>
</template>
<script lang="ts" setup name="ChecklistDialog">
interface ChecklistDialogProps {
	kind: 'ai' | 'manual'
	editIndex: number
}

const props = defineProps<ChecklistDialogProps>()
const emit = defineEmits<{
	confirm: [item: ReviewAgentChecklistItem]
}>()
const modelValue = defineModel<boolean>('modelValue', {
	default: false,
})
const { t } = useI18n()
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<ReviewAgentChecklistItem>({
	name: '',
	detail: '',
})
const isEdit = computed(() => props.editIndex !== -1)
const dialogTitle = computed(() => {
	if (props.kind === 'ai') {
		return isEdit.value ? t('edit_ai_review_item') : t('add_ai_review_item')
	}
	return isEdit.value
		? t('edit_manual_review_item')
		: t('add_manual_review_item')
})
const formRules = computed<FormRules>(() => ({
	name: [
		{
			required: true,
			message: t('validate_please_enter_any', [t('item_name')]),
		},
	],
	detail: [
		{
			required: true,
			message: t('validate_please_enter_any', [
				t('detailed_description'),
			]),
		},
	],
}))

const resetForm = (item?: ReviewAgentChecklistItem) => {
	formModel.name = item?.name || ''
	formModel.detail = item?.detail || ''
	formRef.value?.clearValidate()
}

const handleConfirm = () => {
	formRef.value?.validate((valid: boolean) => {
		if (!valid) return
		emit('confirm', {
			name: formModel.name,
			detail: formModel.detail,
		})
		modelValue.value = false
	})
}

defineExpose({
	resetForm,
})
</script>
