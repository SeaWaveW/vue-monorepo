/** CommonLayout / aside 菜单跳转 */
export type OpenTab = (path: string) => void

/** 侧栏菜单节点 / 收藏行（两端导航树同形） */
export interface LayoutMenuRecord {
	id: number
	chineseName: string
	englishName: string
	parentId: number
	serial: number
	pagePath?: string
	children?: LayoutMenuRecord[]
}

/** 收藏增删排序；两端 URL 不同，由业务传入 */
export interface LayoutFavoriteApi {
	create: (data: { navigationId: number }) => Promise<unknown>
	delete: (navigationId: number) => Promise<unknown>
	sort: (data: { navigationIds: number[] }) => Promise<unknown>
	/** 查询本人收藏。排序后要重拉；PC / tablet 会话不会互踢，对面可能刚改过顺序或集合 */
	list: () => Promise<{ data?: LayoutMenuRecord[] }>
}

/** CommonLayout 提供给侧栏菜单。logo 由布局自己引公共图 */
export interface LayoutMenuProvide {
	logo: string
	favorite: LayoutFavoriteApi
}

export interface LayoutProps {
	favorite: LayoutFavoriteApi
}

export interface AsideProps {
	modelValue?: boolean
}
