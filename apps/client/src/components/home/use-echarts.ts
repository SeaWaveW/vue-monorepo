import { init, use, type ComposeOption, type EChartsType } from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import {
	AxisPointerComponent,
	GridComponent,
	TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { BarSeriesOption, LineSeriesOption } from 'echarts/charts'
import type {
	AxisPointerComponentOption,
	GridComponentOption,
	TooltipComponentOption,
} from 'echarts/components'
import { useTheme } from '#/theme'

use([
	BarChart,
	LineChart,
	GridComponent,
	TooltipComponent,
	AxisPointerComponent,
	CanvasRenderer,
])

export type TrendChartOption = ComposeOption<
	| BarSeriesOption
	| LineSeriesOption
	| GridComponentOption
	| TooltipComponentOption
	| AxisPointerComponentOption
>

export interface TrendTooltipColors {
	whiteColor: string
	textColor: string
	borderColor: string
	pointerColor: string
}

interface TrendYAxisSide {
	max: number
	interval: number
	formatter?: string
}

/** 固定像素绘图区，避免 containLabel 按 250h / 点上文字把两张图算成不同高度 */
export const getTrendGrid = (): GridComponentOption => {
	return {
		left: 56,
		right: 48,
		top: 32,
		bottom: 28,
		containLabel: false,
	}
}

export const getTrendXAxis = (
	months: string[],
	axisColor: string,
	textColor: string,
) => {
	return {
		type: 'category' as const,
		boundaryGap: true,
		data: months,
		axisLine: {
			lineStyle: { color: axisColor },
		},
		axisTick: { show: false },
		axisLabel: { color: textColor },
	}
}

export const getTrendYAxis = (
	textColor: string,
	left: TrendYAxisSide,
	right: TrendYAxisSide,
) => {
	return [
		{
			type: 'value' as const,
			min: 0,
			max: left.max,
			interval: left.interval,
			axisLine: { show: false },
			axisTick: { show: false },
			splitLine: { show: false },
			axisLabel: {
				color: textColor,
				width: 48,
				overflow: 'none' as const,
				align: 'right' as const,
				margin: 10,
				formatter: left.formatter,
			},
		},
		{
			type: 'value' as const,
			min: 0,
			max: right.max,
			interval: right.interval,
			axisLine: { show: false },
			axisTick: { show: false },
			splitLine: { show: false },
			axisLabel: {
				color: textColor,
				width: 40,
				overflow: 'none' as const,
				align: 'left' as const,
				margin: 10,
				formatter: right.formatter,
			},
		},
	]
}

/** 主题 hex 转 rgba；面积填充和月份高亮带都要透明度。色表异步，进页时颜色还是空的 */
export const toRgba = (color: string | undefined, alpha: number) => {
	if (!color) return ''
	const hex = color.trim()
	if (!hex.startsWith('#')) return color
	const raw = hex.slice(1)
	const full =
		raw.length === 3
			? raw
					.split('')
					.map((char) => char + char)
					.join('')
			: raw
	if (full.length !== 6) return color
	const n = Number.parseInt(full, 16)
	const r = (n >> 16) & 255
	const g = (n >> 8) & 255
	const b = n & 255
	return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** 空心折线点的 fill 是白的，默认 marker 会跟着变白，白底上看不见 */
const isNearWhite = (color: string) => {
	if (!color) return false
	const hex = color.trim().toLowerCase()
	if (hex === '#fff' || hex === '#ffffff' || hex === 'white') return true
	if (hex.startsWith('rgba')) {
		const nums = hex.match(/[\d.]+/g)
		if (!nums || nums.length < 3) return false
		const [r, g, b] = nums.map(Number)
		return r > 250 && g > 250 && b > 250
	}
	if (!hex.startsWith('#') || hex.length < 7) return false
	const n = Number.parseInt(hex.slice(1, 7), 16)
	const r = (n >> 16) & 255
	const g = (n >> 8) & 255
	const b = n & 255
	return r > 250 && g > 250 && b > 250
}

/** tooltip 圆点用描边色，避免吃到空心点的白色填充 */
const markerColor = (
	item: { color?: unknown; borderColor?: string },
	fallback: string,
) => {
	const color = typeof item.color === 'string' ? item.color : ''
	if (color && !isNearWhite(color)) return color
	if (item.borderColor && !isNearWhite(item.borderColor)) {
		return item.borderColor
	}
	return fallback
}

/** 墨刀稿：白底卡片 tooltip + 当月浅色竖条 */
export const getTrendTooltip = (
	colors: TrendTooltipColors,
	valueSuffix?: string,
): TooltipComponentOption => {
	return {
		trigger: 'axis',
		backgroundColor: colors.whiteColor,
		borderColor: colors.borderColor,
		borderWidth: 1,
		padding: [10, 14],
		textStyle: {
			color: colors.textColor,
			fontSize: 12,
		},
		extraCssText:
			'box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08); border-radius: 4px;',
		axisPointer: {
			type: 'shadow',
			shadowStyle: {
				color: toRgba(colors.pointerColor, 0.12),
			},
		},
		formatter: (params) => {
			const list = Array.isArray(params) ? params : [params]
			/** echarts 6 的 CallbackDataParams 没有 axisValue；类目轴 name 就是当月 */
			const title = list[0]?.name ?? ''
			const rows = list.map((item) => {
				const color = markerColor(item, colors.pointerColor)
				const value = `${item.value ?? ''}${valueSuffix ?? ''}`
				const marker = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:${color};flex-shrink:0;"></span>`
				return `<div style="display:flex;align-items:center;justify-content:space-between;gap:32px;margin-top:8px;"><span style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap;">${marker}${item.seriesName}</span><span style="white-space:nowrap;">${value}</span></div>`
			})
			return `<div>${title}${rows.join('')}</div>`
		},
	}
}

type HomeMonthKey =
	| 'home_jan'
	| 'home_feb'
	| 'home_mar'
	| 'home_apr'
	| 'home_may'
	| 'home_jun'
	| 'home_jul'
	| 'home_aug'
	| 'home_sep'
	| 'home_oct'
	| 'home_nov'
	| 'home_dec'

/** 和 language.xlsx 月份行对齐，下标 0 = 一月；文案不写死在这 */
const HOME_MONTH_KEYS: HomeMonthKey[] = [
	'home_jan',
	'home_feb',
	'home_mar',
	'home_apr',
	'home_may',
	'home_jun',
	'home_jul',
	'home_aug',
	'home_sep',
	'home_oct',
	'home_nov',
	'home_dec',
]

/** 去年当月到今年当月（含两端，13 个点）；从 1 月起排会把近一年错成自然年 */
export const getHomeMonths = (t: (key: HomeMonthKey) => string) => {
	const now = new Date()
	const startYear = now.getFullYear() - 1
	const startMonthIndex = now.getMonth()
	return Array.from({ length: 13 }, (_, index) => {
		const date = new Date(startYear, startMonthIndex + index, 1)
		return t(HOME_MONTH_KEYS[date.getMonth()])
	})
}

export const useEcharts = (
	el: Ref<HTMLElement | undefined>,
	option: MaybeRefOrGetter<TrendChartOption>,
) => {
	const { colors } = useTheme()
	let chart: EChartsType | undefined
	let observer: ResizeObserver | undefined

	/** KeepAlive 藏着时不要跟 resize / 改 option */
	let pageActive = true

	const bindObserver = () => {
		if (!pageActive || !el.value || observer) return
		observer = new ResizeObserver(() => {
			chart?.resize()
		})
		observer.observe(el.value)
	}

	const render = () => {
		if (!pageActive || !el.value) return
		if (!chart) {
			chart = init(el.value)
			bindObserver()
		}
		chart.setOption(toValue(option), true)
	}

	watch([el, () => toValue(option), colors], render, {
		flush: 'post',
		deep: true,
		immediate: true,
	})

	onActivated(() => {
		pageActive = true
		nextTick(() => {
			if (!pageActive) {
				return
			}
			bindObserver()
			chart?.resize()
		})
	})

	onDeactivated(() => {
		pageActive = false
		observer?.disconnect()
		observer = undefined
	})

	onBeforeUnmount(() => {
		pageActive = false
		observer?.disconnect()
		observer = undefined
		chart?.dispose()
		chart = undefined
	})
}
