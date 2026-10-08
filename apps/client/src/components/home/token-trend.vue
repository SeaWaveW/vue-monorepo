<template>
	<SacoCard shadow="never" :header="t('home_token_trend')">
		<div ref="chartRef" class="chart-box" />
	</SacoCard>
</template>
<script lang="ts" setup name="HomeTokenTrend">
import { useTheme } from '#/theme'

import {
	getHomeMonths,
	getTrendGrid,
	getTrendTooltip,
	getTrendXAxis,
	getTrendYAxis,
	useEcharts,
	type TrendChartOption,
} from './use-echarts'

const { t } = useI18n()
const { colors } = useTheme()
const chartRef = ref<HTMLElement>()
// 占位 13 点，对齐横轴去年当月到今年当月
const tokenBars = [20, 28, 65, 68, 78, 94, 96, 108, 150, 180, 198, 205, 210]
const tokenLine = [8, 14, 18, 22, 26, 30, 52, 56, 80, 90, 102, 120, 120]
const option = computed<TrendChartOption>(() => {
	// 柱：mainColor4；折线：warningColor；轴：greyColor9；文字：textColor
	const barColor = colors.value.mainColor4
	const lineColor = colors.value.warningColor
	const axisColor = colors.value.greyColor9
	const textColor = colors.value.textColor
	const whiteColor = colors.value.whiteColor
	return {
		tooltip: getTrendTooltip({
			whiteColor,
			textColor,
			borderColor: colors.value.greyColor11,
			pointerColor: colors.value.mainColor3,
		}),
		grid: getTrendGrid(),
		xAxis: getTrendXAxis(getHomeMonths(t), axisColor, textColor),
		yAxis: getTrendYAxis(
			textColor,
			{ max: 250, interval: 50 },
			{ max: 120, interval: 20 },
		),
		series: [
			{
				name: t('home_task_sum'),
				type: 'bar',
				data: tokenBars,
				// 最宽 26。写死柱宽时类目比 26 窄，柱子会贴死
				barMaxWidth: 26,
				barCategoryGap: '40%',
				itemStyle: {
					color: barColor,
					borderRadius: [4, 4, 0, 0],
				},
			},
			{
				name: t('home_token_trend'),
				type: 'line',
				yAxisIndex: 1,
				data: tokenLine,
				smooth: 0.3,
				// 只画线不画点；线宽 2
				symbol: 'none',
				showSymbol: false,
				lineStyle: { width: 2, color: lineColor },
				itemStyle: { color: lineColor },
			},
		],
	}
})
useEcharts(chartRef, option)
</script>
