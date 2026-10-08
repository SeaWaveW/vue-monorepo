import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
/** 只取 readWebClient；走主包会把全部 @saco/ui 组件 style 打进业务 */
import { readWebClient } from '@saco/ui/es/components/config-provide'
import type { RouteLocationResolved } from 'vue-router'

/** 后台非单页共用的页签名，全站只允许这一个 */
export const LAYOUT_TAB_NAME = 'saco-layout'

/** 通知已有非单页页签做 SPA 跳转，避免 window.open 刷新 */
export const layoutTabChannel =
	typeof BroadcastChannel !== 'undefined'
		? new BroadcastChannel('sqt_layout_tab')
		: null

const WEB_CLIENT = readWebClient()

/** 普通桌面浏览器或桌面已安装 PWA。H5 / 套壳 / 手机平板 PWA 不行。进页定一次。 */
export const CAN_SWITCH_NAMED_TAB = WEB_CLIENT === 'pc' || WEB_CLIENT === 'pwa'

/** 桌面 PWA 新窗固定内容区，用户自行双击最大化 */
const PWA_TAB_FEATURES = 'popup,width=1570,height=1180'

/** 单页用路由名当页签；非单页一律 LAYOUT_TAB_NAME */
export const getPageTabName = (
	isSingle: boolean,
	routeName: unknown,
	path: string,
) => (isSingle ? String(routeName ?? path) : LAYOUT_TAB_NAME)

/**
 * 跨页签打开：同名 target 复用；已存在只 focus，需要跳转则通知对面 SPA push。
 * 不能 router.push 把单页塞进后台窗（keep-alive / 路由缓存按窗口隔离）。
 * 切不了签时退回当前页跳转。
 */
export const openNamedTab = (
	target: Pick<RouteLocationResolved, 'href' | 'fullPath'>,
	name: string,
	navigate = false,
) => {
	if (!CAN_SWITCH_NAMED_TAB) {
		window.location.assign(target.href)
		return
	}
	// 桌面 PWA 必须带尺寸，否则 Chromium 会开到系统浏览器标签
	const features = WEB_CLIENT === 'pwa' ? PWA_TAB_FEATURES : undefined
	const win = features
		? window.open('', name, features)
		: window.open('', name)
	// 被拦，或 Safari 把同名开窗折回当前窗
	if (!win || win === window) {
		window.location.assign(target.href)
		return
	}
	const focusOrPush = () => {
		win.focus()
		if (navigate) layoutTabChannel?.postMessage(target.fullPath)
	}
	try {
		const href = win.location.href
		if (!href || href === 'about:blank') {
			win.location.href = target.href
			return
		}
		focusOrPush()
	} catch {
		focusOrPush()
	}
}

export interface UseWebTabOptions {
	/** 同步 window.name 并接收其它页签跳转，仅 layout 根组件开 */
	sync?: boolean
	/** 已在目标页时回调（aside 用来关抽屉） */
	onSame?: () => void
}

/**
 * 页签跳转（单页各开一签，后台共用一签）。
 * `sync` 只给 layout 开，避免 aside 再挂一份监听。
 */
export const useWebTab = (options: UseWebTabOptions = {}) => {
	const route = useRoute()
	const router = useRouter()

	if (options.sync) {
		watch(
			() => [route.meta.single, route.name, route.path] as const,
			([single, name, path]) => {
				window.name = getPageTabName(Boolean(single), name, path)
			},
			{ immediate: true },
		)

		const onLayoutTabMessage = (event: MessageEvent<string>) => {
			if (route.meta.single) return
			const path = event.data
			if (path && path !== route.fullPath) router.push(path)
		}

		onMounted(() => {
			layoutTabChannel?.addEventListener('message', onLayoutTabMessage)
		})
		onBeforeUnmount(() => {
			layoutTabChannel?.removeEventListener('message', onLayoutTabMessage)
		})
	}

	const openTab = (path: string) => {
		const targetRoute = router.resolve(path)
		options.onSame?.()
		if (targetRoute.name !== route.name) {
			if (targetRoute.meta.single) {
				// 情况1: 单页 — 每种单页一个页签
				openNamedTab(
					targetRoute,
					getPageTabName(true, targetRoute.name, targetRoute.path),
				)
			} else if (route.meta.single) {
				// 情况2：从单页回非单页 — 全站只复用一个后台页签
				openNamedTab(targetRoute, LAYOUT_TAB_NAME, true)
			} else {
				// 情况3：非单页之间
				router.push(path)
			}
		}
	}

	return { openTab }
}
