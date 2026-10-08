<template>
	<div v-loading="loading" class="skill-setting-manage-detail">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="SKILL_UPDATE"
					icon="md-border_color"
					data-icon-color="var(--black-color-1)"
					:disabled="loading"
					@click="onEdit"
				>
					{{ t('modify') }}
				</SacoButton>
				<SacoButton
					v-power="SKILL_DELETE"
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
				<SacoFormItem :label="t('skill_name')" prop="name">
					{{ leachFormatter(detailData.name) }}
				</SacoFormItem>

				<SacoFormItem
					:label="t('ai_application_platform')"
					prop="platformType"
				>
					{{ skillPlatformTypeFormatter(detailData.platformType) }}
				</SacoFormItem>
				<SacoFormItem :label="t('skill_type')" prop="skillTypeName">
					{{ leachFormatter(detailData.skillTypeName) }}
				</SacoFormItem>
				<template v-if="isBailian">
					<SacoFormItem
						:label="t('bailian_api_key')"
						prop="bailianApiKey"
					>
						{{ leachFormatter(detailData.bailianApiKey) }}
					</SacoFormItem>
					<SacoFormItem
						:label="t('bailian_app_id')"
						prop="bailianAppId"
					>
						{{ leachFormatter(detailData.bailianAppId) }}
					</SacoFormItem>
				</template>
				<template v-if="isCoze">
					<SacoFormItem
						:label="t('coze_workflow_id')"
						prop="cozeWorkflowId"
					>
						{{ leachFormatter(detailData.cozeWorkflowId) }}
					</SacoFormItem>
					<SacoFormItem :label="t('coze_app_id')" prop="cozeAppId">
						{{ leachFormatter(detailData.cozeAppId) }}
					</SacoFormItem>
				</template>
				<SacoFormItem
					:label="t('remark')"
					prop="remark"
					:style="{ '--column-span': 2 }"
				>
					{{ leachFormatter(detailData.remark) }}
				</SacoFormItem>
			</SacoForm>
		</SacoCard>
		<SacoCard
			class="skill-setting-manage-detail__prompt"
			:header="t('file_matching_prompt_words')"
		>
			<div class="skill-setting-manage-detail__prompt-text">
				{{ leachFormatter(detailData.fileMatchPrompt) }}
			</div>
		</SacoCard>
		<SacoCard :header="t('audit_information')">
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
<script lang="ts" setup name="SkillSettingManageDetail">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useSameChannel } from '#/utils/broadcast'
import { getRouterParams } from '#/utils/router'
import { leachFormatter, hmdhmsFormatter } from '#/utils/formatter'
import { deleteBox } from '#/utils/message'
import { useRouterStore } from '#/store'
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const routePath = route.path
const routerStore = useRouterStore()
const { id } = getRouterParams<[number]>(['id'])
const parentPath = '/skill-setting-manage'
const sameChannel = useSameChannel(parentPath)
const { skillPlatformTypeFormatter } = useSkillPlatformType()
const loading = ref(false)
const detailData = reactive({} as SkillDetailResponse)
const isBailian = computed(
	() => detailData.platformType === SkillPlatformType.AliyunBailian,
)
const isCoze = computed(
	() => detailData.platformType === SkillPlatformType.BytedanceCoze,
)
const getDetail = () => {
	if (loading.value) return
	loading.value = true
	skillDetail(id)
		.then((res) => {
			Object.assign(detailData, res.data)
			routerStore.setCacheValueCode(routePath, res.data.name)
		})
		.finally(() => {
			loading.value = false
		})
}
const editPath = `${parentPath}/edit/${id}`
const onEdit = () => {
	router.push(editPath)
}

const onDelete = () => {
	deleteBox({
		params: detailData.id,
		api: skillDelete,
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
.layout-container .skill-setting-manage-detail {
	display: flex;
	flex-direction: column;
	gap: var(--common-gap);

	:deep(.saco-card) {
		margin-top: 0;
	}

	:deep(.skill-setting-manage-detail__prompt) {
		.saco-card__body {
			overflow: visible;
		}

		.skill-setting-manage-detail__prompt-text {
			word-break: break-all;
			white-space: pre-wrap;
		}
	}
}
</style>
