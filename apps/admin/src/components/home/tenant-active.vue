<template>
	<SacoCard shadow="never" :header="t('home_user_ranking')">
		<SacoTable :data="rows" row-key="rank" :border="false">
			<SacoTableColumn
				:label="t('home_ranking')"
				prop="rank"
				width="80px"
			/>
			<SacoTableColumn
				:label="t('home_user_name')"
				prop="name"
				width="240px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('home_task_sum')"
				prop="taskCount"
				width="260px"
			>
				<template #default="{ row }: { row: TenantActiveRow }">
					<div class="metric-box">
						<span class="metric-box__value">
							{{ row.taskCount }}
						</span>
						<SacoProgress
							:percentage="toPercent(row.taskCount)"
							:show-text="false"
							:stroke-width="8"
							:color="colors.mainColor3"
						/>
					</div>
				</template>
			</SacoTableColumn>
			<SacoTableColumn
				:label="t('home_found_sum')"
				prop="found"
				width="140px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('control_use_token')"
				prop="token"
				width="140px"
				:formatter="leachFormatter"
			/>
		</SacoTable>
	</SacoCard>
</template>
<script lang="ts" setup name="HomeTenantActive">
import { useTheme } from '#/theme'

import { leachFormatter } from '#/utils/formatter'

interface TenantActiveRow {
	rank: number
	name: string
	taskCount: number
	found: number
	token: string
}

const { t } = useI18n()
const { colors } = useTheme()
const rows = ref<TenantActiveRow[]>([
	{
		rank: 1,
		name: 'CETOC T5',
		taskCount: 12660,
		found: 84,
		token: '32.5M',
	},
	{
		rank: 2,
		name: '广州检测技术服务公司',
		taskCount: 9320,
		found: 62,
		token: '41.2M',
	},
	{
		rank: 3,
		name: '市政认证服务公司',
		taskCount: 7680,
		found: 43,
		token: '21.1M',
	},
	{
		rank: 4,
		name: '广东检测技术有限公司',
		taskCount: 5210,
		found: 23,
		token: '21.1M',
	},
	{
		rank: 5,
		name: '广东汽车技术有限公司',
		taskCount: 4160,
		found: 16,
		token: '27.6M',
	},
])
const maxCount = computed(() => {
	return Math.max(...rows.value.map((row) => row.taskCount), 1)
})
const toPercent = (value: number) => {
	return Math.round((value / maxCount.value) * 100)
}
</script>
