<template>
	<div v-loading="loading" class="backend-ip-manage-detail">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="ADMIN_API_UPDATE"
					icon="md-border_color"
					data-icon-color="var(--black-color-1)"
					:disabled="loading"
					@click="onEdit"
				>
					{{ t('modify') }}
				</SacoButton>
				<SacoButton
					v-power="ADMIN_API_DELETE"
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
				<SacoFormItem :label="t('interface_name')" prop="name">
					{{ leachFormatter(detailData.name) }}
				</SacoFormItem>
				<SacoFormItem :label="t('access_level')" prop="level">
					{{ adminApiLevelFormatter(detailData.level) }}
				</SacoFormItem>
				<SacoFormItem
					:label="t('interface_url')"
					prop="path"
					:style="{ '--column-span': 3 }"
				>
					{{ leachFormatter(detailData.path) }}
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
					{{ hmdhmsFormatter(detailData.createTime!) }}
				</SacoFormItem>
				<SacoFormItem :label="t('modify_user')" prop="editUserName">
					{{ leachFormatter(detailData.editUserName) }}
				</SacoFormItem>
				<SacoFormItem :label="t('modification_time')" prop="editTime">
					{{ hmdhmsFormatter(detailData.editTime!) }}
				</SacoFormItem>
			</SacoForm>
		</SacoCard>
	</div>
</template>
<script lang="ts" setup name="BackendInterfaceManageDetail">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { getRouterParams } from '#/utils/router'
import { useSameChannel } from '#/utils/broadcast'
import { leachFormatter, hmdhmsFormatter } from '#/utils/formatter'
import { deleteBox } from '#/utils/message'
import { useRouterStore } from '#/store'
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const routePath = route.path
const routerStore = useRouterStore()
const { id } = getRouterParams<[number]>(['id'])
const parentPath = '/backend-interface-manage'
const sameChannel = useSameChannel(parentPath)
const loading = ref(false)
const detailData = reactive(
	{} as Awaited<ReturnType<typeof adminApiDetail>>['data'],
)
const { adminApiLevelFormatter } = useAdminApiLevel()
const getDetail = () => {
	if (loading.value) return
	loading.value = true
	adminApiDetail(id)
		.then((res) => {
			Object.assign(detailData, res.data)
			routerStore.setCacheValueCode(routePath, res.data.name)
		})
		.finally(() => {
			loading.value = false
		})
}
// sameChannel.on((payload: string) => {
// 	if (Number(payload) === id) {
// 		getDetail()
// 	}
// })
const editPath = `${parentPath}/edit/${id}`
const onEdit = () => {
	router.push(editPath)
}

const onDelete = () => {
	deleteBox({
		params: detailData.id,
		api: adminApiDelete,
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
@use '../../style/detail-dropdown.scss';
</style>
