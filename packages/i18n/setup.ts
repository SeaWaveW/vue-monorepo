import type { Language } from './types'
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
export { i18nLocales, languageList } from './locales'
import { i18nLocales, languageList } from './locales'

/** 路由语言前缀：/:language(chinese|english)? */
export const languagePrefix = `:language(${languageList.join('|')})?`

/** 语言包按文件动态 import，每种语言单独 chunk；新增 json 不用改代码 */
const localeLoaders = import.meta.glob('./locales/*.json')
const localeCache = new Map<Language, Record<string, string>>()

const getLocaleLoader = (lang: Language) => {
	const path = Object.keys(localeLoaders).find((item) =>
		item.endsWith(`/${lang}.json`),
	)
	return path ? localeLoaders[path] : undefined
}

/** 按需加载单个语言包（已加载过的走缓存） */
export const loadLocale = async (lang: Language) => {
	const cached = localeCache.get(lang)
	if (cached) return cached
	const load = getLocaleLoader(lang)
	if (!load) throw new Error(`[i18n] locale not found: ${lang}.json`)
	const mod = (await load()) as { default: Record<string, string> }
	localeCache.set(lang, mod.default)
	return mod.default
}

/** 语言cookie名称 */
const I18N_COOKIE_NAME = 'i18n'
/** cookie配置 */
const COOKIE_CONFIG = 'path=/; max-age=31536000; SameSite=Lax'

/** 语言cookie相关 */
export const i18nCookie = {
	get: () => {
		const row = document.cookie
			.split('; ')
			.find((item) => item.startsWith(`${I18N_COOKIE_NAME}=`))
		if (!row) return undefined
		return decodeURIComponent(
			row.slice(I18N_COOKIE_NAME.length + 1),
		) as Language
	},
	set: (language: Language) => {
		document.cookie = `${I18N_COOKIE_NAME}=${encodeURIComponent(language)}; ${COOKIE_CONFIG}`
		// html lang 用 iso（如 zh-CN），cookie / 路由仍用 code（如 chinese）
		document.documentElement.lang =
			i18nLocales.find((item) => item.code === language)?.iso || language
	},
}

/** 从路径解析语言前缀：/english/xxx → english；无则 undefined */
export const parsePathLanguage = (path: string): Language | undefined => {
	const segment = path.split('/').filter(Boolean)[0]
	return languageList.includes(segment as Language)
		? (segment as Language)
		: undefined
}

/** 替换（或补上）路径中的语言前缀：/chinese/test → /english/test */
export const replacePathLanguage = (
	path: string,
	language: Language,
): string => {
	const segments = path.split('/').filter(Boolean)
	if (segments[0] && languageList.includes(segments[0] as Language)) {
		segments[0] = language
	} else {
		segments.unshift(language)
	}
	return `/${segments.join('/')}`
}

/** 初始化语言，返回最终使用的语言码 */
export const initI18n = (): Language => {
	// 目标语言
	let targetLanguage: Language
	// 获取cookie语言
	const cookieLanguage = i18nCookie.get()
	// 获取路径语言
	const pathLanguage = parsePathLanguage(location.pathname)
	// 获取浏览器语言
	const webLanguage =
		i18nLocales.find((item) => item.iso === navigator.language)?.code ||
		languageList[1]
	// 如果存在路径语言/cookie语言
	if (pathLanguage || cookieLanguage) {
		// 情况1：路径语言不存在，但存在cookie语言，则使用cookie语言
		if (!pathLanguage && cookieLanguage) {
			targetLanguage = cookieLanguage
		}
		// 情况2：路径语言存在且为支持语言，则使用路径语言
		else if (pathLanguage && languageList.includes(pathLanguage)) {
			targetLanguage = pathLanguage
		}
		// 情况3：路径语言存在且为不支持语言，则使用浏览器语言
		else {
			targetLanguage = webLanguage
		}
	}
	// 情况4：不存在路径语言/cookie语言，则使用浏览器语言
	else {
		targetLanguage = webLanguage
	}
	// 设置语言
	i18nCookie.set(targetLanguage)
	return targetLanguage
}

/**
 * 跨标签同步语言：模块单例频道。
 * 注意：同名 BroadcastChannel 在「同一窗口的多个实例」之间会互相收到消息；
 * 单例后本窗口 post 不会回打自己，只同步其它标签页。
 */
const i18nChannel =
	typeof BroadcastChannel !== 'undefined'
		? new BroadcastChannel('i18n_channel')
		: null

/**
 * 组合式切换语言。须在 setup 调一次。
 * 改返回的 ref 会写 cookie、通知其它页签、`router.replace` 换路径前缀。
 * 从 `@saco/common/i18n` 取；主包不再导出，从 `@saco/common` 掏会拿不到。
 */
export const useI18nLanguage = () => {
	const { locale } = useI18n({ useScope: 'global' })
	const currentLanguage = ref<Language>(locale.value as Language)
	const router = useRouter()
	const route = useRoute()

	watch(
		() => currentLanguage.value,
		async (newValue, oldValue) => {
			if (oldValue === newValue) return
			// immediate 首次 oldValue 是 undefined：cookie / 路径已经对齐，不要再 replace
			if (oldValue === undefined) return
			// 设置语言
			i18nCookie.set(newValue as Language)
			// 通知其它标签页（不会通知本窗口单例自身）
			i18nChannel?.postMessage(newValue)
			// 只替换当前 URL 的语言前缀
			router.replace({
				path: replacePathLanguage(route.path, newValue as Language),
				query: route.query,
				hash: route.hash,
			})
		},
		{ immediate: true },
	)

	/** 其它标签页切换语言时同步到本页（交给 watch 写 cookie / 改路由） */
	const onChannelMessage = (e: MessageEvent<Language>) => {
		if (e.data === currentLanguage.value) return
		currentLanguage.value = e.data
	}
	i18nChannel?.addEventListener('message', onChannelMessage)

	onBeforeUnmount(() => {
		i18nChannel?.removeEventListener('message', onChannelMessage)
	})
	return currentLanguage
}
