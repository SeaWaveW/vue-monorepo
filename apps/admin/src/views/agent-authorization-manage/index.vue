<template>
	<div v-loading="loading" class="agent-authorization-manage">
		<CommonTeleportNav refresh expand :model="formModel">
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
					v-power="TENANT_REVIEW_AGENT_CREATE"
					icon="antOutline-plus"
					data-icon-color="var(--primary-color)"
					:disabled="loading"
					@click="handleAdd"
				>
					{{ t('addition') }}
				</SacoButton>
			</template>
			<template #bottom>
				<SacoForm ref="formRef" :model="formModel">
					<SacoFormItem prop="reviewAgentName">
						<SacoInput
							v-model="formModel.reviewAgentName"
							:placeholder="t('agent_name')"
							:maxlength="
								TENANT_REVIEW_AGENT_REVIEW_AGENT_NAME_MAX_LENGTH
							"
							@keyup.enter="search"
						/>
					</SacoFormItem>
					<SacoFormItem prop="tenantName">
						<SacoInput
							v-model="formModel.tenantName"
							:placeholder="t('client_name')"
							:maxlength="
								TENANT_REVIEW_AGENT_TENANT_NAME_MAX_LENGTH
							"
							@keyup.enter="search"
						/>
					</SacoFormItem>
				</SacoForm>
			</template>
		</CommonTeleportNav>
		<SacoTable :data="dataList" @row-dblclick="noTransferDblClick">
			<SacoTableColumn
				:label="t('agent_name')"
				prop="reviewAgentName"
				width="644px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('client_name')"
				prop="tenantName"
				width="576px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('authorization_date')"
				prop="createTime"
				width="273px"
				:formatter="ymdFormatter"
			/>
			<SacoTableColumn
				:label="t('authorizer')"
				prop="createUserName"
				width="265px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn :label="t('operation')" width="145px">
				<template #default="{ row }: { row: TableRow }">
					<SacoText
						v-power="TENANT_REVIEW_AGENT_DELETE"
						type="danger"
						@click="handleRemove(row)"
					>
						{{ t('remove') }}
					</SacoText>
				</template>
			</SacoTableColumn>
		</SacoTable>
		<CommonTeleportFooter>
			<CommonPagination
				v-model:current-page="pageInfo.pageNum"
				v-model:page-size="pageInfo.pageSize"
				:disabled="loading"
				:total="pageInfo.total"
				@change="search"
			/>
		</CommonTeleportFooter>
	</div>
</template>
<script lang="ts" setup name="AgentAuthorizationManage">
import CommonPagination from '#/components/pagination/index.vue'
import CommonTeleportNav from '#/components/teleport/nav.vue'
import CommonTeleportFooter from '#/components/teleport/footer.vue'
import { useSameChannel } from '#/utils/broadcast'
import { useSearchFormTable } from '#/utils/search'
import { leachFormatter, ymdFormatter } from '#/utils/formatter'
import { noTransferDblClick, confirmBox } from '#/utils/message'
const { t } = useI18n()
const currentPath = '/agent-authorization-manage'
const router = useRouter()
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<TenantReviewAgentPageParams>({
	reviewAgentName: '',
	tenantName: '',
})

const {
	search,
	searchLoading,
	reset,
	refresh,
	refreshLoading,
	dataList,
	pageInfo,
	loading,
} = useSearchFormTable(formRef, formModel, tenantReviewAgentPage)
type TableRow = (typeof dataList.value)[number]
onMounted(() => {
	search()
})

const handleAdd = () => {
	router.push(`${currentPath}/add`)
}

const handleRemove = (row: TableRow) => {
	confirmBox({
		params: row.id,
		api: tenantReviewAgentDelete,
		title: 'remove_authorization',
		message: 'remove_authorization_message',
		success: 'remove_successfully',
		names: [
			{ value: row.tenantName, type: 'primary' },
			{ value: row.reviewAgentName, type: 'warning' },
		],
	}).then(() => {
		refresh()
	})
}
const sameChannel = useSameChannel(currentPath)
sameChannel.on((type: 'refresh' | 'reload') => {
	if (type === 'reload') {
		pageInfo.pageNum = 1
	}
	refresh()
})
</script>
<style scoped lang="scss">
.agent-authorization-manage {
	height: 100%;
	min-height: 0;
	overflow: hidden;

	.sqt-text {
		cursor: pointer;
	}
}
</style>
