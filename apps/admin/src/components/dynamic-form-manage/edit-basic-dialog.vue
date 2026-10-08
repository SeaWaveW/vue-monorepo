<template>
	<SacoDialog
		v-model="modelValue"
		:title="t('modify_basic_information')"
		width="41.35%"
		align-center
		append-to-body
		:close-on-click-modal="false"
	>
		<SacoForm
			ref="formRef"
			class="dynamic-form-edit-basic-dialog__form"
			:model="formModel"
			:rules="formRules"
			:disabled="updateLoading"
			label-position="top"
		>
			<SacoFormItem :label="t('dynamic_form_name')" prop="name">
				<SacoInput
					v-model="formModel.name"
					:maxlength="DYNAMIC_FORM_NAME_MAX_LENGTH"
				/>
			</SacoFormItem>
			<SacoFormItem :label="t('type')" prop="formTypeId">
				<SacoSelect
					v-model="formModel.formTypeId"
					:data="formTypeList"
					field-label="name"
					field-value="id"
					:loading="formTypeLoading"
					:loading-text="t('fetching')"
					:clearable="true"
					:filterable="true"
				/>
			</SacoFormItem>
			<SacoFormItem
				:label="t('remark')"
				prop="remark"
				:style="{ '--column-span': 2 }"
			>
				<SacoInput
					v-model="formModel.remark"
					:maxlength="DYNAMIC_FORM_REMARK_MAX_LENGTH"
				/>
			</SacoFormItem>
		</SacoForm>
		<template #footer>
			<SacoButton :disabled="updateLoading" @click="modelValue = false">
				{{ t('cancel') }}
			</SacoButton>
			<SacoButton
				v-power="DYNAMIC_FORM_UPDATE"
				type="primary"
				:loading="updateLoading"
				@click="handleConfirm"
			>
				{{ t('modify') }}
			</SacoButton>
		</template>
	</SacoDialog>
</template>
<script lang="ts" setup name="DynamicFormEditBasicDialog">
import { useFormTypeOptions } from '@/utils/form-type'

interface Props {
	detail: DynamicFormDetailResponse
}

const props = defineProps<Props>()
const emit = defineEmits<{
	success: []
}>()
const { t } = useI18n()
const modelValue = defineModel<boolean>('modelValue', {
	default: false,
})
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<DynamicFormUpdateData>({
	id: undefined as unknown as number,
	name: '',
	formTypeId: undefined as unknown as number,
	remark: '',
})
const { formTypeList, formTypeLoading, loadFormTypeList } = useFormTypeOptions()
const formRules = computed<FormRules>(() => ({
	name: [
		{
			required: true,
			message: t('validate_please_enter_any', [t('dynamic_form_name')]),
		},
	],
	formTypeId: [
		{
			type: 'number',
			required: true,
			message: t('validate_please_select_any', [t('type')]),
		},
	],
}))
watch(modelValue, (visible) => {
	if (!visible) return
	formModel.id = props.detail.id
	formModel.name = props.detail.name
	formModel.formTypeId = props.detail.formTypeId
	formModel.remark = props.detail.remark
	formRef.value?.clearValidate()
	loadFormTypeList()
})
const updateLoading = ref(false)
const handleConfirm = () => {
	formRef.value?.validate((valid: boolean) => {
		if (!valid) return
		updateLoading.value = true
		dynamicFormUpdate(formModel)
			.then(() => {
				SacoMessage.success(t('modified_successfully'))
				modelValue.value = false
				emit('success')
			})
			.finally(() => {
				updateLoading.value = false
			})
	})
}
</script>
<style scoped lang="scss">
.dynamic-form-edit-basic-dialog__form {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	column-gap: calc(var(--common-gap) * 2.3);
	align-items: start;

	.sqt-form-item {
		grid-column: span var(--column-span, 1);
	}
}
</style>
