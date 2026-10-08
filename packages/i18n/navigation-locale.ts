import { languageList } from './locales'
import type { Language } from './types'

/** 当前语言对应的导航名称字段，如 `chineseName` */
export type LayoutMenuLocaleName = `${Language}Name`

const resolveLanguage = (locale: string): Language => {
	const language = languageList.find((item) => item === locale)
	return language ?? languageList[0]
}

/** 当前语言对应的导航名称字段；Language 增语言时对不上会报错 */
export const getNavigationLocaleName = (
	locale: string,
): LayoutMenuLocaleName => {
	const language = resolveLanguage(locale)
	return `${language}Name`
}
