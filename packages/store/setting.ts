import { createStore } from '../pinia'
import { setRemUserRoot } from '@saco/rem-plugin'
import { useUserStore } from './user'

/**
 * 布局设置（字号、菜单、页签提示）。
 * `fontSize` 是设计稿宽度下的偏好根字号，交给 `@saco/rem-plugin` 的 `setRemUserRoot`。
 * 不要写 `--font-size`：theme 里的 16px 已被转 rem，跟 html 根走。
 * persist `fontSize` / `menuCollapsed` / `tabsMoreTips`；其它页签 `$patch` 后走 `asyncStore` 再套一次 rem。
 */
export const useSettingStore = createStore(
	'setting',
	{
		state: () => ({
			/** 设计稿宽度下的偏好根字号（px） */
			fontSize: 14,
			/** 菜单是否折叠 */
			menuCollapsed: false,
			/** 页签满员是否弹确认；默认开，勾「不再提示」后为 false */
			tabsMoreTips: true,
		}),
		actions: {
			/**
			 * 写入偏好字号并套到 rem 根。
			 * persist 水合后也要调，否则刷新只靠 rem 自己的 localStorage。
			 */
			setFontSize(size: number) {
				this.fontSize = size
				setRemUserRoot(size)
			},
			/** 设置菜单是否折叠 */
			setMenuCollapsed(isCollapsed: boolean) {
				this.menuCollapsed = isCollapsed
			},
			/** 写入页签满员是否弹确认；勾「不再提示」传 false */
			setTabsMoreTips(showTips: boolean) {
				this.tabsMoreTips = showTips
			},
			/** 其它页签把 state 同步过来之后，html 根不会自己跟 */
			asyncStore() {
				setRemUserRoot(this.fontSize)
			},
		},
		getters: {
			/**
			 * 侧栏展示用折叠。没有可访问菜单时一律当折叠，避免空白宽栏；
			 * 有菜单才跟 persist 的 menuCollapsed，不要在 setAccessibleMenu 里改偏好。
			 */
			isMenuCollapsed(): boolean {
				return (
					!useUserStore().accessibleMenu.length || this.menuCollapsed
				)
			},
		},
	},
	['fontSize', 'menuCollapsed', 'tabsMoreTips'],
)
