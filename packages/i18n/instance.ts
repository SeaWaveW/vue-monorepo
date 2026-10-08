import { createI18n } from 'vue-i18n'
import type { RouteLocationNormalized } from 'vue-router'
import type { Language } from './types'
export type { Language }
import { initI18n, i18nCookie, languageList, loadLocale } from './setup'

/** 当前语言码 */
const language = initI18n()

/** 创建 i18n 实例；当前语言在模块加载时灌入，其它语言切的时候再动态 import */
export const i18n = createI18n({
	legacy: false,
	globalInjection: true,
	locale: language,
	fallbackLocale: language,
	messages: {} as Record<Language, Record<string, string>>,
})

/** 按需加载并切换语言（路由 / 切换器用） */
export const setI18nLocale = async (lang: Language) => {
	if (!i18n.global.availableLocales.includes(lang)) {
		i18n.global.setLocaleMessage(lang, await loadLocale(lang))
	}
	i18n.global.locale.value = lang
	i18nCookie.set(lang)
}

/**
 * 首屏 App.vue 就会 t()（如 ConfigProvide 的 weekDays），不能等路由 beforeEach。
 * 这里顶层 await 当前语言包；业务 `import { i18n }` 之后 messages 已有，不会 intlify 空包警告。
 */
await setI18nLocale(language)

/** 是否为支持语言 */
export const isSupportedLanguage = (lang: Language) => {
	return languageList.includes(lang)
}

/**
 * 校正语言前缀：需要跳转返回目标 path，否则返回 undefined（放行）
 * - 已有合法语言：不跳转
 * - 已匹配路由：前置语言 /test → /chinese/test
 * - 未匹配：首段当非法语言替换 /tw/test → /chinese/test
 */
export const resolveI18nRedirect = (to: RouteLocationNormalized) => {
	const currentLang = i18n.global.locale.value as Language
	const segments = to.path.split('/').filter(Boolean)
	const first = segments[0]
	if (first && isSupportedLanguage(first as Language)) return

	const pageSegments = to.matched.length > 0 ? segments : segments.slice(1)
	const target = `/${[currentLang, ...pageSegments].join('/')}${to.fullPath.slice(to.path.length)}`
	return target === to.fullPath ? undefined : target
}

/** 根据路由路径加载并同步当前语言（进页必等当前语言包） */
export const syncI18nLocaleFromRoute = async (to: RouteLocationNormalized) => {
	const lang = to.path.split('/').filter(Boolean)[0] as Language | undefined
	if (lang && isSupportedLanguage(lang)) {
		await setI18nLocale(lang)
	}
}
