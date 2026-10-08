import type { LanguageItem } from './types'

/** 由 language.xlsx 表头生成，不要手改 */
export const i18nLocales: LanguageItem[] = [
	{ code: "chinese", desc: "简体中文", iso: "zh-CN" },
	{ code: "english", desc: "English", iso: "en-US" },
]

/** 语言码列表 */
export const languageList = i18nLocales.map((item) => item.code)
