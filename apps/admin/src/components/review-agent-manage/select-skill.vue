<template>
	<CommonTeleportDialog
		v-model="modelValue"
		:title="t('select_skill')"
		:expand="true"
		:model="formModel"
	>
		<template #top>
			<SacoButton
				icon="md-refresh"
				:loading="refreshLoading"
				:disabled="searchLoading"
				@click="reset"
			>
				{{ t('reset') }}
			</SacoButton>
			<SacoButton
				icon="mb-search"
				type="primary"
				:loading="searchLoading"
				:disabled="refreshLoading"
				data-search
				@click="search"
			>
				{{ t('search') }}
			</SacoButton>
		</template>
		<template #bottom>
			<SacoForm ref="formRef" :model="formModel">
				<SacoFormItem prop="name">
					<SacoInput
						v-model="formModel.name"
						:placeholder="t('skill_name')"
						:maxlength="SKILL_NAME_MAX_LENGTH"
						@keyup.enter="search"
					/>
				</SacoFormItem>
				<SacoFormItem prop="platformType">
					<SacoSelect
						v-model="formModel.platformType"
						:placeholder="t('ai_application_platform')"
						:data="skillPlatformTypeList"
						:clearable="true"
						:filterable="true"
						@change="search"
					/>
				</SacoFormItem>
				<SacoFormItem prop="remark">
					<SacoInput
						v-model="formModel.remark"
						:placeholder="t('simple_description')"
						:maxlength="SKILL_REMARK_MAX_LENGTH"
						@keyup.enter="search"
					/>
				</SacoFormItem>
			</SacoForm>
		</template>
		<div v-loading="loading" class="select-skill">
			<SacoTable
				height="100%"
				:data="dataList"
				@row-dblclick="noTransferDblClick"
			>
				<SacoTableColumn
					:label="t('skill_name')"
					prop="name"
					width="512px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('ai_application_platform')"
					prop="platformType"
					width="298px"
					:formatter="skillPlatformTypeFormatter"
				/>
				<SacoTableColumn
					:label="t('data_collection_form')"
					prop="skillTypeName"
					width="465px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('simple_description')"
					prop="remark"
					width="621px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn :label="t('operation')" width="115px">
					<template #default="{ row }: { row: TableRow }">
						<SacoText type="primary" @click="handleSelect(row)">
							{{ t('choice') }}
						</SacoText>
					</template>
				</SacoTableColumn>
			</SacoTable>
		</div>
		<template #footer>
			<CommonPagination
				v-model:current-page="pageInfo.pageNum"
				v-model:page-size="pageInfo.pageSize"
				:disabled="loading"
				:total="pageInfo.total"
				@change="search"
			/>
		</template>
	</CommonTeleportDialog>
</template>
<script lang="ts" setup name="SelectSkill">
import CommonPagination from '#/components/pagination/index.vue'
import CommonTeleportDialog from '#/components/teleport/dialog.vue'
import { useSearchFormTable } from '#/utils/search'
import { noTransferDblClick } from '#/utils/message'
import { leachFormatter } from '#/utils/formatter'
import { useTableSelection } from '#/utils/table-selection'
const { t } = useI18n()
const emit = defineEmits<{
	select: [row: SkillPageRecord]
}>()
const modelValue = defineModel<boolean>('modelValue', {
	default: false,
})
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<SkillPageParams>({
	name: '',
	platformType: undefined,
	remark: '',
})
const { skillPlatformTypeList, skillPlatformTypeFormatter } =
	useSkillPlatformType()
const {
	search,
	searchLoading,
	reset,
	refreshLoading,
	dataList,
	pageInfo,
	refresh,
	loading,
} = useSearchFormTable(formRef, formModel, skillPage)
type TableRow = (typeof dataList.value)[number]
// 与 select-function 的 useTableSelection(..., modelValue, refresh) 同一条：打开后 nextTick 再 refresh，不走 search/validate
watch(modelValue, (visible) => {
	if (!visible) return
	nextTick(() => {
		refresh()
	})
})
const handleSelect = (row: TableRow) => {
	emit('select', row)
	modelValue.value = false
}
</script>
<style scoped lang="scss">
.select-skill {
	flex: 1;
	width: 100%;
	height: 100%;
	min-height: 0;

	.sqt-text {
		cursor: pointer;
	}
}
</style>
