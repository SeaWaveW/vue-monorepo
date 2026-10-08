<template>
	<div v-loading="loading" class="backend-function-manage-detail">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="ADMIN_FUNCTION_UPDATE"
					icon="md-border_color"
					data-icon-color="var(--black-color-1)"
					:disabled="loading"
					@click="onEdit"
				>
					{{ t('modify') }}
				</SacoButton>
				<SacoButton
					v-power="ADMIN_FUNCTION_DELETE"
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
				<SacoFormItem :label="t('function_name')" prop="name">
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
		<SacoCard class="function-card" :header="t('function_interface')">
			<SacoTable
				:data="detailData.apis"
				@row-dblclick="noTransferDblClick"
			>
				<SacoTableColumn :label="t('serial_number')" width="69px">
					<template #default="{ $index }">{{ $index + 1 }}</template>
				</SacoTableColumn>
				<SacoTableColumn
					:label="t('interface_name')"
					prop="name"
					width="423px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('interface_url')"
					prop="path"
					width="610px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('access_level')"
					prop="level"
					width="258px"
					:formatter="adminApiLevelFormatter"
				/>
				<SacoTableColumn
					:label="t('remark')"
					prop="remark"
					width="540px"
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
<script lang="ts" setup name="BackendFunctionManageDetail">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { getRouterParams } from '#/utils/router'
import { useSameChannel } from '#/utils/broadcast'
import { leachFormatter, hmdhmsFormatter } from '#/utils/formatter'
import { noTransferDblClick, deleteBox } from '#/utils/message'
import { useRouterStore } from '#/store'
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const routePath = route.path
const routerStore = useRouterStore()
const { id } = getRouterParams<[number]>(['id'])
const parentPath = '/backend-function-manage'
const sameChannel = useSameChannel(parentPath)
const loading = ref(false)
const detailData = reactive(
	{} as Awaited<ReturnType<typeof adminFunctionDetail>>['data'],
)
const { adminApiLevelFormatter } = useAdminApiLevel()
const getDetail = () => {
	if (loading.value) return
	loading.value = true
	adminFunctionDetail(id)
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
		api: adminFunctionDelete,
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
