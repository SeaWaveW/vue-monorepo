<template>
	<div v-loading="loading" class="user-group-form">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="CLIENT_USER_GROUP_UPDATE"
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
				:disabled="updateLoading"
				label-position="top"
			>
				<SacoFormItem :label="t('user_group_name')" prop="name">
					<SacoInput
						v-model="formModel.name"
						:maxlength="CLIENT_USER_GROUP_NAME_MAX_LENGTH"
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
					width="522px"
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
<script lang="ts" setup name="UserGroupManageEdit">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { getNavigationLocaleName } from '#/i18n'

import { useSameChannel } from '#/utils/broadcast'
import { getRouterParams } from '#/utils/router'
import { leachFormatter } from '#/utils/formatter'
import { noTransferDblClick, confirmBox } from '#/utils/message'
import { treeToFlat } from '#/utils/tree'
import { useRouterStore } from '#/store'
import SelectFunction from '@/components/user-group-manage/select-function.vue'
const { t, locale } = useI18n()
const navigationLabel = computed(() => getNavigationLocaleName(locale.value))
const routerStore = useRouterStore()
const route = useRoute()
const routePath = route.path
const { id } = getRouterParams<[number]>(['id'])
const parentPath = '/user-group-manage'
const sameChannel = useSameChannel(parentPath)
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<ClientUserGroupUpdateData>({
	id,
	name: '',
	remark: '',
	navigationIds: [],
	functionIds: [],
})
const formRules = computed<FormRules>(() => ({
	name: [
		{
			required: true,
			message: t('validate_please_enter_any', [t('user_group_name')]),
		},
	],
	remark: [
		{
			required: false,
			message: t('validate_please_enter_any', [t('remark')]),
		},
	],
}))
const loading = ref(false)
const getDetail = () => {
	if (loading.value) return
	loading.value = true
	clientUserGroupDetail(id)
		.then((res) => {
			const { navigations, functions, ...rest } = res.data
			apis.value = functions
			Object.assign(formModel, {
				...rest,
				navigationIds: treeToFlat(navigations, 'children').map(
					(item) => item.id,
				),
			})
			routerStore.setCacheValueCode(routePath, rest.name)
			nextTick(() => {
				navigationRef.value?.setCheckedKeys(formModel.navigationIds)
			})
		})
		.finally(() => {
			loading.value = false
		})
}
const navigationRef = ref<TreeExpose | null>(null)
const navigationList = ref<ClientNavigationTreeResponse>([])
const getNavigationTree = () => {
	clientNavigationTree().then((res) => {
		navigationList.value = res.data || []
		nextTick(() => {
			navigationRef.value?.setCheckedKeys(formModel.navigationIds)
		})
	})
}

const selectFunctionVisible = ref(false)
const apis = ref<ClientFunctionPageRecord[]>([])
const handleRemove = (index: number) => {
	apis.value.splice(index, 1)
}

const updateLoading = ref(false)
const handleComplete = () => {
	formRef.value?.validate((valid: boolean) => {
		if (!valid) return
		const { navigationIds, functionIds, ...rest } = formModel
		const checkedKeys = [
			...(navigationRef.value?.getCheckedKeys() ?? []),
			...(navigationRef.value?.getHalfCheckedKeys() ?? []),
		]
		const checkedNavigationIds = checkedKeys.filter(
			(key): key is number => typeof key === 'number',
		)
		confirmBox({
			title: 'modify',
			message: 'user_group_edit_message',
			api: clientUserGroupUpdate,
			params: {
				...rest,
				navigationIds: checkedNavigationIds,
				functionIds: apis.value.map((item) => item.id),
			},
			success: 'modified_successfully',
		}).then(() => {
			const parentRoute = routerStore.getParentRoute()
			if (parentRoute?.includes?.('/detail')) {
				routerStore.delCache(parentRoute)
			}
			sameChannel.send('refresh')
			routerStore.goParentRoute(parentPath)
		})
	})
}
onMounted(() => {
	getDetail()
	getNavigationTree()
})
</script>
<style lang="scss" scoped>
@use '../../style/user-group-form.scss';
</style>
