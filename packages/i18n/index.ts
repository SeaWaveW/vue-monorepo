/**
 * 子路径 `@saco/common/i18n` 公开出口。
 * setup + 实例一起列出：消费方从这里取全部 i18n API（会 createI18n，这是预期的）。
 * 禁止再从主包 `@saco/common` 掏；主包再导出会让业务误绑两套入口。
 */
export {
	useI18nLanguage,
	initI18n,
	i18nCookie,
	languagePrefix,
	languageList,
	i18nLocales,
	loadLocale,
	parsePathLanguage,
	replacePathLanguage,
} from './setup'
export { getNavigationLocaleName } from './navigation-locale'
export type { LayoutMenuLocaleName } from './navigation-locale'
export {
	i18n,
	setI18nLocale,
	isSupportedLanguage,
	resolveI18nRedirect,
	syncI18nLocaleFromRoute,
} from './instance'
export type * from './types'
