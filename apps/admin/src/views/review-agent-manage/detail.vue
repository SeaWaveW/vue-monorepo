<template>
	<div v-loading="loading" class="review-agent-manage-detail">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="REVIEW_AGENT_UPDATE"
					icon="md-border_color"
					data-icon-color="var(--black-color-1)"
					:disabled="loading"
					@click="onEdit"
				>
					{{ t('modify') }}
				</SacoButton>
				<SacoButton
					v-power="REVIEW_AGENT_DELETE"
					icon="riLine-delete-bin-6-line"
					data-icon-color="var(--danger-color)"
					:disabled="loading"
					@click="onDelete"
				>
					{{ t('delete') }}
				</SacoButton>
			</template>
		</CommonTeleportNav>
		<SacoCard :header="t('basic_information')">
			<SacoForm label-position="top" label-suffix="：">
				<SacoFormItem :label="t('agent_name')" prop="name">
					{{ leachFormatter(detailData.name) }}
				</SacoFormItem>
				<SacoFormItem :label="t('skill')" prop="skillName">
					{{ leachFormatter(detailData.skillName) }}
				</SacoFormItem>
				<SacoFormItem :label="t('dynamic_form')" prop="dynamicFormName">
					{{ leachFormatter(detailData.dynamicFormName) }}
				</SacoFormItem>
				<SacoFormItem
					:label="t('simple_description')"
					prop="description"
				>
					{{ leachFormatter(detailData.description) }}
				</SacoFormItem>
				<SacoFormItem
					:label="t('ai_review_duration')"
					prop="aiReviewDuration"
				>
					{{ reviewDurationFormatter(detailData.aiReviewDuration) }}
				</SacoFormItem>
				<SacoFormItem
					:label="t('manual_review_duration')"
					prop="manualReviewDuration"
				>
					{{
						reviewDurationFormatter(detailData.manualReviewDuration)
					}}
				</SacoFormItem>
				<SacoFormItem
					:label="t('remark')"
					prop="remark"
					:style="{ '--column-span': 2 }"
				>
					{{ leachFormatter(detailData.remark) }}
				</SacoFormItem>
			</SacoForm>
		</SacoCard>
		<SacoCard :header="t('ai_review_checklist')">
			<SacoTable
				:data="detailData.aiReviewChecklists"
				@row-dblclick="noTransferDblClick"
			>
				<SacoTableColumn :label="t('serial_number')" width="69px">
					<template #default="{ $index }">{{ $index + 1 }}</template>
				</SacoTableColumn>
				<SacoTableColumn
					:label="t('item_name')"
					prop="name"
					width="550px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('detailed_description')"
					prop="detail"
					width="1281px"
					:formatter="leachFormatter"
				/>
			</SacoTable>
		</SacoCard>
		<SacoCard :header="t('manual_review_checklist')">
			<SacoTable
				:data="detailData.manualReviewChecklists"
				@row-dblclick="noTransferDblClick"
			>
				<SacoTableColumn :label="t('serial_number')" width="69px">
					<template #default="{ $index }">{{ $index + 1 }}</template>
				</SacoTableColumn>
				<SacoTableColumn
					:label="t('item_name')"
					prop="name"
					width="550px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('detailed_description')"
					prop="detail"
					width="1281px"
					:formatter="leachFormatter"
				/>
			</SacoTable>
		</SacoCard>
		<SacoCard :header="t('audit_information')">
			<SacoForm label-position="top" label-suffix="：">
				<SacoFormItem :label="t('create_user')" prop="createUserName">
					{{ leachFormatter(detailData.createUserName) }}
				</SacoFormItem>
				<SacoFormItem :label="t('creation_time')" prop="createTime">
					{{ hmdhmsFormatter(detailData.createTime) }}
				</SacoFormItem>
				<SacoFormItem :label="t('modify_user')" prop="editUserName">
					{{ leachFormatter(detailData.editUserName) }}
				</SacoFormItem>
				<SacoFormItem :label="t('modification_time')" prop="editTime">
					{{ hmdhmsFormatter(detailData.editTime) }}
				</SacoFormItem>
			</SacoForm>
		</SacoCard>
	</div>
</template>
<script lang="ts" setup name="ReviewAgentManageDetail">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useSameChannel } from '#/utils/broadcast'
import { getRouterParams } from '#/utils/router'
import {
	leachFormatter,
	hmdhmsFormatter,
	reviewDurationFormatter,
} from '#/utils/formatter'
import { deleteBox, noTransferDblClick } from '#/utils/message'
import { useRouterStore } from '#/store'
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const routePath = route.path
const routerStore = useRouterStore()
const { id } = getRouterParams<[number]>(['id'])
const parentPath = '/review-agent-manage'
const sameChannel = useSameChannel(parentPath)
const loading = ref(false)
const detailData = reactive<ReviewAgentDetailResponse>({
	id,
	name: '',
	skillId: undefined as unknown as number,
	dynamicFormId: undefined as unknown as number,
	description: '',
	aiReviewDuration: undefined as unknown as number,
	manualReviewDuration: undefined as unknown as number,
	aiReviewChecklists: [],
	manualReviewChecklists: [],
})
const getDetail = () => {
	if (loading.value) return
	loading.value = true
	reviewAgentDetail(id)
		.then((res) => {
			Object.assign(detailData, res.data)
			routerStore.setCacheValueCode(routePath, res.data.name)
		})
		.finally(() => {
			loading.value = false
		})
}
const editPath = `${parentPath}/edit/${id}`
const onEdit = () => {
	router.push(editPath)
}

const onDelete = () => {
	deleteBox({
		params: detailData.id,
		api: reviewAgentDelete,
		editPath,
	}).then(() => {
		sameChannel.send('refresh')
		routerStore.goParentRoute(parentPath)
	})
}

onMounted(() => {
	getDetail()
})
</script>
