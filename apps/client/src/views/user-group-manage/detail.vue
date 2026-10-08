<template>
	<div v-loading="loading" class="user-group-detail">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="CLIENT_USER_GROUP_UPDATE"
					icon="md-border_color"
					data-icon-color="var(--black-color-1)"
					:disabled="loading"
					@click="onEdit"
				>
					{{ t('modify') }}
				</SacoButton>
				<SacoButton
					v-power="CLIENT_USER_GROUP_DELETE"
					icon="riLine-delete-bin-6-line"
					data-icon-color="var(--danger-color)"
					:disabled="loading"
					@click="onDelete"
				>
					{{ t('delete') }}
				</SacoButton>
			</template>
		</CommonTeleportNav>
		<SacoCard class="base-card" :header="t('basic_information')">
			<SacoForm label-position="top" label-suffix="：">
				<SacoFormItem :label="t('user_group_name')" prop="name">
					{{ leachFormatter(detailData.name) }}
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
		<SacoCard
			class="navigation-card"
			:header="t('navigation_authorization')"
		>
			<SacoTree
				default-expand-all
				:data="detailData.navigations"
				icon="ze-arrow-down"
				node-key="id"
				:props="{
					label: navigationLabel,
				}"
			/>
		</SacoCard>
		<SacoCard class="function-card" :header="t('function_authorization')">
			<SacoTable
				height="100%"
				:data="detailData.functions"
				@row-dblclick="noTransferDblClick"
			>
				<SacoTableColumn
					:label="t('function_name')"
					prop="name"
					width="351px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('remark')"
					prop="remark"
					width="593px"
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
<script lang="ts" setup name="UserGroupManageDetail">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { getNavigationLocaleName } from '#/i18n'

import { useSameChannel } from '#/utils/broadcast'
import { leachFormatter, hmdhmsFormatter } from '#/utils/formatter'
import { noTransferDblClick, deleteBox } from '#/utils/message'
import { getRouterParams } from '#/utils/router'
import { useRouterStore } from '#/store'
const { t, locale } = useI18n()
const navigationLabel = computed(() => getNavigationLocaleName(locale.value))
const router = useRouter()
const route = useRoute()
const routePath = route.path
const routerStore = useRouterStore()
const { id } = getRouterParams<[number]>(['id'])
const parentPath = '/user-group-manage'
const sameChannel = useSameChannel(parentPath)
const loading = ref(false)
const detailData = reactive({} as ClientUserGroupDetailResponse)
const getDetail = () => {
	if (loading.value) return
	loading.value = true
	clientUserGroupDetail(id)
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
		api: clientUserGroupDelete,
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
<style lang="scss" scoped>
@use '../../style/user-group-detail.scss';
</style>
