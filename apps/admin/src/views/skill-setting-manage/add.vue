<template>
	<div class="skill-setting-manage-form">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="SKILL_CREATE"
					:loading="createLoading"
					icon="antOutline-check-circle"
					data-icon-color="var(--success-color)"
					@click="handleComplete"
				>
					{{ t('complete') }}
				</SacoButton>
			</template>
		</CommonTeleportNav>
		<SacoForm
			ref="formRef"
			class="skill-setting-manage-form__form"
			:model="formModel"
			:rules="formRules"
			:disabled="createLoading"
			label-position="top"
		>
			<SacoCard :header="t('basic_information')">
				<SacoFormItem :label="t('skill_name')" prop="name">
					<SacoInput
						v-model="formModel.name"
						:maxlength="SKILL_NAME_MAX_LENGTH"
					/>
				</SacoFormItem>
				<SacoFormItem
					:label="t('ai_application_platform')"
					prop="platformType"
				>
					<SacoSelect
						v-model="formModel.platformType"
						:data="skillPlatformTypeList"
						:clearable="true"
						:filterable="true"
						@change="handlePlatformTypeChange"
					/>
				</SacoFormItem>

				<SacoFormItem :label="t('skill_type')" prop="skillTypeId">
					<SacoSelect
						v-model="formModel.skillTypeId"
						:data="skillTypeList"
						field-label="name"
						field-value="id"
						:loading="skillTypeLoading"
						:loading-text="t('fetching')"
						:clearable="true"
						:filterable="true"
					/>
				</SacoFormItem>
				<template v-if="isBailian">
					<SacoFormItem
						:label="t('bailian_api_key')"
						prop="bailianApiKey"
					>
						<SacoInput
							v-model="formModel.bailianApiKey"
							:maxlength="SKILL_BAILIAN_API_KEY_MAX_LENGTH"
						/>
					</SacoFormItem>
					<SacoFormItem
						:label="t('bailian_app_id')"
						prop="bailianAppId"
					>
						<SacoInput
							v-model="formModel.bailianAppId"
							:maxlength="SKILL_BAILIAN_APP_ID_MAX_LENGTH"
						/>
					</SacoFormItem>
				</template>
				<template v-if="isCoze">
					<SacoFormItem
						:label="t('coze_workflow_id')"
						prop="cozeWorkflowId"
					>
						<SacoInput
							v-model="formModel.cozeWorkflowId"
							:maxlength="SKILL_COZE_WORKFLOW_ID_MAX_LENGTH"
						/>
					</SacoFormItem>
					<SacoFormItem :label="t('coze_app_id')" prop="cozeAppId">
						<SacoInput
							v-model="formModel.cozeAppId"
							:maxlength="SKILL_COZE_APP_ID_MAX_LENGTH"
						/>
					</SacoFormItem>
				</template>
				<SacoFormItem
					:label="t('remark')"
					prop="remark"
					:style="{ '--column-span': 2 }"
				>
					<SacoTextarea
						v-model="formModel.remark"
						:max-length="SKILL_REMARK_MAX_LENGTH"
						:rows="1"
					/>
				</SacoFormItem>
			</SacoCard>
			<SacoCard class="skill-setting-manage-form__prompt">
				<template #header>
					<span
						class="skill-setting-manage-form__prompt-title asterisk-required"
					>
						{{ t('file_matching_prompt_words') }}
					</span>
				</template>
				<SacoFormItem prop="fileMatchPrompt">
					<SacoTextarea
						v-model="formModel.fileMatchPrompt"
						:max-length="SKILL_FILE_MATCH_PROMPT_MAX_LENGTH"
						resize="none"
					/>
				</SacoFormItem>
			</SacoCard>
		</SacoForm>
	</div>
</template>
<script lang="ts" setup name="SkillSettingManageAdd">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useSameChannel } from '#/utils/broadcast'
import { useRouterStore } from '#/store'
import { useSkillTypeOptions } from '@/utils/skill-type'
const { t } = useI18n()
const parentPath = '/skill-setting-manage'
const routerStore = useRouterStore()
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<SkillCreateData>({
	name: '',
	skillTypeId: undefined as unknown as number,
	platformType: undefined as unknown as SkillPlatformType,
	remark: '',
	bailianApiKey: '',
	bailianAppId: '',
	cozeWorkflowId: '',
	cozeAppId: '',
	fileMatchPrompt: '',
})
const { skillPlatformTypeList } = useSkillPlatformType()
const { skillTypeList, skillTypeLoading, loadSkillTypeList } =
	useSkillTypeOptions()
const isBailian = computed(
	() => formModel.platformType === SkillPlatformType.AliyunBailian,
)
const isCoze = computed(
	() => formModel.platformType === SkillPlatformType.BytedanceCoze,
)
const formRules = computed<FormRules>(() => ({
	name: [
		{
			required: true,
			message: t('validate_please_enter_any', [t('skill_name')]),
		},
	],
	platformType: [
		{
			type: 'number',
			required: true,
			message: t('validate_please_select_any', [
				t('ai_application_platform'),
			]),
		},
	],
	skillTypeId: [
		{
			type: 'number',
			required: true,
			message: t('validate_please_select_any', [t('skill_type')]),
		},
	],
	bailianApiKey: [
		{
			required: isBailian.value,
			message: t('validate_please_enter_any', [t('bailian_api_key')]),
		},
	],
	bailianAppId: [
		{
			required: isBailian.value,
			message: t('validate_please_enter_any', [t('bailian_app_id')]),
		},
	],
	cozeWorkflowId: [
		{
			required: isCoze.value,
			message: t('validate_please_enter_any', [t('coze_workflow_id')]),
		},
	],
	cozeAppId: [
		{
			required: isCoze.value,
			message: t('validate_please_enter_any', [t('coze_app_id')]),
		},
	],
	fileMatchPrompt: [
		{
			required: true,
			message: t('validate_please_enter_any', [
				t('file_matching_prompt_words'),
			]),
		},
	],
}))
const sameChannel = useSameChannel(parentPath)
onMounted(() => {
	loadSkillTypeList()
})

const handlePlatformTypeChange = () => {
	formModel.bailianApiKey = ''
	formModel.bailianAppId = ''
	formModel.cozeWorkflowId = ''
	formModel.cozeAppId = ''
}

const createLoading = ref(false)
const handleComplete = () => {
	formRef.value?.validate((valid: boolean) => {
		if (!valid) return
		createLoading.value = true
		skillCreate(formModel)
			.then(() => {
				SacoMessage.success(t('addition_successful'))
				sameChannel.send('reload')
				routerStore.goParentRoute(parentPath)
			})
			.finally(() => {
				createLoading.value = false
			})
	})
}
</script>
<style lang="scss" scoped>
@use './form.scss';
</style>
