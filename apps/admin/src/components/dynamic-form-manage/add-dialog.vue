<template>
	<SacoDialog
		v-model="modelValue"
		:title="t('dynamic_form_add')"
		width="41.35%"
		align-center
		append-to-body
		:close-on-click-modal="false"
	>
		<SacoForm
			ref="formRef"
			class="dynamic-form-add-dialog__form"
			:model="formModel"
			:rules="formRules"
			:disabled="createLoading"
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
			<SacoButton :disabled="createLoading" @click="modelValue = false">
				{{ t('cancel') }}
			</SacoButton>
			<SacoButton
				v-power="DYNAMIC_FORM_CREATE"
				type="primary"
				:loading="createLoading"
				@click="handleConfirm"
			>
				{{ t('addition') }}
			</SacoButton>
		</template>
	</SacoDialog>
</template>
<script lang="ts" setup name="DynamicFormAddDialog">
import { useFormTypeOptions } from '@/utils/form-type'

const emit = defineEmits<{
	reload: []
}>()
const { t } = useI18n()
const router = useRouter()
const parentPath = '/dynamic-form-manage'
const modelValue = defineModel<boolean>('modelValue', {
	default: false,
})
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<DynamicFormCreateData>({
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
	formModel.name = ''
	formModel.formTypeId = undefined as unknown as number
	formModel.remark = ''
	formRef.value?.clearValidate()
	loadFormTypeList()
})
const createLoading = ref(false)
const handleConfirm = () => {
	formRef.value?.validate((valid: boolean) => {
		if (!valid) return
		createLoading.value = true
		dynamicFormCreate(formModel)
			.then((res) => {
				SacoMessage.success(t('addition_successful'))
				emit('reload')
				modelValue.value = false
				router.push(`${parentPath}/edit/${res.data}`)
			})
			.finally(() => {
				createLoading.value = false
			})
	})
}
</script>
<style scoped lang="scss">
.dynamic-form-add-dialog__form {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	column-gap: calc(var(--common-gap) * 2.3);
	align-items: start;

	.saco-form-item {
		grid-column: span var(--column-span, 1);
	}
}
</style>
