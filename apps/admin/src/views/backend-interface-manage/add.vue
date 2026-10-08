<template>
	<div class="backend-interface-manage-add">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="ADMIN_API_CREATE"
					:loading="createLoading"
					icon="antOutline-check-circle"
					data-icon-color="var(--success-color)"
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
				:disabled="createLoading"
				label-position="top"
			>
				<SacoFormItem :label="t('interface_name')" prop="name">
					<SacoInput
						v-model="formModel.name"
						:maxlength="ADMIN_API_NAME_MAX_LENGTH"
					/>
				</SacoFormItem>
				<SacoFormItem :label="t('access_level')" prop="level">
					<SacoSelect
						v-model="formModel.level"
						:data="adminApiLevelList"
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
						:maxlength="ADMIN_API_PATH_MAX_LENGTH"
					/>
				</SacoFormItem>
				<SacoFormItem
					:label="t('remark')"
					prop="remark"
					:style="{ '--column-span': 2 }"
				>
					<SacoTextarea
						v-model="formModel.remark"
						:max-length="ADMIN_API_REMARK_MAX_LENGTH"
						:rows="1"
					/>
				</SacoFormItem>
			</SacoForm>
		</SacoCard>
	</div>
</template>
<script lang="ts" setup name="SystemInterfaceManageAdd">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useSameChannel } from '#/utils/broadcast'
import { useRouterStore } from '#/store'
const { t } = useI18n()
const parentPath = '/backend-interface-manage'
const routerStore = useRouterStore()
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<AdminApiCreateData>({
	name: '',
	path: '',
	level: undefined as unknown as AdminApiLevel,
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
const { adminApiLevelList } = useAdminApiLevel()
const sameChannel = useSameChannel(parentPath)

const createLoading = ref(false)
const handleComplete = () => {
	formRef.value?.validate((valid: boolean) => {
		if (!valid) return
		createLoading.value = true
		adminApiCreate(formModel)
			.then(() => {
				SacoMessage.success(t('addition_successful'))
				sameChannel.send('reload')
				routerStore.goParentRoute(parentPath)
			})
			.finally(() => {
				createLoading.value = false
			})
	})
}
</script>
