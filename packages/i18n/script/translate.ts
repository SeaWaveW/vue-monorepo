import ExcelJS from 'exceljs'
import fs from 'fs'
import path from 'path'
import { xlsxRootDir } from '../../../build/git-fetch'
import { readXlsxWorkbook } from '../../../build/xlsx-read'

/** 表头：简体中文(chinese)[zh-CN] */
interface ParsedLocale {
	code: string
	desc: string
	iso: string
}

/** 单元格转纯文本 */
const cellToText = (value: ExcelJS.CellValue): string => {
	if (value == null) return ''
	if (
		typeof value === 'string' ||
		typeof value === 'number' ||
		typeof value === 'boolean'
	) {
		return String(value)
	}
	if (value instanceof Date) return value.toISOString()
	if (typeof value === 'object') {
		// 富文本
		if ('richText' in value && Array.isArray(value.richText)) {
			return value.richText.map((part) => part.text ?? '').join('')
		}
		// 公式结果
		if ('result' in value && value.result != null) {
			return cellToText(value.result as ExcelJS.CellValue)
		}
		// 超链接
		if ('text' in value && value.text != null) return String(value.text)
	}
	return ''
}

/** 读取一行：ExcelJS 的 row.values 下标从 1 开始 */
const rowToArray = (row: ExcelJS.Row): string[] => {
	const values = row.values
	if (!Array.isArray(values)) return []
	return (values as ExcelJS.CellValue[]).slice(1).map(cellToText)
}

const filePath = path.join(xlsxRootDir, 'src/i18n/language.xlsx')
const outPath = path.join(xlsxRootDir, 'src/i18n/locales')
const localesTsPath = path.join(xlsxRootDir, 'src/i18n/locales.ts')
const typesPath = path.join(xlsxRootDir, 'src/i18n/types.d.ts')

/** 描述(code)[iso]，第 0 列 Key 不参与 */
const HEADER_RE = /^(.+?)\(([^)]+)\)\[([^\]]+)\]$/

const parseLocaleHeader = (text: string): ParsedLocale | null => {
	const matched = text.trim().match(HEADER_RE)
	if (!matched) return null
	const desc = matched[1].trim()
	const code = matched[2].trim()
	const iso = matched[3].trim()
	if (!desc || !code || !iso) return null
	return { code, desc, iso }
}

const parseLocalesFromHeader = (headers: string[]): ParsedLocale[] => {
	const langs: ParsedLocale[] = []
	for (const cell of headers.slice(1)) {
		if (!cell.trim()) continue
		const parsed = parseLocaleHeader(cell)
		if (!parsed) {
			throw new Error(
				`[i18n] 表头无法解析「${cell}」，须为 描述(code)[iso]，如 简体中文(chinese)[zh-CN]`,
			)
		}
		langs.push(parsed)
	}
	if (!langs.length) {
		throw new Error('[i18n] 表头没有语言列')
	}
	return langs
}

const writeGeneratedLocales = (langs: ParsedLocale[]) => {
	const items = langs
		.map(
			(item) =>
				`\t{ code: ${JSON.stringify(item.code)}, desc: ${JSON.stringify(item.desc)}, iso: ${JSON.stringify(item.iso)} },`,
		)
		.join('\n')
	const union = langs.map((item) => JSON.stringify(item.code)).join(' | ')
	fs.writeFileSync(
		localesTsPath,
		`import type { LanguageItem } from './types'

/** 由 language.xlsx 表头生成，不要手改 */
export const i18nLocales: LanguageItem[] = [
${items}
]

/** 语言码列表 */
export const languageList = i18nLocales.map((item) => item.code)
`,
		'utf8',
	)
	fs.writeFileSync(
		typesPath,
		`/** 由 language.xlsx 表头生成，不要手改 */
export type Language = ${union}

export type { LocaleKey } from './locales/types'

/** 语言配置 */
export interface LanguageItem {
	code: Language
	desc: string
	iso: string
}

/** 脚本翻译集合 */
export type ScriptTranslate = {
	[K in Language]: AnyObj
}
`,
		'utf8',
	)
	console.log(
		`locales.ts / types.d.ts 写入成功（${langs.map((item) => item.code).join(', ')}）`,
	)
}

/**
 * 添加类型说明
 * @param code
 * @param desc
 */
const addType = (
	types: string[],
	globals: string[],
	code: string,
	desc: string,
) => {
	// 获取参数列表
	let params =
		desc.match(/{([^}]+)}/g)?.map((match) => match.slice(1, -1)) || []
	params = Array.from(new Set(params))
	// 键名转类型
	const codeType = 'IN_' + code.replace(/[^a-z0-9_]/gi, '_')
	const codeDesc = `type ${codeType} = \`${desc}\``
	const tIndex = types.findIndex((item) => item.includes(`type ${codeType} `))
	// 重复则删除旧值
	if (tIndex !== -1) {
		types.splice(tIndex, 1)
	}
	types.push(codeDesc)
	if (params.length) {
		const agrs: string[] = [] // 多项参数
		const obj: Record<string, string> = {} // 对象参数
		const arr: string[] = [] // 列表参数
		params.forEach((desc) => {
			// 当为多项参数 且 为数字项则转换： 0 => _0
			const agrName = /^\d+$/.test(desc) ? `_${desc}` : desc
			agrs.push(`${agrName}?: number | string`)
			obj[desc] = 'any'
			arr.push('any')
		})
		globals.push(`(key: '${code}', ${agrs.join(', ')}): ${codeType}`)
		globals.push(
			`(key: '${code}', options: ${JSON.stringify(obj).replace(/"/g, '')}): ${codeType}`,
		)
		globals.push(
			`(key: '${code}', params: [${arr.join(', ')}]): ${codeType}`,
		)
	} else {
		globals.push(`(key: '${code}'): ${codeType}`)
	}
}

/** 读取本地 language.xlsx，生成 locales json 与类型 */
export const translateLanguageXlsx = async () => {
	if (!fs.existsSync(filePath)) {
		throw new Error(
			`[i18n] 找不到 ${filePath}，请先执行 pnpm i18n -- -fetch`,
		)
	}

	const workbook = await readXlsxWorkbook(filePath)

	let langs: ParsedLocale[] = []
	const tansLange: Record<string, Record<string, string>> = {}
	const types: string[] = []
	const globals: string[] = []
	const localeKeys: string[] = []

	workbook.eachSheet((sheet) => {
		if (sheet.name.includes('不读取')) return
		sheet.eachRow((row, rowNumber) => {
			const arr = rowToArray(row)
			if (rowNumber === 1) {
				if (!langs.length) {
					langs = parseLocalesFromHeader(arr)
					for (const lang of langs) tansLange[lang.code] = {}
				}
				return
			}
			const code = arr[0]
			if (!code) return
			const descs = arr.slice(1)
			descs.forEach((item, index) => {
				const lang = langs[index]
				if (!lang) return
				tansLange[lang.code][code] = item
				// $t 文案类型跟第一列语言（表上头一个描述列）
				if (index === 0) {
					if (!localeKeys.includes(code)) localeKeys.push(code)
					addType(types, globals, code, item)
				}
			})
		})
	})

	if (!langs.length) {
		throw new Error('[i18n] 没有可读的工作表')
	}
	writeGeneratedLocales(langs)

	const localeKeyUnion = localeKeys.length
		? localeKeys.map((key) => `\t| '${key}'`).join('\n')
		: '\t| never'
	const context = `export {}
${types.join('\n')}
export type LocaleKey =
${localeKeyUnion}
export interface locales_$t {
    ${globals.join('\n\t')}
}
import { ComposerTranslation } from 'vue-i18n'
declare module 'vue-i18n' {
    // 扩展 ComposerTranslation 接口: setup/this里的$t
  	export interface ComposerTranslation extends locales_$t {}
	// 如果 Composer 有相关接口也可以扩展: useI18n里的t
	export interface Composer {
		t: locales_$t
        $t: locales_$t
	}
    // 扩展 VueI18n(Vue 2 兼容)
    export interface VueI18n {
        t: locales_$t
    }
}
`
	if (!fs.existsSync(outPath)) fs.mkdirSync(outPath, { recursive: true })
	langs.forEach((item) => {
		const langName = item.code + '.json'
		const langPath = path.resolve(outPath, langName)
		fs.writeFile(
			langPath,
			JSON.stringify(tansLange[item.code], null, 2),
			'utf8',
			(err: any) => {
				console.log(
					`${item.desc} ${langName} 写入${err ? '失败' : '成功'}`,
				)
			},
		)
	})
	fs.writeFile(
		path.resolve(outPath, 'types.d.ts'),
		context,
		'utf8',
		(err: any) => {
			console.log(`类型文件 i18n.d.ts 写入${err ? '失败' : '成功'}`)
		},
	)
}
