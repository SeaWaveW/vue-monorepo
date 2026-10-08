<template>
	<SacoCard shadow="never" :header="t('home_ai_trend')">
		<div ref="chartRef" class="chart-box" />
	</SacoCard>
</template>
<script lang="ts" setup name="HomeAiTrend">
import { useTheme } from '#/theme'

import {
	getHomeMonths,
	getTrendGrid,
	getTrendTooltip,
	getTrendXAxis,
	getTrendYAxis,
	toRgba,
	useEcharts,
	type TrendChartOption,
} from './use-echarts'

const { t } = useI18n()
const { colors } = useTheme()
const chartRef = ref<HTMLElement>()
// 占位 13 点，对齐横轴去年当月到今年当月
const hours = [20, 34, 67, 70, 80, 94, 105, 120, 145, 171, 196, 204, 210]
/** 绘图区宽。跟 getTrendGrid 的 left 56、right 48 对齐 */
const plotWidth = ref(0)
const LABEL_CHAR_WIDTH = 7
const LABEL_GAP = 16
/** 窄图上相邻工时会贴在一起，框之间至少留 LABEL_GAP */
const visibleLabelIndexes = computed(() => {
	const width = plotWidth.value
	const picked = new Set<number>()
	if (!width) return picked
	let lastRight = -Infinity
	hours.forEach((value, index) => {
		const textWidth = `${value}h`.length * LABEL_CHAR_WIDTH
		const center = ((index + 0.5) / hours.length) * width
		const left = center - textWidth / 2
		if (left < lastRight + LABEL_GAP) return
		picked.add(index)
		lastRight = left + textWidth
	})
	return picked
})
const option = computed<TrendChartOption>(() => {
	const labelIndexes = visibleLabelIndexes.value
	// 折线 / 实心点：mainColor3；轴：greyColor9；文字：textColor
	const lineColor = colors.value.mainColor3
	const axisColor = colors.value.greyColor9
	const textColor = colors.value.textColor
	const whiteColor = colors.value.whiteColor
	return {
		color: [lineColor],
		tooltip: getTrendTooltip(
			{
				whiteColor,
				textColor,
				borderColor: colors.value.greyColor11,
				pointerColor: lineColor,
			},
			'h',
		),
		grid: getTrendGrid(),
		xAxis: getTrendXAxis(getHomeMonths(t), axisColor, textColor),
		yAxis: getTrendYAxis(
			textColor,
			{ max: 250, interval: 50, formatter: '{value}h' },
			{ max: 250, interval: 50 },
		),
		series: [
			{
				name: t('data'),
				type: 'line',
				data: hours,
				smooth: 0.3,
				// 实心圆，6px，再大挡点上的工时数字
				symbol: 'circle',
				symbolSize: 6,
				showSymbol: true,
				label: {
					show: true,
					position: 'top',
					color: textColor,
					fontSize: 11,
					distance: 4,
					formatter: (params) => {
						const index = params.dataIndex ?? 0
						if (!labelIndexes.has(index)) return ''
						return `${params.value ?? ''}h`
					},
				},
				// 线宽 2；面积用同色 16% 透明，别另起一套色
				lineStyle: { width: 2, color: lineColor },
				itemStyle: {
					color: lineColor,
				},
				areaStyle: {
					color: toRgba(lineColor, 0.16),
				},
			},
		],
	}
})
useEcharts(chartRef, option)
let plotObserver: ResizeObserver | undefined
onMounted(() => {
	const el = chartRef.value
	if (!el) return
	const syncPlotWidth = () => {
		plotWidth.value = Math.max(el.clientWidth - 56 - 48, 0)
	}
	syncPlotWidth()
	plotObserver = new ResizeObserver(syncPlotWidth)
	plotObserver.observe(el)
})
onUnmounted(() => {
	plotObserver?.disconnect()
	plotObserver = undefined
})
</script>
