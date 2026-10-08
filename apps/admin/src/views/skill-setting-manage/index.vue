<template>
	<div v-loading="loading" class="skill-setting-manage">
		<CommonTeleportNav refresh expand :model="formModel">
			<template #top>
				<SacoButton
					icon="md-refresh"
					:loading="refreshLoading"
					:disabled="searchLoading || remarkLoading"
					@click="reset"
				>
					{{ t('reset') }}
				</SacoButton>
				<SacoButton
					icon="mb-search"
					type="primary"
					:loading="searchLoading"
					:disabled="refreshLoading || remarkLoading"
					data-search
					@click="search"
				>
					{{ t('search') }}
				</SacoButton>
			</template>
			<template #right>
				<SacoButton
					v-power="SKILL_CREATE"
					icon="antOutline-plus"
					data-icon-color="var(--primary-color)"
					:disabled="loading || remarkLoading"
					@click="handleAdd"
				>
					{{ t('addition') }}
				</SacoButton>
			</template>
			<template #bottom>
				<SacoForm
					ref="formRef"
					:model="formModel"
					:disabled="remarkLoading"
				>
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
					<SacoFormItem prop="skillTypeId">
						<SacoSelect
							v-model="formModel.skillTypeId"
							:placeholder="t('skill_type')"
							:data="skillTypeList"
							field-label="name"
							field-value="id"
							:loading="skillTypeLoading"
							:loading-text="t('fetching')"
							:clearable="true"
							:filterable="true"
							@change="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="remark">
						<SacoInput
							v-model="formModel.remark"
							:placeholder="t('remark')"
							:maxlength="SKILL_REMARK_MAX_LENGTH"
							@keyup.enter="search"
						/>
					</SacoFormItem>
				</SacoForm>
			</template>
		</CommonTeleportNav>
		<SacoTable :data="dataList" @row-dblclick="handleRowDblclick">
			<SacoTableColumn
				:label="t('skill_name')"
				prop="name"
				width="596px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('ai_application_platform')"
				prop="platformType"
				width="347px"
				:formatter="skillPlatformTypeFormatter"
			/>
			<SacoTableColumn
				:label="t('skill_type')"
				prop="skillTypeName"
				width="356px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn :label="t('remark')" prop="remark" width="597px">
				<template #default="{ row }: { row: TableRow }">
					<CommonRemarkInput
						:row="row"
						:handle-save="handleSaveRemark"
						:api-path="SKILL_UPDATE_REMARK"
						:maxlength="SKILL_REMARK_MAX_LENGTH"
					/>
				</template>
			</SacoTableColumn>
		</SacoTable>
		<CommonTeleportFooter>
			<CommonPagination
				v-model:current-page="pageInfo.pageNum"
				v-model:page-size="pageInfo.pageSize"
				:disabled="loading || remarkLoading"
				:total="pageInfo.total"
				@change="search"
			/>
		</CommonTeleportFooter>
	</div>
</template>
<script lang="ts" setup name="SkillSettingManage">
import CommonRemarkInput from '#/components/remark-input/index.vue'
import CommonPagination from '#/components/pagination/index.vue'
import CommonTeleportNav from '#/components/teleport/nav.vue'
import CommonTeleportFooter from '#/components/teleport/footer.vue'
import { useSameChannel } from '#/utils/broadcast'
import { useSearchFormTable } from '#/utils/search'
import { leachFormatter } from '#/utils/formatter'
import { useSkillTypeOptions } from '@/utils/skill-type'
const { t } = useI18n()
const currentPath = '/skill-setting-manage'
const router = useRouter()
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<SkillPageParams>({
	name: '',
	platformType: undefined,
	skillTypeId: undefined,
	remark: '',
})
const { skillPlatformTypeList, skillPlatformTypeFormatter } =
	useSkillPlatformType()
const { skillTypeList, skillTypeLoading, loadSkillTypeList } =
	useSkillTypeOptions()

const {
	search,
	searchLoading,
	reset,
	refresh,
	refreshLoading,
	dataList,
	pageInfo,
	loading,
} = useSearchFormTable(formRef, formModel, skillPage)
type TableRow = (typeof dataList.value)[number]
onMounted(() => {
	loadSkillTypeList()
	search()
})

const handleAdd = () => {
	router.push(`${currentPath}/add`)
}

const handleRowDblclick = (row: TableRow) => {
	if (row.isEdit) return
	router.push(`${currentPath}/detail/${row.id}`)
}
const remarkLoading = ref(false)
const handleSaveRemark = (row: TableRow) => {
	if (loading.value || remarkLoading.value || row.editLoading) return
	row.editLoading = true
	remarkLoading.value = true
	skillUpdateRemark({
		id: row.id,
		remark: row.remark,
	})
		.then(() => {
			row.isEdit = false
			SacoMessage.success(t('remark_modified_successfully'))
			refresh()
		})
		.finally(() => {
			row.editLoading = false
			remarkLoading.value = false
		})
}
const sameChannel = useSameChannel(currentPath)
sameChannel.on((type: 'refresh' | 'reload') => {
	if (type === 'reload') {
		pageInfo.pageNum = 1
	}
	loadSkillTypeList()
	refresh()
})
</script>
<style scoped lang="scss">
.skill-setting-manage {
	height: 100%;
	min-height: 0;
	overflow: hidden;
}
</style>
