<template>
	<div v-loading="loading" class="client-subject-manage-detail">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="CLIENT_TENANT_UPDATE"
					icon="md-border_color"
					data-icon-color="var(--black-color-1)"
					:disabled="loading || updateStatusLoading"
					@click="onEdit"
				>
					{{ t('modify') }}
				</SacoButton>
				<SacoButton
					v-power="CLIENT_TENANT_DELETE"
					icon="riLine-delete-bin-6-line"
					data-icon-color="var(--danger-color)"
					:disabled="loading || updateStatusLoading"
					@click="onDelete"
				>
					{{ t('delete') }}
				</SacoButton>
				<CommonDropdownMenu
					v-power="CLIENT_TENANT_UPDATE_STATUS"
					:model-value="detailData.status"
					:data="clientTenantStatusList"
					:disabled="loading || updateStatusLoading"
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
				<SacoFormItem :label="t('subject_name')" prop="name">
					{{ leachFormatter(detailData.name) }}
				</SacoFormItem>
				<SacoFormItem :label="t('available_status')" prop="status">
					<SacoText
						:type="clientTenantStatusType[detailData.status!]"
					>
						{{ clientTenantStatusFormatter(detailData.status) }}
					</SacoText>
				</SacoFormItem>
				<SacoFormItem :label="t('subject_type')" prop="type">
					{{ clientTenantTypeFormatter(detailData.type) }}
				</SacoFormItem>
				<SacoFormItem
					:label="t('use_effective_time')"
					prop="validUntil"
				>
					{{ ymdFormatter(detailData.validUntil) }}
				</SacoFormItem>
				<SacoFormItem :label="t('address')" prop="address">
					{{ leachFormatter(detailData.address) }}
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
<script lang="ts" setup name="ClientSubjectManageDetail">
import CommonDropdownMenu from '#/components/dropdown-menu/index.vue'
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useSameChannel } from '#/utils/broadcast'
import { getRouterParams } from '#/utils/router'
import {
	leachFormatter,
	hmdhmsFormatter,
	ymdFormatter,
} from '#/utils/formatter'
import { deleteBox } from '#/utils/message'
import { useRouterStore } from '#/store'
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const routePath = route.path
const routerStore = useRouterStore()
const { id } = getRouterParams<[number]>(['id'])
const parentPath = '/client-subject-manage'
const sameChannel = useSameChannel(parentPath)
const loading = ref(false)
const detailData = reactive({} as ClientTenantDetailResponse)
const { clientTenantStatusList, clientTenantStatusFormatter } =
	useClientTenantStatus()
const { clientTenantTypeFormatter } = useClientTenantType()
const getDetail = () => {
	if (loading.value) return
	loading.value = true
	clientTenantDetail(id)
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
		api: clientTenantDelete,
		editPath,
	}).then(() => {
		sameChannel.send('refresh')
		routerStore.goParentRoute(parentPath)
	})
}

const updateStatusLoading = ref(false)
const onUpdateStatus = (
	item: (typeof clientTenantStatusList.value)[number],
) => {
	if (detailData.status === item.value) return
	updateStatusLoading.value = true
	clientTenantUpdateStatus({
		id: detailData.id,
		status: item.value,
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

<style lang="scss" scoped>
@use '../../style/detail-dropdown.scss';
</style>
