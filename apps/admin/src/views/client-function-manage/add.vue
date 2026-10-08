<template>
	<div class="client-function-manage-add">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="CLIENT_FUNCTION_CREATE"
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
				<SacoFormItem :label="t('function_name')" prop="name">
					<SacoInput
						v-model="formModel.name"
						:maxlength="CLIENT_FUNCTION_NAME_MAX_LENGTH"
					/>
				</SacoFormItem>
				<SacoFormItem
					:label="t('remark')"
					prop="remark"
					:style="{ '--column-span': 2 }"
				>
					<SacoTextarea
						v-model="formModel.remark"
						:max-length="CLIENT_FUNCTION_REMARK_MAX_LENGTH"
						:rows="1"
					/>
				</SacoFormItem>
			</SacoForm>
		</SacoCard>
		<SacoCard class="function-card">
			<template #header>
				{{ t('function_interface') }}
				<SacoButton
					v-power="CLIENT_API_PAGE"
					icon="riLine-checkbox-multiple-line"
					@click="selectFunctionModel = true"
				>
					{{ t('choice_interface') }}
				</SacoButton>
			</template>
			<SacoTable :data="apis" @row-dblclick="noTransferDblClick">
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
					:formatter="clientApiLevelFormatter"
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
		<SelectFunction v-model="selectFunctionModel" v-model:apis="apis" />
	</div>
</template>
<script lang="ts" setup name="ClientFunctionManageAdd">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useSameChannel } from '#/utils/broadcast'
import { leachFormatter } from '#/utils/formatter'
import { noTransferDblClick } from '#/utils/message'
import { useRouterStore } from '#/store'
import SelectFunction from '@/components/client-function-manage/select-function.vue'
const { t } = useI18n()
const parentPath = '/client-function-manage'
const routerStore = useRouterStore()
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<ClientFunctionCreateData>({
	name: '',
	remark: '',
	apiIds: [],
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
const { clientApiLevelFormatter } = useClientApiLevel()
const sameChannel = useSameChannel(parentPath)
const apis = ref<ClientApiPageRecord[]>([])
const handleRemove = (index: number) => {
	apis.value.splice(index, 1)
}

const createLoading = ref(false)
const handleComplete = () => {
	formRef.value?.validate((valid: boolean) => {
		if (!valid) return
		createLoading.value = true
		clientFunctionCreate({
			...formModel,
			apiIds: apis.value.map((item) => item.id),
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

const selectFunctionModel = ref(false)
</script>
<style lang="scss" scoped>
@use '../../style/function-form.scss';
</style>
