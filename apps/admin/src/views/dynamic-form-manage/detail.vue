<template>
	<div v-loading="loading" class="dynamic-form-manage-detail">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="DYNAMIC_FORM_UPDATE"
					icon="md-border_color"
					data-icon-color="var(--black-color-1)"
					:disabled="loading || cloneLoading || checkLoading"
					@click="onEditBasic"
				>
					{{ t('modify_basic_information') }}
				</SacoButton>
				<SacoButton
					v-power="[DYNAMIC_FORM_UPDATE_SCHEMA, DYNAMIC_FORM_IS_USED]"
					icon="antOutline-edit"
					data-icon-color="var(--black-color-1)"
					:loading="checkLoading"
					:disabled="loading || cloneLoading"
					@click="onEditSchema"
				>
					{{ t('modify_dynamic_form') }}
				</SacoButton>
				<SacoButton
					v-power="DYNAMIC_FORM_DELETE"
					icon="riLine-delete-bin-6-line"
					data-icon-color="var(--danger-color)"
					:disabled="loading || cloneLoading || checkLoading"
					@click="onDelete"
				>
					{{ t('delete') }}
				</SacoButton>
				<SacoButton
					v-power="DYNAMIC_FORM_CLONE"
					icon="if-ui-copy"
					data-icon-color="var(--black-color-1)"
					:loading="cloneLoading"
					:disabled="loading || checkLoading"
					@click="onCopy"
				>
					{{ t('copy') }}
				</SacoButton>
				<CommonDropdownMenu
					v-power="DYNAMIC_FORM_UPDATE_STATUS"
					:model-value="detailData.status"
					:data="dynamicFormStatusList"
					:disabled="loading || cloneLoading || checkLoading"
					@command="onUpdateStatus"
				>
					<SacoSvg
						name="iconPark-double-down"
						class="dropdown-menu-icon"
					/>
				</CommonDropdownMenu>
			</template>
		</CommonTeleportNav>
		<SacoCard :header="t('basic_information')">
			<SacoForm label-position="top" label-suffix="：">
				<SacoFormItem :label="t('dynamic_form_name')" prop="name">
					{{ leachFormatter(detailData.name) }}
				</SacoFormItem>
				<SacoFormItem :label="t('available_status')" prop="status">
					<SacoText :type="dynamicFormStatusType[detailData.status]">
						{{ dynamicFormStatusFormatter(detailData.status) }}
					</SacoText>
				</SacoFormItem>
				<SacoFormItem :label="t('data_status')" prop="isDraft">
					<SacoText
						:type="dynamicFormIsDraftType[detailData.isDraft]"
					>
						{{ dynamicFormIsDraftFormatter(detailData.isDraft) }}
					</SacoText>
				</SacoFormItem>
				<SacoFormItem :label="t('remark')" prop="remark">
					{{ leachFormatter(detailData.remark) }}
				</SacoFormItem>
			</SacoForm>
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
		<SacoCard :header="t('form_design_preview')" class="preview-card">
			<CommonDynamicPreview
				:components="components"
				:proportion="proportion"
			/>
		</SacoCard>
		<DynamicFormEditBasicDialog
			v-model="editBasicVisible"
			:detail="detailData"
			@success="onEditBasicSuccess"
		/>
	</div>
</template>
<script lang="ts" setup name="DynamicFormManageDetail">
import CommonDropdownMenu from '#/components/dropdown-menu/index.vue'
import CommonDynamicPreview from '#/components/dynamic-preview/index.vue'
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useSameChannel } from '#/utils/broadcast'
import { getRouterParams } from '#/utils/router'
import { leachFormatter, hmdhmsFormatter } from '#/utils/formatter'
import { deleteBox } from '#/utils/message'
import { PROPORTION_DEFAULT_SIZE } from '#/utils/proportion'
import { useRouterStore } from '#/store'
import type { ComponentItem } from '#/dynamic'
import DynamicFormEditBasicDialog from '@/components/dynamic-form-manage/edit-basic-dialog.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const routePath = route.path
const routerStore = useRouterStore()
const { id } = getRouterParams<[number]>(['id'])
const parentPath = '/dynamic-form-manage'
const sameChannel = useSameChannel(parentPath)
const { dynamicFormStatusList, dynamicFormStatusFormatter } =
	useDynamicFormStatus()
const { dynamicFormIsDraftFormatter } = useDynamicFormIsDraft()
const loading = ref(false)
const detailData = reactive({} as DynamicFormDetailResponse)
const components = ref<ComponentItem[]>([])
const proportion = ref<TabPaneName>(PROPORTION_DEFAULT_SIZE)
const editBasicVisible = ref(false)
const editPath = `${parentPath}/edit/${id}`

const getSchemaComponents = (schemaJson?: DynamicFormSchemaJson) => {
	const list = schemaJson?.components
	return Array.isArray(list) ? list : []
}

const getDetail = () => {
	if (loading.value) return
	loading.value = true
	dynamicFormDetail(id)
		.then((res) => {
			Object.assign(detailData, res.data)
			components.value = getSchemaComponents(res.data.schemaJson)
			proportion.value = res.data.widthLevel ?? PROPORTION_DEFAULT_SIZE
			routerStore.setCacheValueCode(routePath, res.data.name)
		})
		.finally(() => {
			loading.value = false
		})
}

const onEditBasic = () => {
	editBasicVisible.value = true
}

const onEditBasicSuccess = () => {
	sameChannel.send('refresh')
	getDetail()
}

const checkLoading = ref(false)
const onEditSchema = () => {
	if (checkLoading.value) return
	checkLoading.value = true
	dynamicFormIsUsed(id)
		.then((res) => {
			if (res.data) {
				SacoMessageBox({
					title: t('message'),
					message: t('dynamic_check_message'),
					confirmButtonText: t('confirm'),
				})
				return
			}
			router.push(editPath)
		})
		.finally(() => {
			checkLoading.value = false
		})
}

const onDelete = () => {
	deleteBox({
		params: detailData.id,
		api: dynamicFormDelete,
		editPath,
	}).then(() => {
		sameChannel.send('refresh')
		routerStore.goParentRoute(parentPath)
	})
}

const cloneLoading = ref(false)
const onCopy = () => {
	if (cloneLoading.value) return
	cloneLoading.value = true
	dynamicFormClone(detailData.id)
		.then((res) => {
			SacoMessage.success(t('copy_successfully'))
			sameChannel.send('refresh')
			const path = route.path
			router.push(`${parentPath}/edit/${res.data}`).then(() => {
				routerStore.delCache(path)
			})
		})
		.finally(() => {
			cloneLoading.value = false
		})
}

const onUpdateStatus = (item: (typeof dynamicFormStatusList.value)[number]) => {
	if (detailData.status === item.value) return
	dynamicFormUpdateStatus({
		id: detailData.id,
		status: item.value,
	}).then(() => {
		SacoMessage.success(t('status_modified_successfully'))
		sameChannel.send('refresh')
		getDetail()
	})
}

onMounted(() => {
	getDetail()
})
</script>
<style lang="scss" scoped>
@use '../../style/detail-dropdown.scss';

:deep(.preview-card) {
	width: 1139px;
	padding-right: 0;
	padding-left: 0;
	margin-top: calc(var(--common-gap) * 2.5);
	margin-right: auto;
	margin-left: auto;
	border-radius: 20px !important;
	box-shadow: 0 0 7px 1px var(--grey-color-16);

	.sqt-card__header {
		padding-right: var(--card-x-padding);
		padding-left: var(--card-x-padding);
		font-size: 18px;
		font-weight: var(--font-bold);
	}

	.sqt-card__body {
		padding: 0 var(--common-gap);
	}
}
</style>
