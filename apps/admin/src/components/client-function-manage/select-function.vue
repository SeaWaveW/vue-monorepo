<template>
	<CommonTeleportDialog
		v-model="modelValue"
		:title="t('select_client_interface')"
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
		<template #right>
			<SacoButton
				icon="antOutline-check-circle"
				data-icon-color="var(--success-color)"
				@click="handleComplete"
			>
				{{ t('complete') }}
			</SacoButton>
		</template>
		<template #bottom>
			<SacoForm ref="formRef" :model="formModel">
				<SacoFormItem prop="name">
					<SacoInput
						v-model="formModel.name"
						:placeholder="t('interface_name')"
						:maxlength="CLIENT_API_NAME_MAX_LENGTH"
						@keyup.enter="search"
					/>
				</SacoFormItem>
				<SacoFormItem prop="path">
					<SacoInput
						v-model="formModel.path"
						:placeholder="t('interface_url')"
						:maxlength="CLIENT_API_PATH_MAX_LENGTH"
						@keyup.enter="search"
					/>
				</SacoFormItem>
				<SacoFormItem prop="level">
					<SacoSelect
						v-model="formModel.level"
						:placeholder="t('access_level')"
						:data="clientApiLevelList"
						:clearable="true"
						:filterable="true"
						@change="search"
					/>
				</SacoFormItem>
				<SacoFormItem prop="remark">
					<SacoInput
						v-model="formModel.remark"
						:placeholder="t('remark')"
						:maxlength="CLIENT_API_REMARK_MAX_LENGTH"
						@keyup.enter="search"
					/>
				</SacoFormItem>
			</SacoForm>
		</template>
		<div v-loading="loading" class="select-dialog">
			<SacoTable
				ref="tableRef"
				class="select-dialog__table"
				row-key="id"
				height="100%"
				:data="dataList"
				@selection-change="handleSelectionChange"
				@row-dblclick="noTransferDblClick"
			>
				<SacoTableColumn
					:label="t('interface_name')"
					prop="name"
					width="318px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('interface_url')"
					prop="path"
					width="508px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('access_level')"
					prop="level"
					:formatter="clientApiLevelFormatter"
					width="223px"
				/>
				<SacoTableColumn
					:label="t('remark')"
					prop="remark"
					width="413px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					type="selection"
					:reserve-selection="true"
					width="65px"
				/>
			</SacoTable>
			<SacoCard class="select-dialog__selected" :header="t('selected')">
				<div
					v-for="item in apis"
					:key="item.id"
					class="select-dialog__item"
				>
					<div class="select-dialog__name">{{ item.name }}</div>
					<SacoText type="danger" @click="handleRemove(item)">
						{{ t('remove') }}
					</SacoText>
				</div>
			</SacoCard>
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
<script lang="ts" setup name="SelectFunction">
import CommonPagination from '#/components/pagination/index.vue'
import CommonTeleportDialog from '#/components/teleport/dialog.vue'
import { useSearchFormTable } from '#/utils/search'
import type { TableSelectionExpose } from '#/utils/table-selection'
import { noTransferDblClick } from '#/utils/message'
import { leachFormatter } from '#/utils/formatter'
import { useTableSelection } from '#/utils/table-selection'
const { t } = useI18n()

const apis = defineModel<ClientApiPageRecord[]>('apis', {
	default: () => [],
})
// 弹窗显隐
const modelValue = defineModel<boolean>('modelValue', {
	default: false,
})
// 表单引用
const formRef = ref<FormExpose | null>(null)
// 表单模型
const formModel = reactive<ClientApiPageParams>({
	name: '',
	path: '',
	level: undefined,
	remark: '',
})
// 使用表单表格关联查询
const {
	search,
	searchLoading,
	reset,
	refreshLoading,
	dataList,
	pageInfo,
	refresh,
	loading,
} = useSearchFormTable(formRef, formModel, clientApiPage)
const { clientApiLevelList, clientApiLevelFormatter } = useClientApiLevel()
const tableRef = ref<TableSelectionExpose | null>(null)
const { handleSelectionChange, handleRemove } = useTableSelection(
	apis,
	tableRef,
	modelValue,
	refresh,
)
const handleComplete = () => {
	modelValue.value = false
}
</script>
<style lang="scss" scoped>
@use '../select-dialog.scss';
</style>
