import type { ComponentPublicInstance } from 'vue'
import type { LocaleKey } from '../i18n/locales/types'
import type { RouteLocationNormalizedGeneric } from 'vue-router'
import { createStore, pinia } from '../pinia'
import { i18n, replacePathLanguage, type Language } from '../i18n'
import { router } from '../router/create'

/** 只留页签 / keep-alive 用到的字段，避免把 vue-router 内部 symbol 导出 */
export interface RouterCacheMeta {
	/** 缓存 key */
	cacheKey?: number
	/** 不走 i18n 时的标题 */
	title?: string
	/** 默认页签 / 文档标题 i18n key；没有 valueCode 时用这个 */
	defCode?: LocaleKey
	/** 带插值的页签模板，如 `backend_user_manage_detail_any`；有 valueCode 才用 */
	labelCode?: LocaleKey
	/** 详情 / 修改拉到的区分值（用户名等）；有则 `t(labelCode, [valueCode])` */
	valueCode?: string
	/** 是否缓存 */
	cache?: boolean
	/** 是否后台布局 */
	layout?: boolean
	/** 是否单页 */
	single?: boolean
	/** 首次打开该签的来时路由；切签再进不改，否则返回会指到刚离开的签 */
	parentPath?: string
	[key: string]: unknown
}

/**
 * 页签 / 文档标题。
 * 有 valueCode 且配了 labelCode → `t(labelCode, [valueCode])`；
 * 否则走 defCode，再没有才用 title。
 */
export const resolveCacheTitle = (meta?: RouterCacheMeta) => {
	const { title, defCode, labelCode, valueCode } = meta ?? {}
	if (valueCode && labelCode) {
		return String(i18n.global.t(labelCode, [valueCode]))
	}
	if (defCode) {
		return String(i18n.global.t(defCode))
	}
	return title ? String(title) : ''
}

export interface RouterCache {
	path: string
	name: string | symbol | undefined | null
	meta: RouterCacheMeta
}

type VCache = Set<unknown>

/**
 * 去掉 matched，避免 KeepAlive deactivate 报错。
 */
export const mutateRoute = (
	route: RouteLocationNormalizedGeneric,
): Promise<RouterCache> => {
	return Promise.resolve({
		path: route.path,
		name: route.name ?? undefined,
		meta: { ...(route.meta as RouterCacheMeta) },
	})
}

/**
 * 网页标题：业务名 - 应用名。
 * 应用名是 `createAppRouter` 写入 store 的 `appTitle`。
 * 可传整份 meta（走 defCode / labelCode / valueCode），或旧的 (title, code)。
 */
export const setDocumentTitle = (
	titleOrMeta?: unknown,
	code?: unknown,
) => {
	const titles = [useRouterStore(pinia).appTitle]
	if (titleOrMeta && typeof titleOrMeta === 'object') {
		const name = resolveCacheTitle(titleOrMeta as RouterCacheMeta)
		if (name) titles.unshift(name)
	} else if (code) {
		titles.unshift(String(i18n.global.t(String(code))))
	} else if (titleOrMeta) {
		titles.unshift(String(titleOrMeta))
	}
	document.title = titles.join(' - ')
}

export const useRouterStore = createStore(
	'router',
	{
		state: () => {
			return {
				/** 首页：createAppRouter 写入，path 不含语言前缀 */
				homeRoute: {} as RouterCache,
				/** 登录页：同上，给鉴权失败 / clearAuthStorage 跳转用 */
				loginRoute: {} as RouterCache,
				appTitle: '',
				routes: [] as Array<RouterCache>,
				active: '' as RouterCache['path'],
				keepAlive: null as unknown as ComponentPublicInstance,
			}
		},
		actions: {
			/**
			 * 获取缓存位置
			 * @param path 路由地址
			 */
			getCacheIndex(path: RouterCache['path']) {
				return this.routes.findIndex((item) => item.path === path)
			},
			/**
			 * 添加缓存
			 * @param route mutateRoute 转换后的路由
			 */
			addCache(route: RouterCache) {
				if (this.getCacheIndex(route.path) !== -1) return
				const isHome = route.name === this.homeRoute.name
				const homeIndex = this.routes.findIndex(
					(item) => item.name === this.homeRoute.name,
				)
				if (isHome) {
					// 已有首页签：只换成带语言前缀的那条，避免 /home 和 /chinese/home 各占一格
					if (homeIndex !== -1) {
						this.routes[homeIndex] = route
						return
					}
					this.routes.unshift(route)
					return
				}
				// 直进业务页时还没有首页签；必须用 homePath，homeRoute.path 不含语言
				if (homeIndex === -1) {
					this.routes.unshift({
						...this.homeRoute,
						path: this.homePath,
					})
				}
				this.routes.push(route)
			},
			/**
			 * 刷新缓存
			 * @param path 路由地址
			 */
			refreshCache(path: RouterCache['path']) {
				const index = this.getCacheIndex(path)
				if (index === -1) return
				this.routes[index].meta!.cacheKey = Date.now()
			},
			/**
			 * 详情 / 修改拉到数据后写入区分值。
			 * path 必须是本页进页时的地址，不能用回调里的 currentRoute：
			 * 请求回来前用户可能已经切到别的签，写错签标题。
			 * 写完后若该签仍是当前签，才同步 document.title。
			 */
			setCacheValueCode(
				path: RouterCache['path'],
				valueCode?: string | number,
			) {
				if (valueCode == null || valueCode === '') return
				const index = this.getCacheIndex(path)
				if (index === -1) return
				this.routes[index].meta!.valueCode = String(valueCode)
				if (this.active === path) {
					setDocumentTitle(this.routes[index].meta)
				}
			},
			/**
			 * 修改缓存标题（不走 i18n）
			 */
			setCacheTitle(path: RouterCache['path'], title: string) {
				const index = this.getCacheIndex(path)
				if (index === -1) return
				this.routes[index].meta!.title = title
			},
			/**
			 * 删除缓存；删的是当前页则切到相邻或首页
			 */
			delCache(path: RouterCache['path']) {
				const index = this.getCacheIndex(path)
				if (index === -1) return
				this.routes.splice(index, 1)
				if (this.active === path) {
					const nextRoute =
						this.routes[index] ?? this.routes[index - 1]
					if (nextRoute) {
						this.active = nextRoute.path
						router.push(nextRoute.path)
					} else {
						this.active = this.homePath
						router.push(this.homePath)
					}
				}
			},
			/**
			 * 切换缓存
			 */
			switchCache(path: RouterCache['path']) {
				this.active = path
				router.push(path)
			},
			/**
			 * 切语言：换路径前缀并重挂当前页，只刷一次。
			 * 新 cacheKey 先写到目标签，active 仍是当前页；不能 switchCache（会先改 active，旧 path + 新 key 先刷一次）。
			 * 不能先 clearCache：active 清空当前页会先刷一次。导航完成后再丢掉旧语言签，只留首页 + 当前签。
			 */
			async switchLanguageCache(language: Language) {
				const current = router.currentRoute.value
				const resolved = router.resolve({
					path: replacePathLanguage(current.path, language),
					query: current.query,
					hash: current.hash,
				})
				const newRoute = await mutateRoute(
					resolved as RouteLocationNormalizedGeneric,
				)
				const currentCache = this.routes.find(
					(item) => item.path === current.path,
				)
				// 切语言只换前缀，详情签上的区分值要跟着走，否则又变回「后台用户详情」
				if (currentCache?.meta?.valueCode) {
					newRoute.meta.valueCode = currentCache.meta.valueCode
				}
				// 新 key 先写在目标签上；这时 active 还是当前页，cacheKey getter 不会变
				newRoute.meta.cacheKey = Date.now()
				this.addCache(newRoute)
				this.refreshCache(newRoute.path)
				// 不能 switchCache：会先改 active，旧 path + 新 key 先刷一次，push 完再刷一次
				await router.push(newRoute.path)
				const cache = this.routes.find(
					(item) => item.path === newRoute.path,
				)
				if (!cache) return
				// 导航完成后再丢掉旧语言签；先 clearCache 会把 active 清空，当前页先刷一次
				this.routes =
					cache.name === this.homeRoute.name
						? [cache]
						: [{ ...this.homeRoute, path: this.homePath }, cache]
			},
			/**
			 * 设置选中并改标题
			 */
			setCacheActive(
				path: RouterCache['path'],
				parentPath?: RouterCache['path'],
			) {
				const index = this.getCacheIndex(path)
				if (index === -1) return
				// 有来时路由、去掉语言后不是 /、且这签还没记过父页才写；已有就留下，切签再进不要覆盖
				const realParentPath = replacePathLanguage(
					parentPath ?? '',
					i18n.global.locale.value as Language,
				)
				if (
					parentPath &&
					realParentPath !== '/' &&
					this.routes[index].meta &&
					!this.routes[index].meta.parentPath
				) {
					this.routes[index].meta.parentPath = realParentPath
				}
				// 设置标题：有 valueCode 走插值模板，否则 defCode
				setDocumentTitle(this.routes[index].meta)
				this.active = path
			},
			/**
			 * 清空缓存（离开后台布局时）
			 */
			clearCache() {
				this.routes = []
				this.active = ''
			},
			/**
			 * 获取 KeepAlive 实例
			 */
			registerKeepAliveDestroy(instance: ComponentPublicInstance) {
				this.keepAlive = instance
			},
			/**
			 * 销毁 keep-alive 中的组件实例
			 */
			destroyKeepAliveCache(route: RouterCache) {
				const component = this.keepAlive?.$?.vnode?.component as {
					__v_cache?: VCache
				}
				const vCache = component?.__v_cache
				if (!vCache) return
				const cacheMaps = {} as Record<string, unknown>
				for (const [key, value] of vCache.entries()) {
					const el = (value as { el?: { baseURI?: string } }).el
					if (!el?.baseURI) continue
					const path = new URL(el.baseURI).pathname
					cacheMaps[path] = key
				}
				const cache = cacheMaps[route.path]
				if (cache) {
					vCache.delete(cache)
				}
			},
			/**
			 * 拖拽换页签顺序。
			 * 首页签钉在首位：不能当拖源也不能当落点，避免和业务签对调。
			 */
			sortCache(
				fromPath: RouterCache['path'],
				toPath: RouterCache['path'],
			) {
				const fromIndex = this.getCacheIndex(fromPath)
				const toIndex = this.getCacheIndex(toPath)
				if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
					return
				}
				const isHome = (item: RouterCache) =>
					item.name === this.homeRoute.name
				if (
					isHome(this.routes[fromIndex]) ||
					isHome(this.routes[toIndex])
				) {
					return
				}
				const list = this.routes.slice()
				const [moved] = list.splice(fromIndex, 1)
				list.splice(toIndex, 0, moved)
				this.routes = list
			},
			/**
			 * 关闭其它缓存(暂时无用：记得用到时将homeRoute放第一位)
			 */
			closeOtherCache(path: RouterCache['path']) {
				const cache = this.routes.find((item) => item.path === path)
				if (!cache) return
				this.routes =
					cache.name === this.homeRoute.name
						? [cache]
						: [{ ...this.homeRoute, path: this.homePath }, cache]
				this.setCacheActive(cache.path)
				router.push(cache.path)
			},
			/**
			 * 关当前页回到父路由。
			 * 先 meta.parentPath，没有再用入参 path；统一 replacePathLanguage，避免一边已带语言一边才补。
			 * 父签已不在 routes 里也走入参：编辑页会先 delCache 详情，否则 push 会把旧详情加回来。
			 * 两头都空就 return：push('') 会落到 /:language，不是父页。
			 * 第一个参数可直接传 true：已有 parentPath，只要重挂，不必 goParentRoute(undefined, true)。
			 * refresh 默认 false：父页还在 KeepAlive 里，不改 cacheKey，搜索/滚动还在。
			 * refresh 为 true 才 refreshCache：push 目标 path 不同，create.ts 不会改 cacheKey，不调就整页不重挂。
			 * 列表重新请求不要靠这个参数，走 useSameChannel。
			 */
			goParentRoute(
				path?: RouterCache['path'] | boolean,
				refresh = false,
			) {
				// 只传 true：已有 parentPath，只要重挂；boolean 当 path 会拼进地址
				if (typeof path === 'boolean') {
					refresh = path
					path = undefined
				}
				const parentPath = this.getParentRoute()
				// 父签已经不在 routes 里（编辑页会先 delCache 详情）就不能再当目标，push 会把签加回来
				const rawPath =
					(parentPath && this.getCacheIndex(parentPath) !== -1
						? parentPath
						: undefined) ?? path
				if (!rawPath) return
				// 补充语言前缀
				const realParentPath = replacePathLanguage(
					rawPath,
					i18n.global.locale.value as Language,
				)
				// 要重挂才改 cacheKey；默认留下 KeepAlive，搜索/滚动还在
				if (refresh) this.refreshCache(realParentPath)
				// delCache 在当前仍是 active 时会再 push 相邻签，先改成父页
				this.active = realParentPath
				// 删除当前路由缓存（同步取值，此时还没 push，currentRoute 仍是本页）
				this.delCache(router.currentRoute.value.path)
				// 前往路由
				router.push(realParentPath)
			},
			/**
			 * 读页签上 setCacheActive 写下的来时 path。
			 * 当前 path 不在 routes 里或没记过父页时是 undefined，goParentRoute 再用入参兜底。
			 */
			getParentRoute(path?: RouterCache['path']) {
				const currentPath = path ?? router.currentRoute.value.path
				const index = this.getCacheIndex(currentPath)
				if (index === -1) return
				const currentRoute = this.routes[index]
				return currentRoute.meta?.parentPath
			},
		},
		getters: {
			/** 首页 path 补当前语言前缀：/home → /chinese/home */
			homePath() {
				return replacePathLanguage(
					this.homeRoute.path,
					i18n.global.locale.value as Language,
				)
			},
			/** 登录 path 补当前语言前缀：跟 createAppRouter 的 login.path，勿写死 /login */
			loginPath() {
				return replacePathLanguage(
					this.loginRoute.path,
					i18n.global.locale.value as Language,
				)
			},
			/** 页签栏用；`single` 单页只走 header 居中标题，不占签 */
			tabs() {
				return this.routes.filter((item) => {
					return !item.meta?.single
				})
			},
			cacheList() {
				return this.routes
					.map((item) => (item.meta?.cache ? item.name : null))
					.filter(Boolean) as string[]
			},
			cacheKey() {
				const cache = this.routes.find(
					(item) => item.path === this.active,
				)
				return cache?.meta?.cacheKey as number
			},
		},
	},
	['routes', 'active'],
	false,
)
