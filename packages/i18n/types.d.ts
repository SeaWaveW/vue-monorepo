/** 由 language.xlsx 表头生成，不要手改 */
export type Language = "chinese" | "english"

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
