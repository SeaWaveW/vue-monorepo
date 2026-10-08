<template>
	<div class="agent-authorization-manage-add">
		<CommonTeleportNav>
			<template #right>
				<SacoButton
					v-power="AGENT_AUTHORIZATION_CREATE"
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
		<SacoCard class="user-card">
			<template #header>
				{{ t('select_user') }}
				<SacoButton
					v-power="CLIENT_USER_PAGE"
					icon="riLine-checkbox-multiple-line"
					@click="selectUserVisible = true"
				>
					{{ t('choice') }}
				</SacoButton>
			</template>
			<SacoTable :data="users" @row-dblclick="noTransferDblClick">
				<SacoTableColumn
					:label="t('username')"
					prop="username"
					width="351px"
					:formatter="leachFormatter"
				/>
				<SacoTableColumn
					:label="t('email')"
					prop="email"
					width="593px"
					:formatter="leachFormatter"
				/>
			</SacoTable>
		</SacoCard>
		<SelectAgent v-model="selectAgentVisible" v-model:agents="agents" />
		<SelectUser v-model="selectUserVisible" v-model:users="users" />
	</div>
</template>
<script lang="ts" setup name="AgentAuthorizationManageAdd">
import CommonTeleportNav from '#/components/teleport/nav.vue'
import { useSameChannel } from '#/utils/broadcast'
import { leachFormatter } from '#/utils/formatter'
import { noTransferDblClick } from '#/utils/message'
import { useRouterStore } from '#/store'
import SelectAgent from '@/components/agent-authorization-manage/select-agent.vue'
import SelectUser from '@/components/agent-authorization-manage/select-user.vue'
const { t } = useI18n()
const parentPath = '/agent-authorization-manage'
const routerStore = useRouterStore()
const sameChannel = useSameChannel(parentPath)
const selectAgentVisible = ref(false)
const selectUserVisible = ref(false)
const agents = ref<ReviewAgentPageRecord[]>([])
const users = ref<ClientUserPageRecord[]>([])

const createLoading = ref(false)
const handleComplete = () => {
	if (!agents.value.length) {
		SacoMessage.warning(t('validate_please_select_any', [t('agent')]))
		return
	}
	if (!users.value.length) {
		SacoMessage.warning(t('validate_please_select_any', [t('username')]))
		return
	}
	if (createLoading.value) return
	createLoading.value = true
	agentAuthorizationCreate({
		reviewAgentIds: agents.value.map((item) => item.id),
		userIds: users.value.map((item) => item.id),
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
		&.user-card {
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
