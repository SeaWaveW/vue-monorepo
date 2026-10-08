import { inject, type InjectionKey } from 'vue'
import type { LayoutMenuProvide } from '../types'

/** CommonLayout provide，菜单收藏 / logo 从这里取，不要再从业务 auto-import API */
export const LAYOUT_MENU_KEY: InjectionKey<LayoutMenuProvide> =
	Symbol('layout-menu')

/** aside / 菜单内部用。没经过 CommonLayout 就是漏传 favorite */
export const useLayoutMenu = () => {
	const ctx = inject(LAYOUT_MENU_KEY)
	if (!ctx) {
		throw new Error('[layout] CommonLayout 须传 favorite')
	}
	return ctx
}
