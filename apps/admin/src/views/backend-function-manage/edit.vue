<template>
	<div v-loading="loading" class="backend-function-manage-edit">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="ADMIN_FUNCTION_UPDATE"
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
		<SacoCard class="base-card" :header="t('basic_information')">
			<SacoForm
				ref="formRef"
				:model="formModel"
				:rules="formRules"
				:disabled="loading || updateLoading"
				label-position="top"
			>
				<SacoFormItem :label="t('function_name')" prop="name">
					<SacoInput
						v-model="formModel.name"
						:maxlength="ADMIN_FUNCTION_NAME_MAX_LENGTH"
					/>
				</SacoFormItem>
				<SacoFormItem
					:label="t('remark')"
					prop="remark"
					:style="{ '--column-span': 2 }"
				>
					<SacoTextarea
						v-model="formModel.remark"
						:max-length="ADMIN_FUNCTION_REMARK_MAX_LENGTH"
						:rows="1"
					/>
				</SacoFormItem>
			</SacoForm>
		</SacoCard>
		<SacoCard class="function-card">
			<template #header>
				{{ t('function_interface') }}
				<SacoButton
					v-power="ADMIN_API_PAGE"
					icon="riLine-checkbox-multiple-line"
					:disabled="loading || updateLoading"
					@click="selectFunctionModel = true"
				>
					{{ t('choice_interface') }}
				</SacoButton>
			</template>
			<SacoTable
				:data="formModel.apis"
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
					:formatter="adminApiLevelFormatter"
					width="259px"
				/>
				<SacoTableColumn
					:label="t('remark')"
					prop="remark"
					width="416px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn :label="t('operation')" width="115px">
					<template #default="{ $index }">
						<SacoText type="danger" @click="handleRemove($index)">
							{{ t('remove') }}
						</SacoText>
					</template>
				</SacoTableColumn>
			</SacoTable>
		</SacoCard>
		<SelectFunction
			v-model="selectFunctionModel"
			v-model:apis="formModel.apis"
		/>
	</div>
</template>
<script lang="ts" setup name="BackendFunctionManageEdit">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useSameChannel } from '#/utils/broadcast'
import { leachFormatter } from '#/utils/formatter'
import { noTransferDblClick } from '#/utils/message'
import { getRouterParams } from '#/utils/router'
import { useRouterStore } from '#/store'
import SelectFunction from '@/components/backend-function-manage/select-function.vue'
const { t } = useI18n()
const routerStore = useRouterStore()
const route = useRoute()
const routePath = route.path
const { id } = getRouterParams<[number]>(['id'])
const parentPath = '/backend-function-manage'
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<AdminFunctionDetailResponse>({
	id,
	name: '',
	remark: '',
	apis: [],
})
const formRules = computed<FormRules>(() => ({
	name: [
		{
			required: true,
			message: t('validate_please_enter_any', [t('function_name')]),
		},
	],
	remark: [
		{
			required: false,
			message: t('validate_please_enter_any', [t('remark')]),
		},
	],
}))
const { adminApiLevelFormatter } = useAdminApiLevel()
const sameChannel = useSameChannel(parentPath)
const selectFunctionModel = ref(false)
const handleRemove = (index: number) => {
	formModel.apis.splice(index, 1)
}
const loading = ref(false)
const getDetail = () => {
	if (loading.value) return
	loading.value = true
	adminFunctionDetail(id)
		.then((res) => {
			Object.assign(formModel, res.data)
			routerStore.setCacheValueCode(routePath, res.data.name)
		})
		.finally(() => {
			loading.value = false
		})
}
const updateLoading = ref(false)
const handleComplete = () => {
	formRef.value?.validate((valid: boolean) => {
		if (!valid) return
		updateLoading.value = true
		const { apis, ...rest } = formModel
		adminFunctionUpdate({
			...rest,
			apiIds: apis.map((item) => item.id),
		})
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
onMounted(() => {
	getDetail()
})
</script>
<style lang="scss" scoped>
@use '../../style/function-form.scss';
</style>
