// Vite 8 只预构建 `@saco/common > dayjs`，裸 `from 'dayjs'` 仍打到 dayjs.min.js（UMD 无 default）
import dayjs from 'dayjs/esm'
import { i18n, type LocaleKey } from '../i18n'
import { parsePhone } from './phone'

/** 空展示占位 */
export const LEACH_VALUE = '-'

/** 单参展示值，或表格 `(row, column, cellValue, index)` */
export type FormatterArgs =
	[value: any] | [row: any, column: unknown, cellValue: any, index?: number]

/**
 * 中间层：按调用形态取出要格式化的值。
 * 模板 `xxxFormatter(值)` 只有 1 个实参，取第一参；
 * SacoTable `:formatter` 是 `(row, column, cellValue, index)`，至少 3 个实参，取 cell。
 */
export function getFormatterValue(...args: FormatterArgs) {
	const [row, column, cellValue] = args
	// 情况1：模板单参
	if (args.length < 3) return row
	// 情况2：后参被补成 undefined（不是表格的 column 对象），仍当单参
	if (column == null && cellValue == null) return row
	// 情况3：SacoTable (row, column, cellValue, index)
	return cellValue
}

/**
 * 把「只处理一个 value」的函数包成表格 / 模板都能用的具名 formatter。
 * 业务枚举映射也走这个，不用自己判断 args.length。
 */
export function createFormatter<R extends string | number>(
	format: (value: any) => R,
) {
	return (...args: FormatterArgs): R => format(getFormatterValue(...args))
}

function leachEmpty(value: any): string | number {
	if (typeof value === 'number') return value
	// 表格 formatter 返回值不含 boolean，false 写成字面量以免列类型红
	if (typeof value === 'boolean') return String(value)
	return value || LEACH_VALUE
}

function formatHmdhms(time: any): string {
	// 0 / false / 空都不是有效时间，dayjs(0) 会变成 1970-01-01
	if (!time) return LEACH_VALUE
	const parsed = dayjs(time)
	if (!parsed.isValid()) return LEACH_VALUE
	return parsed.format('YYYY-MM-DD HH:mm:ss')
}

function formatYmd(time: any): string {
	// 和 formatHmdhms 同一套空值，只少时分秒
	if (!time) return LEACH_VALUE
	const parsed = dayjs(time)
	if (!parsed.isValid()) return LEACH_VALUE
	return parsed.format('YYYY-MM-DD')
}

/**
 * 空值显示为 `-`；`0` / `false` 原样。
 * 必须 rest：可选参数在 Volar strictTemplates 里仍报「应有 3 个参数」。
 */
export const leachFormatter = createFormatter(leachEmpty)

/**
 * 毫秒 → `YYYY-MM-DD HH:mm:ss`。
 * `0` / `false` / 空 / 非法日期都显示 `LEACH_VALUE`，避免 1970。
 */
export const hmdhmsFormatter = createFormatter(formatHmdhms)

/**
 * 毫秒 → `YYYY-MM-DD`。
 * 空值规则与 `hmdhmsFormatter` 相同；只要日期、不要时分秒时用这个。
 */
export const ymdFormatter = createFormatter(formatYmd)

/** 时长拆分：年按 365 天、月按 30 天，只为展示，不是日历 */
const DURATION_SECOND = 1
const DURATION_MINUTE = 60
const DURATION_HOUR = 3600
const DURATION_DAY = 86400
const DURATION_MONTH = 30 * DURATION_DAY
const DURATION_YEAR = 365 * DURATION_DAY

const DURATION_UNITS: Array<{ size: number; key: LocaleKey }> = [
	{ size: DURATION_YEAR, key: 'review_duration_year' },
	{ size: DURATION_MONTH, key: 'review_duration_month' },
	{ size: DURATION_DAY, key: 'review_duration_day' },
	{ size: DURATION_HOUR, key: 'review_duration_hour' },
	{ size: DURATION_MINUTE, key: 'review_duration_minute' },
	{ size: DURATION_SECOND, key: 'review_duration_second' },
]

function formatReviewDuration(value: any): string {
	if (value === '' || value === null || value === undefined) {
		return String(leachEmpty(value))
	}
	const total = Number(value)
	if (!Number.isFinite(total) || total < 0) {
		return String(leachEmpty(value))
	}
	let remain = Math.floor(total)
	const amounts = DURATION_UNITS.map((unit) => {
		const amount = Math.floor(remain / unit.size)
		remain = remain % unit.size
		return amount
	})
	// 前面为 0 的单位不写；全 0 落在秒，兼容「只有秒」和合法的 0 秒
	const start = amounts.findIndex((amount, index) => {
		return amount > 0 || index === amounts.length - 1
	})
	return DURATION_UNITS.slice(start)
		.map((unit, index) => {
			return String(i18n.global.t(unit.key, [amounts[start + index]]))
		})
		.join('')
}

/**
 * 秒 → 年/月/天/时/分/秒文案。接口就是秒，不要当毫秒。
 * 空 / 非法 → `LEACH_VALUE`；`0` 是合法时长，写成「0秒」。
 * 走 i18n 单例，列表 `:formatter` 不用再包 `use`。
 */
export const reviewDurationFormatter = createFormatter(formatReviewDuration)

function formatCompactNumber(value: any): string {
	if (value === '' || value === null || value === undefined) {
		return LEACH_VALUE
	}
	const total = Number(value)
	if (!Number.isFinite(total)) {
		return LEACH_VALUE
	}
	const abs = Math.abs(total)
	if (abs >= 1_000_000) {
		return `${Number((total / 1_000_000).toFixed(1))}M`
	}
	if (abs >= 1_000) {
		return `${Number((total / 1_000).toFixed(1))}K`
	}
	return String(total)
}

/**
 * Token / 次数这类大数缩写：≥100 万 → `x.xM`，≥1000 → `x.xK`，否则原数字。
 * 空 / 非法 → `LEACH_VALUE`；`0` 是合法量，写成 `0`。
 */
export const compactNumberFormatter = createFormatter(formatCompactNumber)

function formatPhone(value: any): string {
	// 空 / 0 / false 都不是号码；0 走 leach 会原样写出，这里先挡掉
	if (value === '' || value == null || value === false || value === 0) {
		return LEACH_VALUE
	}
	const { countryCode, localNumber } = parsePhone(value)
	if (!localNumber) {
		return LEACH_VALUE
	}
	return `+${countryCode} ${localNumber}`
}

/**
 * 接口 `86****` → `+86 ****`。列表 / 详情 / 头像共用，不要各写一份拆号。
 * 空值 → `LEACH_VALUE`。
 */
export const phoneFormatter = createFormatter(formatPhone)
