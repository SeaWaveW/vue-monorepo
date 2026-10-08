import ExcelJS from 'exceljs'
import fs from 'fs'
import path from 'path'
import { xlsxRootDir } from '../../../build/git-fetch'
import { readXlsxWorkbook } from '../../../build/xlsx-read'

/** 单元格转纯文本 */
const cellToText = (value: ExcelJS.CellValue): string => {
	if (value == null) return ''
	if (
		typeof value === 'string' ||
		typeof value === 'number' ||
		typeof value === 'boolean'
	) {
		return String(value).trim()
	}
	if (value instanceof Date) return value.toISOString()
	if (typeof value === 'object') {
		if ('richText' in value && Array.isArray(value.richText)) {
			return value.richText
				.map((part) => part.text ?? '')
				.join('')
				.trim()
		}
		if ('result' in value && value.result != null) {
			return cellToText(value.result as ExcelJS.CellValue)
		}
		if ('text' in value && value.text != null)
			return String(value.text).trim()
	}
	return ''
}

/** 读取一行：ExcelJS 的 row.values 下标从 1 开始 */
const rowToArray = (row: ExcelJS.Row): string[] => {
	const values = row.values
	if (!Array.isArray(values)) return []
	return (values as ExcelJS.CellValue[]).slice(1).map(cellToText)
}

/** Key → CSS 变量名（补 -- 前缀） */
const toCssVar = (key: string) => {
	const k = key.trim()
	if (!k) return ''
	return k.startsWith('--') ? k : `--${k}`
}

/** JSON 用 key：去 -- 前缀并转驼峰（primary-color → primaryColor） */
const toJsonKey = (key: string) =>
	key
		.trim()
		.replace(/^--+/, '')
		.replace(/[-_]+([a-zA-Z0-9])/g, (_, c: string) => c.toUpperCase())

const normalizeHeader = (h: string) => h.toLowerCase().replace(/\s+/g, '')

const findCol = (headers: string[], predicates: ((h: string) => boolean)[]) => {
	for (const pred of predicates) {
		const idx = headers.findIndex(pred)
		if (idx >= 0) return idx
	}
	return -1
}

const buildBlock = (selector: string, title: string, lines: string[]) => {
	if (!lines.length) return ''
	return [
		`/** ${title} */`,
		`${selector} {`,
		...lines.map((l) => (l ? `\t${l}` : '')),
		`}`,
		'',
	].join('\n')
}

interface ThemeRow {
	key: string
	light: string
	dark: string
	remark: string
}

const parseThemeSheet = (sheet: ExcelJS.Worksheet): ThemeRow[] => {
	const headers = rowToArray(sheet.getRow(1))
	const keyIdx = findCol(headers, [
		(h) => normalizeHeader(h) === 'key',
		(h) => normalizeHeader(h).startsWith('key'),
	])
	const lightIdx = findCol(headers, [
		(h) => normalizeHeader(h).startsWith('light'),
	])
	const darkIdx = findCol(headers, [
		(h) => normalizeHeader(h).startsWith('dark'),
	])
	const remarkIdx = findCol(headers, [
		(h) => h.includes('备注'),
		(h) =>
			normalizeHeader(h).startsWith('remark') ||
			normalizeHeader(h).startsWith('comment'),
	])

	if (keyIdx < 0 || lightIdx < 0) return []

	const rows: ThemeRow[] = []
	sheet.eachRow((row, rowNumber) => {
		if (rowNumber === 1) return
		const arr = rowToArray(row)
		const key = arr[keyIdx]
		const light = arr[lightIdx] ?? ''
		if (!key || !light) return
		const dark = (darkIdx >= 0 ? arr[darkIdx] : '') || light
		const remark = remarkIdx >= 0 ? arr[remarkIdx] : ''
		rows.push({ key, light, dark, remark })
	})
	return rows
}

const genThemeScss = (rows: ThemeRow[]) => {
	const lightLines: string[] = []
	const darkLines: string[] = []

	for (const { key, light, dark, remark } of rows) {
		const cssVar = toCssVar(key)
		if (lightLines.length) {
			lightLines.push('')
			darkLines.push('')
		}
		if (remark) lightLines.push(`/** ${remark} */`)
		lightLines.push(`${cssVar}: ${light};`)
		if (remark) darkLines.push(`/** ${remark} */`)
		darkLines.push(`${cssVar}: ${dark};`)
	}

	return [
		buildBlock(
			":root,\n[data-theme-type='light']",
			'亮色（默认）',
			lightLines,
		),
		buildBlock("[data-theme-type='dark']", '暗色', darkLines),
	]
		.filter(Boolean)
		.join('\n')
}

/** 同名 Key 后表覆盖前表，与 CSS 层叠一致 */
const mergeThemeRows = (rows: ThemeRow[]) => {
	const map = new Map<string, ThemeRow>()
	for (const row of rows) {
		map.set(toCssVar(row.key), row)
	}
	return [...map.values()]
}

/** 生成 light.json / dark.json（驼峰 key） */
const genThemeJson = (rows: ThemeRow[]) => {
	const light: Record<string, string> = {}
	const dark: Record<string, string> = {}
	for (const row of rows) {
		const key = toJsonKey(row.key)
		light[key] = row.light
		dark[key] = row.dark
	}
	return { light, dark }
}

/** 生成 module/types.d.ts，供 import json 时智能提示 */
const genThemeTypes = (rows: ThemeRow[]) => {
	const fields = rows
		.map((row) => {
			const key = toJsonKey(row.key)
			const doc = row.remark ? `\t/** ${row.remark} */\n` : ''
			return `${doc}\t${key}: string`
		})
		.join('\n')

	return `export {}

/** 主题色（与 module/light.json、dark.json 对齐） */
export interface ThemeColors {
${fields}
}

/** 主题色字段名 */
export type ThemeColorKey = keyof ThemeColors

declare module './light.json' {
	const colors: ThemeColors
	export default colors
}

declare module './dark.json' {
	const colors: ThemeColors
	export default colors
}
`
}

const filePath = path.join(xlsxRootDir, 'src/theme/color.xlsx')
const styleDir = path.join(import.meta.dirname, '../../style/theme')
const moduleDir = path.join(xlsxRootDir, 'src/theme/module')
const varsOutPath = path.join(styleDir, 'vars.scss')

const ensureDir = (dir: string) => {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

/** 读取本地 color.xlsx，生成 vars.scss 与 module 色表 */
export const translateColorXlsx = async () => {
	if (!fs.existsSync(filePath)) {
		throw new Error(
			`[theme] 找不到 ${filePath}，请先执行 pnpm theme -- -fetch`,
		)
	}

	const workbook = await readXlsxWorkbook(filePath)

	const collected: ThemeRow[] = []

	workbook.eachSheet((sheet) => {
		if (sheet.name.includes('不读取')) return
		const rows = parseThemeSheet(sheet)
		if (!rows.length) return
		collected.push(...rows)
		console.log(`→ [${sheet.name}] ${rows.length} 条`)
	})

	const themeRows = mergeThemeRows(collected)
	if (!themeRows.length) {
		console.warn('未找到可读取的主题色工作表（表名含「不读取」会跳过）')
		return
	}

	ensureDir(styleDir)
	fs.writeFileSync(varsOutPath, genThemeScss(themeRows), 'utf8')
	console.log(`→ style/${path.basename(varsOutPath)} 写入成功`)

	ensureDir(moduleDir)
	const { light, dark } = genThemeJson(themeRows)
	fs.writeFileSync(
		path.resolve(moduleDir, 'light.json'),
		JSON.stringify(light, null, '\t') + '\n',
		'utf8',
	)
	fs.writeFileSync(
		path.resolve(moduleDir, 'dark.json'),
		JSON.stringify(dark, null, '\t') + '\n',
		'utf8',
	)
	fs.writeFileSync(
		path.resolve(moduleDir, 'types.d.ts'),
		genThemeTypes(themeRows),
		'utf8',
	)
	console.log(
		`→ module/light.json、dark.json、types.d.ts 写入成功（${themeRows.length} 条）`,
	)
}
