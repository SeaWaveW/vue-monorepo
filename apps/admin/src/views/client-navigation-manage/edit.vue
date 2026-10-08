<template>
	<div v-loading="loading" class="client-navigation-manage-add">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="CLIENT_NAVIGATION_UPDATE"
					:loading="updateLoading"
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
				:disabled="updateLoading"
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
								? CLIENT_NAVIGATION_CHINESE_NAME_MAX_LENGTH
								: CLIENT_NAVIGATION_ENGLISH_NAME_MAX_LENGTH
						"
					/>
				</SacoFormItem>
				<SacoFormItem :label="t('display_number')" prop="serial">
					<SacoNumber v-model="(formModel.serial as any)" :min="0" />
				</SacoFormItem>
				<SacoFormItem :label="t('page_path')" prop="pagePath">
					<SacoInput
						v-model="formModel.pagePath"
						:maxlength="CLIENT_NAVIGATION_PAGE_PATH_MAX_LENGTH"
					/>
				</SacoFormItem>
				<SacoFormItem
					:label="t('remark')"
					prop="remark"
					:style="{ '--column-span': 2 }"
				>
					<SacoTextarea
						v-model="formModel.remark"
						:max-length="CLIENT_NAVIGATION_REMARK_MAX_LENGTH"
						:rows="1"
					/>
				</SacoFormItem>
			</SacoForm>
		</SacoCard>
	</div>
</template>
<script lang="ts" setup name="ClientNavigationManageEdit">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { languageList, getNavigationLocaleName } from '#/i18n'

import { getRouterParams } from '#/utils/router'
import { useSameChannel } from '#/utils/broadcast'
import { leachFormatter } from '#/utils/formatter'
import { useRouterStore } from '#/store'
const { t, locale } = useI18n()
const routerStore = useRouterStore()
const route = useRoute()
const routePath = route.path
const { id } = getRouterParams<[number]>(['id'])
const parentPath = '/client-navigation-manage'
const formRef = ref<FormExpose | null>(null)
const formModel = reactive({} as ClientNavigationDetailResponse)
const parentName = computed(() => {
	return formModel[getNavigationParentLocaleName(locale.value)]
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
const loading = ref(false)
const getDetail = () => {
	if (loading.value) return
	loading.value = true
	clientNavigationDetail(id)
		.then((res) => {
			Object.assign(formModel, res.data)
			routerStore.setCacheValueCode(
				routePath,
				res.data[getNavigationLocaleName(locale.value)],
			)
		})
		.finally(() => {
			loading.value = false
		})
}

const sameChannel = useSameChannel(parentPath)

const updateLoading = ref(false)
const handleComplete = () => {
	formRef.value?.validate((valid: boolean) => {
		if (!valid) return
		updateLoading.value = true
		clientNavigationUpdate(formModel)
			.then(() => {
				SacoMessage.success(t('modified_successfully'))
				sameChannel.send(id)
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
