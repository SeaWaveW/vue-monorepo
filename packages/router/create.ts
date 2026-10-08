import {
	createRouter,
	createWebHistory,
	type RouteComponent,
	type RouteRecordRaw,
	type Router,
} from 'vue-router'
import {
	languagePrefix,
	resolveI18nRedirect,
	syncI18nLocaleFromRoute,
	i18n,
	replacePathLanguage,
} from '../i18n'
import { pinia } from '../pinia'
import {
	mutateRoute,
	resolveCacheTitle,
	setDocumentTitle,
	useRouterStore,
	useSettingStore,
	useUserStore,
} from '../store'
// import { CAN_SWITCH_NAMED_TAB } from '../layout/utils/webTab'
import type { Language } from '../i18n/types'
import type { LocaleKey } from '../i18n/locales/types'
import type { AppRouteRecordRaw } from './types'
import { confirmBox, updateVersionBox } from '../utils/message'
import { request } from '../axios/http'

/** 业务 glob `@/router/*.ts` 的模块形 */
export type RouterModuleMap = Record<
	string,
	{ default?: AppRouteRecordRaw | AppRouteRecordRaw[] }
>

/** 权限鉴定返回值：true / void 放行；false 去 403；字符串则跳该 path */
export type CheckPermissionResult = boolean | string | void

/** 首页 / 登录 / 404：path 不含语言前缀，如 `/home` */
export interface AppPageRoute {
	name: string
	path: string
	component: RouteComponent
	/** 首页用 `defCode` 做 i18n 标题；登录 / 404 可不写 */
	meta?: {
		defCode?: LocaleKey
		title?: string
	}
}

export interface CreateAppRouterOptions {
	/** 布局组件。菜单已在 CommonLayout 侧栏，业务只传 logo / favorite */
	layout: RouteComponent
	home: AppPageRoute
	login: AppPageRoute
	notFound: AppPageRoute
	modules?: RouterModuleMap
	/** 业务 `import.meta.env.VITE_APP_TITLE` */
	appTitle: string
}

/**
 * 把业务路由表写进 layout children 或 404 前。
 * 根级补语言前缀；子级拼父 path；没写 layout 则跟父级。
 */
export const generateRouter = (
	list: AppRouteRecordRaw[] = [],
	routes: RouteRecordRaw[],
	prefix: string,
	parent?: AppRouteRecordRaw,
) => {
	list.forEach((item) => {
		if (parent) {
			item.path = parent.path + item.path
		} else {
			item.path = `/${prefix}${item.path === '/' ? '' : item.path}`
		}
		if (!item.meta) item.meta = {}
		if (!('layout' in item.meta)) {
			const layout = parent?.meta?.layout ?? false
			item.meta = { ...item.meta, layout } as AppRouteRecordRaw['meta']
		}
		if (item.component ?? item.components) {
			if (item.meta?.layout) {
				item.meta.cacheKey = Date.now()
				// // 不是 pc / pwa：单页改成后台页，当前窗 KeepAlive (pwa 仍走 window.open（带尺寸，开应用窗而不是系统浏览器）)
				// if (item.meta.single) {
				// 	item.meta.cache = true
				// 	if (!CAN_SWITCH_NAMED_TAB) {
				// 		item.meta = {
				// 			...item.meta,
				// 			single: false,
				// 		} as AppRouteRecordRaw['meta']
				// 	}
				// }
				routes[0].children!.push(item as RouteRecordRaw)
			} else {
				routes.splice(routes.length - 1, 0, item as RouteRecordRaw)
			}
		}
		if (Array.isArray(item.children)) {
			generateRouter(item.children, routes, prefix, item)
		}
	})
}

/**
 * 菜单 `pagePath` 补当前语言后和 `to.path` 对齐。
 * 详情 / 编辑是列表的子 path，跟父前缀也算有权限；`/user` 不能误伤 `/user-group`。
 */
const matchRouterPath = (paths: string[], toPath: string) => {
	const language = i18n.global.locale.value as Language
	return paths.some((item) => {
		const allowed = replacePathLanguage(item, language)
		return toPath === allowed || toPath.startsWith(`${allowed}/`)
	})
}

/** 更新弹窗还开着。再切页不要叠第二层 */
let updatePrompting = false

/** 已经对上过新版本。之后的切页立刻提示，不再发请求 */
let buildStale = false

/** 打包写进页面的版本。没挂插件时是空，不要发请求 */
const readLocalBuildVersion = () => {
	const version = import.meta.env.VITE_APP_BUILD_VERSION
	return typeof version === 'string' ? version : ''
}

/**
 * 切页时顺手拉 version.json，这次跳转不等它。
 * 请求失败或没有这个文件不提示，离线或旧包还没这份文件时照常进页。
 */
const checkBuildVersion = () => {
	if (updatePrompting || buildStale) return
	const localVersion = readLocalBuildVersion()
	if (!localVersion) return
	const base = import.meta.env.BASE_URL
	request
		.get<string>(`${base}version.json?t=${Date.now()}`, {
			baseURL: window.location.origin,
			noAuth: true,
			noErrorTip: true,
		})
		.then((res) => {
			if (!res.data || res.data === localVersion) return
			buildStale = true
			promptBuildUpdate()
		})
		.catch(() => {
			// 离线或没有这个文件时不提示
		})
}

/** Chrome / Firefox / Safari 对动态 import 失败的文案不一样 */
const isStaleChunkError = (error: unknown) => {
	const message = error instanceof Error ? error.message : String(error)
	return (
		message.includes('Failed to fetch dynamically imported module') ||
		message.includes('Importing a module script failed') ||
		message.includes('error loading dynamically imported module')
	)
}

/**
 * 对不上就提示更新。确认后强刷当前页。
 * 先卸掉 Service Worker 和它预缓存的上一版 index.html，否则 reload 还是旧壳，版本号对不上，提示会再来一次。
 */
const promptBuildUpdate = () => {
	if (updatePrompting) return
	updatePrompting = true
	updateVersionBox()
		.then(() => {
			const reload = () => {
				window.location.reload()
			}
			const dropStaleShell = async () => {
				if ('serviceWorker' in navigator) {
					const regs =
						await navigator.serviceWorker.getRegistrations()
					await Promise.all(regs.map((reg) => reg.unregister()))
				}
				if ('caches' in window) {
					const keys = await caches.keys()
					await Promise.all(keys.map((key) => caches.delete(key)))
				}
			}
			dropStaleShell().finally(reload)
		})
		.catch(() => {
			// 弹窗被关掉时允许下一次切页再提示
			updatePrompting = false
		})
}

/**
 * 本包路由单例。createAppRouter 赋值；页签 store 直接引，不要 useRouter()。
 */
export let router: Router

/**
 * 调用时再读。axios 顶层 `import { router }` 碰上循环依赖会一直是 undefined，
 * 登录 / 401 里 replace 会炸。
 */
export const getAppRouter = () => router

/**
 * 工厂：后台 layout + 首页 / 登录 / 404，再吞业务 glob。
 * i18n / pinia 用本包单例；路由表、页面组件仍由各端传入。
 */
export const createAppRouter = (options: CreateAppRouterOptions): Router => {
	const { home, login, notFound } = options

	const routes = [
		{
			path: `/${languagePrefix}`,
			redirect: (to) => {
				const lang = to.params.language
				return typeof lang === 'string'
					? `/${lang}${home.path}`
					: home.path
			},
			component: options.layout,
			children: [
				{
					path: `/${languagePrefix}${home.path}`,
					name: home.name,
					component: home.component,
					meta: {
						layout: true,
						cache: true,
						defCode: home.meta?.defCode ?? 'home_title',
						title: home.meta?.title,
					},
				},
			],
		},
		{
			path: `/${languagePrefix}${login.path}`,
			name: login.name,
			component: login.component,
			meta: {
				defCode: login.meta?.defCode ?? 'login',
				title: login.meta?.title,
			},
		},
		{
			path: `/${languagePrefix}${notFound.path}`,
			name: notFound.name,
			component: notFound.component,
			redirect: () => {
				const userStore = useUserStore(pinia)
				const routerStore = useRouterStore(pinia)
				// catch-all：未登录去登录，已登录回首页，不要停在 404
				return userStore.userId
					? routerStore.homePath
					: routerStore.loginPath
			},
			meta: {
				defCode: notFound.meta?.defCode ?? 'not_found',
				title: notFound.meta?.title,
			},
		},
	] as RouteRecordRaw[]

	const files = options.modules ?? {}
	Object.keys(files).forEach((paths) => {
		const value = files[paths]?.default
		if (value) {
			const values = Array.isArray(value) ? value : [value]
			generateRouter(values, routes, languagePrefix)
		}
	})

	// 创建路由
	router = createRouter({
		history: createWebHistory(),
		routes,
	})

	// 分包已经从服务器删了，version.json 还没回来时也要提示，不要只在控制台留 MIME 报错
	router.onError((error) => {
		if (!isStaleChunkError(error)) return
		buildStale = true
		promptBuildUpdate()
	})

	// 获取路由存储
	const routerStore = useRouterStore(pinia)
	// 合并首页路由
	Object.assign(routerStore.homeRoute, {
		path: home.path,
		name: home.name,
		meta: {
			...home.meta,
			layout: true,
			defCode: home.meta?.defCode ?? 'home_title',
		},
	})
	// 登录 path 给 axios clearAuthStorage / 未登录守卫，避免写死 '/login'
	Object.assign(routerStore.loginRoute, {
		path: login.path,
		name: login.name,
		meta: {
			...login.meta,
			defCode: login.meta?.defCode ?? 'login',
		},
	})
	// 设置应用标题
	routerStore.appTitle = options.appTitle

	/* 前置守卫 */
	router.beforeEach(async (to) => {
		const routerStore = useRouterStore(pinia)
		const userStore = useUserStore(pinia)
		const i18nRedirect = resolveI18nRedirect(to)
		/* 语言校正后重定向 */
		if (i18nRedirect) {
			routerStore.clearCache()
			return i18nRedirect
		}
		/* 同步语言 */
		await syncI18nLocaleFromRoute(to)

		// 已经知道有新版本：立刻提示，不再进旧分包。还没对过的这次不挡跳转
		if (buildStale) {
			promptBuildUpdate()
			return false
		}
		checkBuildVersion()

		// 如果是去登录页且存在ID，则不允许
		if (to.path === routerStore.loginPath && userStore.userId) {
			return routerStore.homePath
		}

		/* 权限鉴定：未登录去业务配置的登录页（带当前语言前缀） */
		if (!userStore.userId && to.meta?.layout) {
			return routerStore.loginPath
		}

		/* 添加缓存：菜单没有这条 layout 路由则回首页 */
		if (to.meta.layout) {
			const isHome = to.name === routerStore.homeRoute.name
			if (!isHome && !matchRouterPath(userStore.routerPaths, to.path)) {
				return routerStore.homePath
			}
			// 已在页签里只是切签，不占新格；满 10 且要新开才腾位。单页不进 tabs，不占格
			if (
				!to.meta.single &&
				routerStore.getCacheIndex(to.path) === -1 &&
				routerStore.tabs.length >= 10
			) {
				// 拿到关闭路由（如果是当前激活的，则顺延到下一个）
				const firstTab = routerStore.tabs[1]
				const targetTab =
					firstTab.path === routerStore.active
						? routerStore.tabs[2]
						: firstTab

				const settingStore = useSettingStore(pinia)
				// false 表示勾过「不再提示」，直接腾位
				if (settingStore.tabsMoreTips) {
					const openName = resolveCacheTitle(to.meta)
					const closeName = resolveCacheTitle(targetTab.meta)
					try {
						const { remember } = await confirmBox({
							title: 'router_max_title',
							message: 'router_max_message',
							names: [
								{ value: openName, type: 'primary' },
								{ value: closeName, type: 'danger' },
							],
							confirmButtonText: 'continue',
							confirmButtonType: 'warning',
							showRemember: true,
							rememberText: 'do_not_show_again',
						})
						// 只在确认时写入；取消 reject，进 catch 拦路由
						if (remember) {
							settingStore.setTabsMoreTips(false)
						}
					} catch {
						return false
					}
				}
				routerStore.delCache(targetTab.path)
			}
			const route = await mutateRoute(to)
			routerStore.addCache(route)
		}
	})

	/* 后置守卫 */
	router.afterEach((to, from, failure) => {
		// 导航被取消 / 重定向失败时不要把页签高亮改到没进去的地址
		if (failure) return
		const routerStore = useRouterStore(pinia)
		const { layout } = to.meta ?? {}
		/* 后台页设置缓存 */
		if (layout) {
			routerStore.setCacheActive(to.path, from.path)
		}
		/* 单页或普通页清除缓存 */
		else {
			setDocumentTitle(to.meta)
			routerStore.clearCache()
		}
	})

	/** 同地址再进才改 cacheKey；切页签也刷的话 main 里 key 变了，KeepAlive 对不上 */
	const refreshLayoutCacheIfSamePath = async (target: {
		path: string
		meta: { layout?: boolean }
	}) => {
		const currentPath = router.currentRoute.value.path
		if (target.meta.layout && target.path === currentPath) {
			await useRouterStore(pinia).refreshCache(target.path)
		}
	}

	/** 前往路由 */
	const routerPush = router.push
	router.push = function (route) {
		const newRoute = router.resolve(route)
		return routerPush.call(this, newRoute).catch((err) => err)
	}

	/* 替换路由：刷新按钮走 replace 同 path，靠改 cacheKey 让页面重挂 */
	const routerReplace = router.replace
	router.replace = async function (route) {
		const newRoute = router.resolve(route)
		await refreshLayoutCacheIfSamePath(newRoute)
		return routerReplace.call(this, newRoute).catch((err) => err)
	}

	return router
}
