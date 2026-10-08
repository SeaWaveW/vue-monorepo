<template>
	<div class="user-group-form">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="CLIENT_USER_GROUP_CREATE"
					:loading="createLoading"
					icon="antOutline-check-circle"
					data-icon-color="var(--success-color)"
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
				:disabled="createLoading"
				label-position="top"
			>
				<SacoFormItem :label="t('user_group_name')" prop="name">
					<SacoInput
						v-model="formModel.name"
						:maxlength="CLIENT_USER_GROUP_NAME_MAX_LENGTH"
					/>
				</SacoFormItem>
				<SacoFormItem :label="t('client_subject')" prop="tenantId">
					<SacoSelect
						v-model="formModel.tenantId"
						:data="tenantList"
						field-label="name"
						field-value="id"
						:loading="tenantLoading"
						:loading-text="t('fetching')"
						:clearable="true"
						:filterable="true"
					/>
				</SacoFormItem>
				<SacoFormItem
					:label="t('remark')"
					prop="remark"
					:style="{ '--column-span': 2 }"
				>
					<SacoTextarea
						v-model="formModel.remark"
						:max-length="CLIENT_USER_GROUP_REMARK_MAX_LENGTH"
						:rows="1"
					/>
				</SacoFormItem>
			</SacoForm>
		</SacoCard>
		<SacoCard
			class="navigation-card"
			:header="t('navigation_authorization')"
		>
			<SacoTree
				ref="navigationRef"
				show-checkbox
				default-expand-all
				:data="navigationList"
				:default-checked-keys="formModel.navigationIds"
				icon="ze-arrow-down"
				node-key="id"
				:props="{
					label: navigationLabel,
				}"
			/>
		</SacoCard>
		<SacoCard class="function-card">
			<template #header>
				{{ t('function_authorization') }}
				<SacoButton
					v-power="CLIENT_FUNCTION_PAGE"
					icon="riLine-checkbox-multiple-line"
					@click="selectFunctionVisible = true"
				>
					{{ t('selection_function') }}
				</SacoButton>
			</template>
			<SacoTable
				height="100%"
				:data="apis"
				@row-dblclick="noTransferDblClick"
			>
				<SacoTableColumn
					:label="t('function_name')"
					prop="name"
					width="308px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('remark')"
					prop="remark"
					width="523px"
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

		<SelectFunction v-model="selectFunctionVisible" v-model:apis="apis" />
	</div>
</template>
<script lang="ts" setup name="ClientUserGroupManageAdd">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { getNavigationLocaleName } from '#/i18n'

import { useSameChannel } from '#/utils/broadcast'
import { leachFormatter } from '#/utils/formatter'
import { noTransferDblClick } from '#/utils/message'
import { useRouterStore } from '#/store'
import SelectFunction from '@/components/client-user-group-manage/select-function.vue'
const { t, locale } = useI18n()
const parentPath = '/client-user-group-manage'
const navigationLabel = computed(() => getNavigationLocaleName(locale.value))
const routerStore = useRouterStore()
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<ClientUserGroupCreateData>({
	name: '',
	tenantId: undefined as unknown as number,
	remark: '',
	navigationIds: [],
	functionIds: [],
})
const { tenantList, tenantLoading, loadTenantList } = useClientTenantOptions()
const formRules = computed<FormRules>(() => ({
	name: [
		{
			required: true,
			message: t('validate_please_enter_any', [t('user_group_name')]),
		},
	],
	tenantId: [
		{
			type: 'number',
			required: true,
			message: t('validate_please_select_any', [t('client_subject')]),
		},
	],
	remark: [
		{
			required: false,
			message: t('validate_please_enter_any', [t('remark')]),
		},
	],
}))
const sameChannel = useSameChannel(parentPath)

const navigationRef = ref<TreeExpose | null>(null)
const navigationList = ref<ClientNavigationTreeResponse>([])
const getNavigationTree = () => {
	clientNavigationTree().then((res) => {
		navigationList.value = res.data || []
	})
}
const selectFunctionVisible = ref(false)
const apis = ref<ClientFunctionPageRecord[]>([])
const handleRemove = (index: number) => {
	apis.value.splice(index, 1)
}

const createLoading = ref(false)
const handleComplete = () => {
	formRef.value?.validate((valid: boolean) => {
		if (!valid) return
		createLoading.value = true
		const { navigationIds, functionIds, ...rest } = formModel
		const checkedKeys = [
			...(navigationRef.value?.getCheckedKeys() ?? []),
			...(navigationRef.value?.getHalfCheckedKeys() ?? []),
		]
		const checkedNavigationIds = checkedKeys.filter(
			(key): key is number => typeof key === 'number',
		)
		clientUserGroupCreate({
			...rest,
			navigationIds: checkedNavigationIds,
			functionIds: apis.value.map((item) => item.id),
		})
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
onMounted(() => {
	loadTenantList()
	getNavigationTree()
})
</script>
<style lang="scss" scoped>
@use '../../style/user-group-form.scss';
</style>
