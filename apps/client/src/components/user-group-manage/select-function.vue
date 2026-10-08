<template>
	<CommonTeleportDialog
		v-model="modelValue"
		:title="t('selection_function')"
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
						:placeholder="t('function_name')"
						:maxlength="CLIENT_FUNCTION_NAME_MAX_LENGTH"
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
					:label="t('function_name')"
					prop="name"
					width="634px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('remark')"
					prop="remark"
					width="831px"
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
import { leachFormatter } from '#/utils/formatter'
import { noTransferDblClick } from '#/utils/message'
import {
	useTableSelection,
	type TableSelectionExpose,
} from '#/utils/table-selection'
const { t } = useI18n()

const apis = defineModel<ClientFunctionPageRecord[]>('apis', {
	default: () => [],
})
const modelValue = defineModel<boolean>('modelValue', {
	default: false,
})
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<ClientFunctionPageParams>({
	name: '',
})
const {
	search,
	searchLoading,
	reset,
	refreshLoading,
	dataList,
	pageInfo,
	refresh,
	loading,
} = useSearchFormTable(formRef, formModel, clientFunctionPage)
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
