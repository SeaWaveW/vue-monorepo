<template>
	<div v-loading="loading" class="client-user-manage-detail">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="CLIENT_USER_UPDATE"
					icon="md-border_color"
					data-icon-color="var(--black-color-1)"
					:disabled="loading || updateStatusLoading"
					@click="onEdit"
				>
					{{ t('modify') }}
				</SacoButton>
				<SacoButton
					v-power="CLIENT_USER_DELETE"
					icon="riLine-delete-bin-6-line"
					data-icon-color="var(--danger-color)"
					:disabled="loading || updateStatusLoading"
					@click="onDelete"
				>
					{{ t('delete') }}
				</SacoButton>
				<CommonDropdownMenu
					v-power="CLIENT_USER_UPDATE_STATUS"
					:model-value="detailData.status"
					:data="clientUserStatusList"
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
		<SacoCard class="base-card" :header="t('basic_information')">
			<SacoForm label-position="top" label-suffix="：">
				<SacoFormItem :label="t('username')" prop="username">
					{{ leachFormatter(detailData.username) }}
				</SacoFormItem>
				<SacoFormItem :label="t('status')" prop="status">
					<SacoText :type="clientUserStatusType[detailData.status]">
						{{ clientUserStatusFormatter(detailData.status) }}
					</SacoText>
				</SacoFormItem>
				<SacoFormItem :label="t('email')" prop="email">
					{{ leachFormatter(detailData.email) }}
				</SacoFormItem>
				<SacoFormItem :label="t('mobile_phone_number')" prop="phone">
					{{ phoneFormatter(detailData.phone) }}
				</SacoFormItem>
				<SacoFormItem :label="t('client_subject')" prop="tenantName">
					{{ leachFormatter(detailData.tenantName) }}
				</SacoFormItem>
				<SacoFormItem :label="t('avatar')" prop="avatarUrl">
					<CommonImagePreview :src="detailData.avatarUrl" />
				</SacoFormItem>
				<SacoFormItem :label="t('remark')" prop="remark">
					{{ leachFormatter(detailData.remark) }}
				</SacoFormItem>
			</SacoForm>
		</SacoCard>
		<SacoCard class="function-card" :header="t('granting_user_groups')">
			<SacoTable
				:data="detailData.userGroups"
				@row-dblclick="noTransferDblClick"
			>
				<SacoTableColumn
					:label="t('user_group_name')"
					prop="name"
					width="542px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('remark')"
					prop="remark"
					width="1357px"
					:formatter="leachFormatter"
				/>
			</SacoTable>
		</SacoCard>
		<SacoCard class="audit-card" :header="t('audit_information')">
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
<script lang="ts" setup name="ClientUserManageDetail">
import CommonDropdownMenu from '#/components/dropdown-menu/index.vue'
import CommonImagePreview from '#/components/image-preview/index.vue'
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useSameChannel } from '#/utils/broadcast'
import {
	leachFormatter,
	phoneFormatter,
	hmdhmsFormatter,
} from '#/utils/formatter'
import { noTransferDblClick, deleteBox } from '#/utils/message'
import { getRouterParams } from '#/utils/router'
import { useRouterStore } from '#/store'
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const routePath = route.path
const routerStore = useRouterStore()
const { id } = getRouterParams<[number]>(['id'])
const parentPath = '/client-user-manage'
const sameChannel = useSameChannel(parentPath)
const loading = ref(false)
const detailData = reactive({} as ClientUserDetailResponse)
const { clientUserStatusList, clientUserStatusFormatter } =
	useClientUserStatus()
const getDetail = () => {
	if (loading.value) return
	loading.value = true
	clientUserDetail(id)
		.then((res) => {
			Object.assign(detailData, res.data)
			routerStore.setCacheValueCode(routePath, res.data.username)
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
		api: clientUserDelete,
		editPath,
	}).then(() => {
		sameChannel.send('refresh')
		routerStore.goParentRoute(parentPath)
	})
}
const updateStatusLoading = ref(false)
const onUpdateStatus = (item: (typeof clientUserStatusList.value)[number]) => {
	if (detailData.status === item.value) return
	updateStatusLoading.value = true
	clientUserUpdateStatus({
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
