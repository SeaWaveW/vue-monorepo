<template>
	<div class="agent-authorization-manage-add">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="TENANT_REVIEW_AGENT_CREATE"
					:loading="createLoading"
					icon="antOutline-check-circle"
					data-icon-color="var(--success-color)"
					@click="handleComplete"
				>
					{{ t('complete') }}
				</SacoButton>
			</template>
		</CommonTeleportNav>
		<SacoCard class="agent-card">
			<template #header>
				{{ t('select_agent') }}
				<SacoButton
					v-power="REVIEW_AGENT_PAGE"
					icon="riLine-checkbox-multiple-line"
					@click="selectAgentVisible = true"
				>
					{{ t('choice') }}
				</SacoButton>
			</template>
			<SacoTable :data="agents" @row-dblclick="noTransferDblClick">
				<SacoTableColumn
					:label="t('agent_name')"
					prop="name"
					width="338px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('skill')"
					prop="skillName"
					width="196px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('simple_description')"
					prop="description"
					width="410px"
					:formatter="leachFormatter"
				/>
			</SacoTable>
		</SacoCard>
		<SacoCard class="client-card">
			<template #header>
				{{ t('select_client') }}
				<SacoButton
					v-power="CLIENT_TENANT_PAGE"
					icon="riLine-checkbox-multiple-line"
					@click="selectClientVisible = true"
				>
					{{ t('choice') }}
				</SacoButton>
			</template>
			<SacoTable :data="tenants" @row-dblclick="noTransferDblClick">
				<SacoTableColumn
					:label="t('client_name')"
					prop="name"
					width="351px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('address')"
					prop="address"
					width="593px"
					:formatter="leachFormatter"
				/>
			</SacoTable>
		</SacoCard>
		<SelectAgent v-model="selectAgentVisible" v-model:agents="agents" />
		<SelectClient v-model="selectClientVisible" v-model:tenants="tenants" />
	</div>
</template>
<script lang="ts" setup name="AgentAuthorizationManageAdd">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useSameChannel } from '#/utils/broadcast'
import { leachFormatter } from '#/utils/formatter'
import { noTransferDblClick } from '#/utils/message'
import { useRouterStore } from '#/store'
import SelectAgent from '@/components/agent-authorization-manage/select-agent.vue'
import SelectClient from '@/components/agent-authorization-manage/select-client.vue'
const { t } = useI18n()
const parentPath = '/agent-authorization-manage'
const routerStore = useRouterStore()
const sameChannel = useSameChannel(parentPath)
const selectAgentVisible = ref(false)
const selectClientVisible = ref(false)
const agents = ref<ReviewAgentPageRecord[]>([])
const tenants = ref<ClientTenantPageRecord[]>([])

const createLoading = ref(false)
const handleComplete = () => {
	if (!agents.value.length) {
		SacoMessage.warning(t('validate_please_select_any', [t('agent')]))
		return
	}
	if (!tenants.value.length) {
		SacoMessage.warning(t('validate_please_select_any', [t('client')]))
		return
	}
	if (createLoading.value) return
	createLoading.value = true
	tenantReviewAgentCreate({
		reviewAgentIds: agents.value.map((item) => item.id),
		tenantIds: tenants.value.map((item) => item.id),
	})
		.then(() => {
			SacoMessage.success(t('addition_successful'))
			sameChannel.send('reload')
			routerStore.goParentRoute(parentPath)
		})
		.finally(() => {
			createLoading.value = false
		})
}
</script>
<style scoped lang="scss">
.agent-authorization-manage-add {
	display: flex;
	gap: var(--common-gap);
	height: 100%;
	min-height: 0;
	overflow: hidden;

	:deep(.saco-card) {
		margin-top: 0;

		&.agent-card,
		&.client-card {
			display: flex;
			flex: 1;
			flex-direction: column;
			min-width: 0;
			min-height: 0;

			.saco-card__body {
				display: flex;
				flex: 1;
				flex-direction: column;
				min-height: 0;
			}
		}
	}
}
</style>
