<template>
	<div class="review-agent-form">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="REVIEW_AGENT_CREATE"
					:loading="createLoading"
					icon="antOutline-check-circle"
					data-icon-color="var(--success-color)"
					@click="handleComplete"
				>
					{{ t('complete') }}
				</SacoButton>
			</template>
		</CommonTeleportNav>
		<SacoCard :header="t('basic_information')">
			<SacoForm
				ref="formRef"
				:model="formModel"
				:rules="formRules"
				:disabled="createLoading"
				label-position="top"
			>
				<SacoFormItem :label="t('agent_name')" prop="name">
					<SacoInput
						v-model="formModel.name"
						:maxlength="REVIEW_AGENT_NAME_MAX_LENGTH"
					/>
				</SacoFormItem>
				<SacoFormItem :label="t('skill')" prop="skillId">
					<SacoInput
						:model-value="skillName"
						readonly
						:validate-event="false"
						@click="selectSkillVisible = true"
					>
						<template #suffix>
							<SacoSvg
								:name="('more' as SvgName)"
								@click="selectSkillVisible = true"
							/>
						</template>
					</SacoInput>
				</SacoFormItem>
				<SacoFormItem :label="t('dynamic_form')" prop="dynamicFormId">
					<SacoInput
						:model-value="dynamicFormName"
						readonly
						:validate-event="false"
						@click="selectFormVisible = true"
					>
						<template #suffix>
							<SacoSvg
								:name="('more' as SvgName)"
								@click="selectFormVisible = true"
							/>
						</template>
					</SacoInput>
				</SacoFormItem>
				<SacoFormItem
					:label="t('simple_description')"
					prop="description"
				>
					<SacoInput
						v-model="formModel.description"
						:maxlength="REVIEW_AGENT_DESCRIPTION_MAX_LENGTH"
					/>
				</SacoFormItem>
				<SacoFormItem
					:label="t('ai_review_duration_second')"
					prop="aiReviewDuration"
				>
					<SacoNumber
						v-model="(formModel.aiReviewDuration as any)"
						:min="0"
					/>
				</SacoFormItem>
				<SacoFormItem
					:label="t('manual_review_duration_second')"
					prop="manualReviewDuration"
				>
					<SacoNumber
						v-model="(formModel.manualReviewDuration as any)"
						:min="0"
					/>
				</SacoFormItem>
				<SacoFormItem
					:label="t('remark')"
					prop="remark"
					:style="{ '--column-span': 2 }"
				>
					<SacoTextarea
						v-model="formModel.remark"
						:max-length="REVIEW_AGENT_REMARK_MAX_LENGTH"
						:rows="1"
					/>
				</SacoFormItem>
			</SacoForm>
		</SacoCard>
		<SacoCard>
			<template #header>
				{{ t('ai_review_checklist') }}
				<SacoButton
					icon="antOutline-plus"
					data-icon-color="var(--primary-color)"
					@click="handleAddChecklist('ai')"
				>
					{{ t('addition') }}
				</SacoButton>
			</template>
			<SacoTable
				:data="formModel.aiReviewChecklists"
				@row-dblclick="noTransferDblClick"
			>
				<SacoTableColumn :label="t('serial_number')" width="69px">
					<template #default="{ $index }">{{ $index + 1 }}</template>
				</SacoTableColumn>
				<SacoTableColumn
					:label="t('item_name')"
					prop="name"
					width="446px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('detailed_description')"
					prop="detail"
					width="976px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn :label="t('operation')" width="400px">
					<template #default="{ $index }">
						<SacoText
							type="danger"
							@click="
								handleRemoveChecklist(
									formModel.aiReviewChecklists,
									$index,
								)
							"
						>
							{{ t('remove') }}
						</SacoText>
						<SacoText
							type="primary"
							@click="handleEditChecklist('ai', $index)"
						>
							{{ t('modify') }}
						</SacoText>
						<SacoText
							v-if="$index > 0"
							type="primary"
							@click="
								handleMoveUpChecklist(
									formModel.aiReviewChecklists,
									$index,
								)
							"
						>
							{{ t('move_up') }}
						</SacoText>
						<SacoText
							v-if="
								$index < formModel.aiReviewChecklists.length - 1
							"
							type="primary"
							@click="
								handleMoveDownChecklist(
									formModel.aiReviewChecklists,
									$index,
								)
							"
						>
							{{ t('move_down') }}
						</SacoText>
					</template>
				</SacoTableColumn>
			</SacoTable>
		</SacoCard>
		<SacoCard>
			<template #header>
				{{ t('manual_review_checklist') }}
				<SacoButton
					icon="antOutline-plus"
					data-icon-color="var(--primary-color)"
					@click="handleAddChecklist('manual')"
				>
					{{ t('addition') }}
				</SacoButton>
			</template>
			<SacoTable
				:data="formModel.manualReviewChecklists"
				@row-dblclick="noTransferDblClick"
			>
				<SacoTableColumn :label="t('serial_number')" width="69px">
					<template #default="{ $index }">{{ $index + 1 }}</template>
				</SacoTableColumn>
				<SacoTableColumn
					:label="t('item_name')"
					prop="name"
					width="446px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('detailed_description')"
					prop="detail"
					width="976px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn :label="t('operation')" width="400px">
					<template #default="{ $index }">
						<SacoText
							type="danger"
							@click="
								handleRemoveChecklist(
									formModel.manualReviewChecklists,
									$index,
								)
							"
						>
							{{ t('remove') }}
						</SacoText>
						<SacoText
							type="primary"
							@click="handleEditChecklist('manual', $index)"
						>
							{{ t('modify') }}
						</SacoText>
						<SacoText
							v-if="$index > 0"
							type="primary"
							@click="
								handleMoveUpChecklist(
									formModel.manualReviewChecklists,
									$index,
								)
							"
						>
							{{ t('move_up') }}
						</SacoText>
						<SacoText
							v-if="
								$index <
								formModel.manualReviewChecklists.length - 1
							"
							type="primary"
							@click="
								handleMoveDownChecklist(
									formModel.manualReviewChecklists,
									$index,
								)
							"
						>
							{{ t('move_down') }}
						</SacoText>
					</template>
				</SacoTableColumn>
			</SacoTable>
		</SacoCard>
		<ChecklistDialog
			ref="checklistDialogRef"
			v-model="checklistDialogVisible"
			:kind="checklistKind"
			:edit-index="checklistEditIndex"
			@confirm="handleConfirmChecklist"
		/>
		<SelectSkill v-model="selectSkillVisible" @select="onSelectSkill" />
		<SelectDynamicForm v-model="selectFormVisible" @select="onSelectForm" />
	</div>
</template>
<script lang="ts" setup name="ReviewAgentManageAdd">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useSameChannel } from '#/utils/broadcast'
import { leachFormatter } from '#/utils/formatter'
import { noTransferDblClick } from '#/utils/message'
import { useRouterStore } from '#/store'
import SelectSkill from '@/components/review-agent-manage/select-skill.vue'
import SelectDynamicForm from '@/components/review-agent-manage/select-dynamic-form.vue'
import ChecklistDialog from '@/components/review-agent-manage/checklist-dialog.vue'
const { t } = useI18n()
const parentPath = '/review-agent-manage'
const routerStore = useRouterStore()
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<ReviewAgentCreateData>({
	name: '',
	skillId: undefined as unknown as number,
	dynamicFormId: undefined as unknown as number,
	description: '',
	aiReviewDuration: undefined as unknown as number,
	manualReviewDuration: undefined as unknown as number,
	remark: '',
	aiReviewChecklists: [],
	manualReviewChecklists: [],
})
const skillName = ref('')
const dynamicFormName = ref('')
const selectSkillVisible = ref(false)
const selectFormVisible = ref(false)
type ChecklistKind = 'ai' | 'manual'
const checklistKind = ref<ChecklistKind>('ai')
const checklistEditIndex = ref(-1)
const checklistDialogVisible = ref(false)
const checklistDialogRef = ref<InstanceType<typeof ChecklistDialog> | null>(
	null,
)
const createLoading = ref(false)
const formRules = computed<FormRules>(() => ({
	name: [
		{
			required: true,
			message: t('validate_please_enter_any', [t('agent_name')]),
		},
	],
	skillId: [
		{
			type: 'number',
			required: true,
			message: t('validate_please_select_any', [t('skill')]),
		},
	],
	dynamicFormId: [
		{
			type: 'number',
			required: true,
			message: t('validate_please_select_any', [t('dynamic_form')]),
		},
	],
	description: [
		{
			required: true,
			message: t('validate_please_enter_any', [t('simple_description')]),
		},
	],
	aiReviewDuration: [
		{
			type: 'number',
			required: true,
			message: t('validate_please_enter_any', [t('ai_review_duration')]),
		},
	],
	manualReviewDuration: [
		{
			type: 'number',
			required: true,
			message: t('validate_please_enter_any', [
				t('manual_review_duration'),
			]),
		},
	],
	remark: [
		{
			required: false,
			message: t('validate_please_enter_any', [t('remark')]),
		},
	],
}))
const sameChannel = useSameChannel(parentPath)
const onSelectSkill = (row: SkillPageRecord) => {
	formModel.skillId = row.id
	skillName.value = row.name
	formRef.value?.validateField('skillId')
}
const onSelectForm = (row: DynamicFormPageRecord) => {
	formModel.dynamicFormId = row.id
	dynamicFormName.value = row.name
	formRef.value?.validateField('dynamicFormId')
}
const getChecklist = (kind: ChecklistKind) =>
	kind === 'ai'
		? formModel.aiReviewChecklists
		: formModel.manualReviewChecklists
const handleAddChecklist = (kind: ChecklistKind) => {
	checklistKind.value = kind
	checklistEditIndex.value = -1
	checklistDialogVisible.value = true
	nextTick(() => {
		checklistDialogRef.value?.resetForm()
	})
}
const handleEditChecklist = (kind: ChecklistKind, index: number) => {
	checklistKind.value = kind
	checklistEditIndex.value = index
	checklistDialogVisible.value = true
	nextTick(() => {
		checklistDialogRef.value?.resetForm(getChecklist(kind)[index])
	})
}
const handleRemoveChecklist = (
	list: ReviewAgentChecklistItem[],
	index: number,
) => {
	list.splice(index, 1)
}
const handleMoveUpChecklist = (
	list: ReviewAgentChecklistItem[],
	index: number,
) => {
	if (index <= 0) return
	const current = list[index]
	const prev = list[index - 1]
	list[index] = prev
	list[index - 1] = current
}
const handleMoveDownChecklist = (
	list: ReviewAgentChecklistItem[],
	index: number,
) => {
	if (index >= list.length - 1) return
	const current = list[index]
	const next = list[index + 1]
	list[index] = next
	list[index + 1] = current
}
const handleConfirmChecklist = (item: ReviewAgentChecklistItem) => {
	const list = getChecklist(checklistKind.value)
	if (checklistEditIndex.value === -1) {
		list.push(item)
		return
	}
	list[checklistEditIndex.value] = item
}
const handleComplete = () => {
	formRef.value?.validate((valid: boolean) => {
		if (!valid) return
		if (!formModel.aiReviewChecklists.length) {
			SacoMessage.warning(
				t('validate_add_any', [t('ai_review_checklist')]),
			)
			return
		}
		createLoading.value = true
		reviewAgentCreate(formModel)
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
@use '../../style/review-agent-form.scss';
</style>
