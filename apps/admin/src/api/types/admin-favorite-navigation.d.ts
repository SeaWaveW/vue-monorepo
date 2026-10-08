/** 收藏导航（参数） */
export interface AdminFavoriteNavigationCreateData {
	/** 待收藏的导航 ID，必须为配置了页面路径的有效导航 */
	navigationId: number
}

/** 查询本人收藏导航（行） */
export interface AdminFavoriteNavigationListRecord {
	/** 导航 ID */
	id: number

	/** 导航中文名称 */
	chineseName: string

	/** 导航英文名称 */
	englishName: string

	/** 父导航 ID；顶级导航为 0 */
	parentId: number

	/** 收藏展示序号，升序排列 */
	serial: number

	/** 跳转页面路径 */
	pagePath?: string
}

/** 查询本人收藏导航（响应） */
export type AdminFavoriteNavigationListResponse =
	AdminFavoriteNavigationListRecord[]

/** 收藏导航排序（参数） */
export interface AdminFavoriteNavigationSortData {
	/** 当前用户全部有效收藏的导航 ID，按拖动后的展示顺序提交，不可重复或遗漏；按集合顺序从 1 开始保存展示序号，仅无收藏时可传空集合 */
	navigationIds: number[]
}
