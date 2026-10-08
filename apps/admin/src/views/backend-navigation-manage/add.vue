<template>
	<div v-loading="loading" class="backend-navigation-manage-add">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="ADMIN_NAVIGATION_CREATE"
					:loading="createLoading"
					:disabled="loading"
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
				<SacoFormItem :label="t('father_navigation')">
					{{ leachFormatter(parentName) }}
				</SacoFormItem>
				<SacoFormItem
					v-for="language in languageList"
					:key="language"
					:label="t(getNavigationNameLabelKey(language))"
					:prop="getNavigationLocaleName(language)"
				>
					<SacoInput
						v-model="formModel[getNavigationLocaleName(language)]"
						:maxlength="
							language === 'chinese'
								? ADMIN_NAVIGATION_CHINESE_NAME_MAX_LENGTH
								: ADMIN_NAVIGATION_ENGLISH_NAME_MAX_LENGTH
						"
					/>
				</SacoFormItem>
				<SacoFormItem :label="t('display_number')" prop="serial">
					<SacoNumber v-model="(formModel.serial as any)" :min="0" />
				</SacoFormItem>
				<SacoFormItem :label="t('page_path')" prop="pagePath">
					<SacoInput
						v-model="formModel.pagePath"
						:maxlength="ADMIN_NAVIGATION_PAGE_PATH_MAX_LENGTH"
					/>
				</SacoFormItem>
				<SacoFormItem
					:label="t('remark')"
					prop="remark"
					:style="{ '--column-span': 2 }"
				>
					<SacoTextarea
						v-model="formModel.remark"
						:max-length="ADMIN_NAVIGATION_REMARK_MAX_LENGTH"
						:rows="1"
					/>
				</SacoFormItem>
			</SacoForm>
		</SacoCard>
	</div>
</template>
<script lang="ts" setup name="BackendNavigationManageAdd">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { languageList, getNavigationLocaleName } from '#/i18n'

import { getRouterParams } from '#/utils/router'
import { useSameChannel } from '#/utils/broadcast'
import { leachFormatter } from '#/utils/formatter'
import { useRouterStore } from '#/store'
const { t, locale } = useI18n()
const routerStore = useRouterStore()
const { parentId } = getRouterParams<[number]>(['parentId'])
const parentPath = '/backend-navigation-manage'
const formRef = ref<FormExpose | null>(null)
const formModel = reactive<AdminNavigationCreateData>({
	parentId,
	...getEmptyNavigationNames(),
	serial: null as unknown as number,
	pagePath: '',
	remark: '',
})
const formRules = computed<FormRules>(() => {
	const rules: FormRules = {
		serial: [
			{
				required: true,
				type: 'number',
				message: t('validate_please_enter_any', [t('display_number')]),
			},
		],
	}
	languageList.forEach((language) => {
		rules[getNavigationLocaleName(language)] = [
			{
				required: true,
				message: t('validate_please_enter_any', [
					t(getNavigationNameLabelKey(language)),
				]),
			},
		]
	})
	return rules
})
const parentDetail = ref<AdminNavigationDetailResponse>(
	{} as AdminNavigationDetailResponse,
)
const parentName = computed(() => {
	return parentDetail.value[getNavigationLocaleName(locale.value)]
})
const loading = ref(false)
const getParentDetail = () => {
	if (loading.value) return
	loading.value = true
	adminNavigationDetail(parentId)
		.then((res) => {
			parentDetail.value = res.data
		})
		.finally(() => {
			loading.value = false
		})
}

const sameChannel = useSameChannel(parentPath)

const createLoading = ref(false)
const handleComplete = () => {
	formRef.value?.validate((valid: boolean) => {
		if (!valid) return
		createLoading.value = true
		adminNavigationCreate(formModel)
			.then(() => {
				SacoMessage.success(t('addition_successful'))
				sameChannel.send(parentId)
				routerStore.goParentRoute(parentPath)
			})
			.finally(() => {
				createLoading.value = false
			})
	})
}
onMounted(() => {
	getParentDetail()
})
</script>
