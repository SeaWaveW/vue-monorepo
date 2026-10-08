<template>
	<div v-loading="loading" class="ip-manage-detail">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="CLIENT_IP_WHITE_UPDATE"
					icon="md-border_color"
					data-icon-color="var(--black-color-1)"
					:disabled="loading || cloneLoading || updateStatusLoading"
					@click="onEdit"
				>
					{{ t('modify') }}
				</SacoButton>
				<SacoButton
					v-power="CLIENT_IP_WHITE_DELETE"
					icon="riLine-delete-bin-6-line"
					data-icon-color="var(--danger-color)"
					:disabled="loading || cloneLoading || updateStatusLoading"
					@click="onDelete"
				>
					{{ t('delete') }}
				</SacoButton>
				<SacoButton
					v-power="CLIENT_IP_WHITE_CLONE"
					icon="if-ui-copy"
					data-icon-color="var(--black-color-1)"
					:loading="cloneLoading"
					:disabled="loading || updateStatusLoading"
					@click="onCopy"
				>
					{{ t('copy') }}
				</SacoButton>
				<CommonDropdownMenu
					v-power="CLIENT_IP_WHITE_UPDATE_STATUS"
					:model-value="detailData.status"
					:data="clientIpWhiteStatusList"
					:disabled="loading || cloneLoading || updateStatusLoading"
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
				<SacoFormItem :label="t('ip')" prop="ip">
					{{ leachFormatter(detailData.ip) }}
				</SacoFormItem>
				<SacoFormItem :label="t('available_status')" prop="status">
					<SacoText
						:type="clientIpWhiteStatusType[detailData.status]"
					>
						{{ clientIpWhiteStatusFormatter(detailData.status) }}
					</SacoText>
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
<script lang="ts" setup name="IpManageDetail">
import CommonDropdownMenu from '#/components/dropdown-menu/index.vue'
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useSameChannel } from '#/utils/broadcast'
import { getRouterParams } from '#/utils/router'
import { leachFormatter, hmdhmsFormatter } from '#/utils/formatter'
import { deleteBox } from '#/utils/message'
import { useRouterStore } from '#/store'
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const routePath = route.path
const routerStore = useRouterStore()
const { id } = getRouterParams<[number]>(['id'])
const parentPath = '/ip-manage'
const sameChannel = useSameChannel(parentPath)
const loading = ref(false)
const detailData = reactive({} as ClientIpWhiteDetailResponse)
const { clientIpWhiteStatusList, clientIpWhiteStatusFormatter } =
	useClientIpWhiteStatus()
const getDetail = () => {
	if (loading.value) return
	loading.value = true
	clientIpWhiteDetail(id)
		.then((res) => {
			Object.assign(detailData, res.data)
			routerStore.setCacheValueCode(routePath, res.data.ip)
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
		api: clientIpWhiteDelete,
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
	clientIpWhiteClone(detailData.id)
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
const updateStatusLoading = ref(false)
const onUpdateStatus = (
	item: (typeof clientIpWhiteStatusList.value)[number],
) => {
	if (detailData.status === item.value) return
	updateStatusLoading.value = true
	clientIpWhiteUpdateStatus({
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
