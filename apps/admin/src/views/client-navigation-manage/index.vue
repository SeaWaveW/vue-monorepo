<template>
	<div v-loading="loading || detailLoading" class="client-navigation-manage">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="CLIENT_NAVIGATION_CREATE"
					icon="antOutline-plus"
					data-icon-color="var(--primary-color)"
					:disabled="loading || detailLoading"
					@click="handleAdd"
				>
					{{ t('addition') }}
				</SacoButton>
				<SacoButton
					v-power="CLIENT_NAVIGATION_UPDATE"
					icon="md-border_color"
					data-icon-color="var(--black-color-1)"
					:disabled="loading || detailLoading"
					@click="onEdit"
				>
					{{ t('modify') }}
				</SacoButton>
				<SacoButton
					v-power="CLIENT_NAVIGATION_DELETE"
					icon="riLine-delete-bin-6-line"
					data-icon-color="var(--danger-color)"
					:disabled="loading || detailLoading"
					@click="onDelete"
				>
					{{ t('delete') }}
				</SacoButton>
			</template>
		</CommonTeleportNav>
		<SacoCard class="base-card" :header="t('basic_information')">
			<SacoForm label-position="top" label-suffix="：">
				<SacoFormItem
					v-for="language in languageList"
					:key="language"
					:label="t(getNavigationNameLabelKey(language))"
					:prop="getNavigationLocaleName(language)"
				>
					{{
						leachFormatter(
							detailData[getNavigationLocaleName(language)],
						)
					}}
				</SacoFormItem>
				<SacoFormItem :label="t('page_path')" prop="pagePath">
					{{ leachFormatter(detailData.pagePath) }}
				</SacoFormItem>
				<SacoFormItem :label="t('display_number')" prop="serial">
					{{ leachFormatter(detailData.serial) }}
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
		<SacoCard class="navigation-card" :header="t('navigation_structure')">
			<SacoTree
				highlight-current
				:current-node-key="detailData.id"
				:highlight-keys="highlightKeys"
				default-expand-all
				:data="navigationList"
				icon="ze-arrow-down"
				node-key="id"
				:props="{
					label: navigationLabel,
				}"
				@node-click="handleNodeClick"
			/>
		</SacoCard>
	</div>
</template>
<script lang="ts" setup name="ClientNavigationManage">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { languageList, getNavigationLocaleName } from '#/i18n'

import { useSameChannel } from '#/utils/broadcast'
import { leachFormatter, hmdhmsFormatter } from '#/utils/formatter'
import { deleteBox } from '#/utils/message'
const { t, locale } = useI18n()
const currentPath = '/client-navigation-manage'
const navigationLabel = computed(() => getNavigationLocaleName(locale.value))
const router = useRouter()
const sameChannel = useSameChannel(currentPath)
const navigationList = ref<ClientNavigationTreeResponse>([])
const detailData = ref({} as ClientNavigationDetailResponse)
const highlightKeys = computed(() =>
	[detailData.value.id].filter((id): id is number => !!id),
)
const loading = ref(false)
const getFirstId = (list: ClientNavigationTreeResponse) => list[0]?.id

const detailLoading = ref(false)
/** 连点树节点时只收下最后一次；慢请求后到不能盖掉当前节点 */
let detailSeq = 0
const getDetail = (id: number) => {
	const seq = ++detailSeq
	detailLoading.value = true
	clientNavigationDetail(id)
		.then((res) => {
			if (seq !== detailSeq) return
			detailData.value = res.data
		})
		.finally(() => {
			if (seq !== detailSeq) return
			detailLoading.value = false
		})
}

const handleAdd = () => {
	if (!detailData.value.id) {
		SacoMessage.warning(t('navigation_not_select_message'))
		return
	}
	router.push(`${currentPath}/add/${detailData.value.id}`)
}
const onEdit = () => {
	if (!detailData.value.id) {
		SacoMessage.warning(t('navigation_not_select_message'))
		return
	}
	router.push(`${currentPath}/edit/${detailData.value.id}`)
}

const onDelete = () => {
	if (!detailData.value.id) {
		SacoMessage.warning(t('navigation_not_select_message'))
		return
	}
	deleteBox({
		params: detailData.value.id,
		api: clientNavigationDelete,
	}).then(() => {
		detailData.value = {} as ClientNavigationDetailResponse
		loadTargetId()
	})
}
const handleNodeClick = (data: TreeNodeData) => {
	if (detailData.value.id === data.id) return
	getDetail(data.id)
}
sameChannel.on((id: number) => {
	loadTargetId(id)
})

const loadTargetId = async (id?: ClientNavigationTreeRecord['id']) => {
	/** 先写下目标 id，换树时 current-node-key / highlight-keys 才对得上，一上来清空会丢高亮 */
	if (id) {
		detailData.value = { id } as ClientNavigationDetailResponse
	}
	loading.value = true
	try {
		const treeResult = await clientNavigationTree()
		navigationList.value = treeResult.data || []
		id ||= getFirstId(navigationList.value)
		if (!id) {
			detailData.value = {} as ClientNavigationDetailResponse
			return
		}
		const detailResult = await clientNavigationDetail(id)
		detailData.value = detailResult.data
	} finally {
		loading.value = false
	}
}
onMounted(() => {
	loadTargetId()
})
</script>
<style scoped lang="scss">
.client-navigation-manage {
	display: grid;
	/** 首行跟基本信息走，次行吃剩余高度，右边树才能铺满 */
	grid-template-rows: auto 1fr;
	grid-template-columns: minmax(0, 1fr) 736px;
	gap: var(--common-gap);
	/** 不写死 100% 时 1fr 按内容算，右边树只跟到审计卡底下 */
	height: 100%;
	min-height: 0;

	:deep(.saco-card) {
		margin-top: 0;
	}

	.base-card,
	.audit-card {
		--grid-column-size: 3;

		grid-column: 1;
		/** 只占内容高度，不跟右边导航卡一起被 1fr 行拉高 */
		align-self: start;
		height: fit-content;
	}

	.base-card {
		grid-row: 1;
	}

	.audit-card {
		grid-row: 2;
	}

	.navigation-card {
		grid-row: 1 / -1;
		grid-column: 2;
		/** 跟网格两行走，body 才能 flex 吃满、树过长时内部滚 */
		align-self: stretch;
		height: 100%;
		min-height: 0;

		:deep(.saco-card__body) {
			min-height: 0;
		}

		:deep(.saco-tree) {
			.saco-tree__node-content {
				margin-bottom: calc(var(--common-gap) * 0.4);
			}
		}
	}
}
</style>
