<template>
	<div v-loading="loading" class="client-interface-manage-edit">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="CLIENT_API_UPDATE"
					:loading="updateLoading"
					icon="antOutline-check-circle"
					data-icon-color="var(--success-color)"
					:disabled="loading"
					@click="handleComplete"
				>
					{{ t('complete') }}
				</SacoButton>
			</template>
		</CommonTeleportNav>
		<SacoCard :header="t('basic_information')">
			<SacoForm
				ref="formRef"
				:model="formModel"
				:rules="formRules"
				:disabled="updateLoading"
				label-position="top"
			>
				<SacoFormItem :label="t('interface_name')" prop="name">
					<SacoInput
						v-model="formModel.name"
						:maxlength="CLIENT_API_NAME_MAX_LENGTH"
					/>
				</SacoFormItem>
				<SacoFormItem :label="t('access_level')" prop="level">
					<SacoSelect
						v-model="formModel.level"
						:data="clientApiLevelList"
						:clearable="true"
						:filterable="true"
					/>
				</SacoFormItem>
				<SacoFormItem
					:label="t('interface_url')"
					prop="path"
					:style="{ '--column-span': 3 }"
				>
					<SacoInput
						v-model="formModel.path"
						:maxlength="CLIENT_API_PATH_MAX_LENGTH"
					/>
				</SacoFormItem>
				<SacoFormItem
					:label="t('remark')"
					prop="remark"
					:style="{ '--column-span': 2 }"
				>
					<SacoTextarea
						v-model="formModel.remark"
						:max-length="CLIENT_API_REMARK_MAX_LENGTH"
						:rows="1"
					/>
				</SacoFormItem>
			</SacoForm>
		</SacoCard>
	</div>
</template>
<script lang="ts" setup name="ClientInterfaceManageEdit">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { getRouterParams } from '#/utils/router'
import { useSameChannel } from '#/utils/broadcast'
import { useRouterStore } from '#/store'
// 页面配置
const { t } = useI18n()
const routerStore = useRouterStore()
const route = useRoute()
const routePath = route.path
const { id } = getRouterParams<[number]>(['id'])
const parentPath = '/client-interface-manage'
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<ClientApiUpdateData>({
	id,
	name: '',
	path: '',
	level: undefined as unknown as ClientApiLevel,
	remark: '',
})
const formRules = computed<FormRules>(() => ({
	name: [
		{
			required: true,
			message: t('validate_please_enter_any', [t('interface_name')]),
		},
	],
	path: [
		{
			required: true,
			message: t('validate_please_enter_any', [t('interface_url')]),
		},
	],
	level: [
		{
			type: 'number',
			required: true,
			message: t('validate_please_select_any', [t('access_level')]),
		},
	],
	remark: [
		{
			required: false,
			message: t('validate_please_enter_any', [t('remark')]),
		},
	],
}))
const { clientApiLevelList } = useClientApiLevel()
const sameChannel = useSameChannel(parentPath)
// 获取详情
const loading = ref(false)
const getDetail = () => {
	if (loading.value) return
	loading.value = true
	clientApiDetail(formModel.id)
		.then((res) => {
			Object.assign(formModel, res.data)
			routerStore.setCacheValueCode(routePath, res.data.name)
		})
		.finally(() => {
			loading.value = false
		})
}
onMounted(() => {
	getDetail()
})
// 修改
const updateLoading = ref(false)
const handleComplete = () => {
	formRef.value?.validate((valid: boolean) => {
		if (!valid) return
		updateLoading.value = true
		clientApiUpdate(formModel)
			.then(() => {
				SacoMessage.success(t('modified_successfully'))
				const parentRoute = routerStore.getParentRoute()
				// 从详情进编辑：详情已过期，先关详情签，否则会回到旧详情
				if (parentRoute?.includes?.('/detail')) {
					routerStore.delCache(parentRoute)
				}
				sameChannel.send('refresh')
				routerStore.goParentRoute(parentPath)
			})
			.finally(() => {
				updateLoading.value = false
			})
	})
}
</script>
