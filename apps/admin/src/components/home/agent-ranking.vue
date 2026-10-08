<template>
	<SacoCard shadow="never" :header="t('home_ai_ranking')">
		<SacoTable :data="rows" row-key="rank" :border="false">
			<SacoTableColumn
				:label="t('home_ranking')"
				prop="rank"
				width="80px"
			/>
			<SacoTableColumn
				:label="t('home_agent_name')"
				prop="name"
				width="220px"
				:formatter="leachFormatter"
			/>
			<SacoTableColumn
				:label="t('home_frequentcy')"
				prop="count"
				width="280px"
			>
				<template #default="{ row }: { row: AgentRankRow }">
					<div class="metric-box">
						<span class="metric-box__value">{{ row.count }}</span>
						<SacoProgress
							:percentage="toPercent(row.count)"
							:show-text="false"
							:stroke-width="8"
							:color="colors.mainColor3"
						/>
					</div>
				</template>
			</SacoTableColumn>
			<SacoTableColumn
				:label="t('home_take_now')"
				prop="avgTime"
				width="140px"
			>
				<template #default="{ row }: { row: AgentRankRow }">
					{{ `${row.avgTime}s` }}
				</template>
			</SacoTableColumn>
			<SacoTableColumn
				:label="t('home_found_sum')"
				prop="found"
				width="140px"
				:formatter="leachFormatter"
			/>
		</SacoTable>
	</SacoCard>
</template>
<script lang="ts" setup name="HomeAgentRanking">
import { useTheme } from '#/theme'

import { leachFormatter } from '#/utils/formatter'

interface AgentRankRow {
	rank: number
	name: string
	count: number
	avgTime: number
	found: number
}

const { t } = useI18n()
const { colors } = useTheme()
const rows = ref<AgentRankRow[]>([
	{
		rank: 1,
		name: 'R10-CETOC-E49',
		count: 12660,
		avgTime: 32.5,
		found: 84,
	},
	{
		rank: 2,
		name: 'R10-CETOC-E24',
		count: 9320,
		avgTime: 41.2,
		found: 62,
	},
	{
		rank: 3,
		name: 'R10-CETOC-E5',
		count: 7680,
		avgTime: 31.5,
		found: 43,
	},
	{
		rank: 4,
		name: 'R10-UTAC-E23',
		count: 5210,
		avgTime: 27.8,
		found: 23,
	},
	{
		rank: 5,
		name: 'R10-IDA-E49',
		count: 4160,
		avgTime: 27.6,
		found: 16,
	},
])
const maxCount = computed(() => {
	return Math.max(...rows.value.map((row) => row.count), 1)
})
const toPercent = (value: number) => {
	return Math.round((value / maxCount.value) * 100)
}
</script>
