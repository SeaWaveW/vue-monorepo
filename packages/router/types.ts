import type { RouteRecordRaw } from 'vue-router'
import type { LocaleKey } from '../i18n/locales/types'

interface RouteMetaBase {
	/** 默认页签 / 文档标题 i18n key；没有 valueCode 时用这个 */
	defCode?: LocaleKey
	/** 带插值的页签模板；详情 / 修改拉数后 setCacheValueCode 才生效 */
	labelCode?: LocaleKey
	/** 不走 i18n 时的标题 */
	title?: string
	/** generateRouter 写入，业务路由表不用手写 */
	cacheKey?: number
}

/** 后台壳、多页签 */
interface LayoutTabsMeta extends RouteMetaBase {
	layout: true
	single?: false
	cache?: boolean
}

/** 后台壳 + 单页：iOS 同窗跳转也要进 KeepAlive，可写 cache */
interface LayoutSingleMeta extends RouteMetaBase {
	layout: true
	single: true
	cache?: boolean
}

/** 仅单页、无 layout：不能 cache */
interface SingleOnlyMeta extends RouteMetaBase {
	layout?: false
	single: true
	cache?: never
}

/** 无 layout、非单页：不能 cache */
interface PlainMeta extends RouteMetaBase {
	layout?: false
	single?: false
	cache?: never
}

/**
 * 业务路由 `meta`。
 * `defCode` 为默认 i18n key；详情 / 修改再写 `labelCode`，拉数后 `setCacheValueCode`。
 * `cache` 仅 `layout: true` 时可写（含 `single`，同窗切页要 keep-alive）。
 */
export type AppRouteMeta =
	LayoutTabsMeta | LayoutSingleMeta | SingleOnlyMeta | PlainMeta

/** 业务 `src/router/*.ts` 用这个，不要用裸 `RouteRecordRaw` */
export interface AppRouteRecordRaw
	extends Omit<RouteRecordRaw, 'meta' | 'children'> {
	meta?: AppRouteMeta
	children?: AppRouteRecordRaw[]
}

declare module 'vue-router' {
	interface RouteMeta {
		defCode?: LocaleKey
		labelCode?: LocaleKey
		title?: string
		layout?: boolean
		single?: boolean
		cache?: boolean
		cacheKey?: number
	}
}
