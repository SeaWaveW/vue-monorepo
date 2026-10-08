import { getNavigationLocaleName, languageList } from '#/i18n'
import type { Language, LocaleKey } from '#/i18n'
import type {
	AdminNavigationDetailResponse,
	AdminNavigationTreeRecord,
} from '@/api/types/admin-navigation'

/** 当前语言对应的导航名称字段；Language 增语言或改名字段时对不上会报错 */
export type NavigationLocaleName = `${Language}Name` &
	keyof AdminNavigationTreeRecord

/** 导航名称表单文案；Language 增语言或 locales 缺 key 时对不上会报错 */
export type NavigationNameLocaleKey = `navigation_${Language}_name` & LocaleKey

/** 详情里父导航名称字段；与 Language 同步，缺 parentXxxName 会报错 */
export type NavigationParentLocaleName = `parent${Capitalize<Language>}Name` &
	keyof AdminNavigationDetailResponse

const resolveLanguage = (locale: string): Language => {
	const language = languageList.find((item) => item === locale)
	return language ?? languageList[0]
}

const capitalize = <S extends string>(value: S): Capitalize<S> => {
	return `${value.charAt(0).toUpperCase()}${value.slice(1)}` as Capitalize<S>
}

/** 详情里父导航名称字段，如 parentChineseName */
export const getNavigationParentLocaleName = (
	locale: string,
): NavigationParentLocaleName => {
	const language = resolveLanguage(locale)
	return `parent${capitalize(language)}Name`
}

/** 导航名称表单文案 key，如 navigation_chinese_name */
export const getNavigationNameLabelKey = (
	language: Language,
): NavigationNameLocaleKey => {
	return `navigation_${language}_name`
}

/** 新增表单各语言名称的空值 */
export const getEmptyNavigationNames = (): Record<
	NavigationLocaleName,
	string
> => {
	const names = {} as Record<NavigationLocaleName, string>
	languageList.forEach((language) => {
		// 公共库只保证 `${Language}Name`，这里要落到本端导航行字段上
		names[getNavigationLocaleName(language) as NavigationLocaleName] = ''
	})
	return names
}
