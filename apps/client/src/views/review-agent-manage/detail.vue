<template>
	<div v-loading="loading" class="review-agent-manage-detail">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="REVIEW_AGENT_UPDATE_STATUS"
					icon="md-power_settings"
					data-icon-color="var(--success-color)"
					:disabled="loading || updateStatusLoading"
					@click="onUpdateStatus(ReviewAgentStatus.Available)"
				>
					{{ t('enable') }}
				</SacoButton>
				<SacoButton
					v-power="REVIEW_AGENT_UPDATE_STATUS"
					icon="md-block"
					data-icon-color="var(--danger-color)"
					:disabled="loading || updateStatusLoading"
					@click="onUpdateStatus(ReviewAgentStatus.Disabled)"
				>
					{{ t('disabled') }}
				</SacoButton>
			</template>
		</CommonTeleportNav>
		<SacoCard :header="t('basic_information')">
			<SacoForm label-position="top" label-suffix="：">
				<SacoFormItem :label="t('agent_name')" prop="name">
					{{ leachFormatter(detailData.name) }}
				</SacoFormItem>
				<SacoFormItem :label="t('available_status')" prop="status">
					<SacoText :type="reviewAgentStatusType[detailData.status!]">
						{{ reviewAgentStatusFormatter(detailData.status) }}
					</SacoText>
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
		<SacoCard :header="t('control_artificial_list')">
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
		<SacoCard :header="t('form_design_preview')" class="preview-card">
			<CommonDynamicPreview
				:components="components"
				:proportion="proportion"
			/>
		</SacoCard>
	</div>
</template>
<script lang="ts" setup name="ReviewAgentManageDetail">
import CommonDynamicPreview from '#/components/dynamic-preview/index.vue'
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useSameChannel } from '#/utils/broadcast'
import { getRouterParams } from '#/utils/router'
import { leachFormatter, reviewDurationFormatter } from '#/utils/formatter'
import { noTransferDblClick } from '#/utils/message'
import { PROPORTION_DEFAULT_SIZE } from '#/utils/proportion'
import { useRouterStore } from '#/store'
import { ReviewAgentStatus } from '@/api/enum/review-agent/status'

const { t } = useI18n()
const route = useRoute()
const routePath = route.path
const routerStore = useRouterStore()
const { id } = getRouterParams<[number]>(['id'])
const parentPath = '/review-agent-manage'
const sameChannel = useSameChannel(parentPath)
const { reviewAgentStatusFormatter } = useReviewAgentStatus()
const loading = ref(false)
const updateStatusLoading = ref(false)
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
const components = computed(() => {
	const list = detailData.dynamicForm?.schemaJson?.components
	return Array.isArray(list) ? list : []
})
const proportion = computed(() => {
	return detailData.dynamicForm?.widthLevel ?? PROPORTION_DEFAULT_SIZE
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
const onUpdateStatus = (status: ReviewAgentStatus) => {
	if (detailData.status === status || updateStatusLoading.value) return
	updateStatusLoading.value = true
	reviewAgentUpdateStatus({
		id: detailData.id,
		status,
	})
		.then(() => {
			SacoMessage.success(t('status_modified_successfully'))
			sameChannel.send('refresh')
			getDetail()
		})
		.finally(() => {
			updateStatusLoading.value = false
		})
}

onMounted(() => {
	getDetail()
})
</script>
<style scoped lang="scss">
.review-agent-manage-detail {
	:deep(.preview-card) {
		width: 1139px;
		padding-right: 0;
		padding-left: 0;
		margin-top: calc(var(--common-gap) * 2.5);
		margin-right: auto;
		margin-left: auto;
		border-radius: 20px !important;
		box-shadow: 0 0 7px 1px var(--grey-color-16);

		.saco-card__header {
			padding-right: var(--card-x-padding);
			padding-left: var(--card-x-padding);
			font-size: 18px;
			font-weight: var(--font-bold);
		}

		.saco-card__body {
			padding: 0 var(--common-gap);
		}
	}
}
</style>
