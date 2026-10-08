import type { ClientNavigationDeleteStatus } from '@/enum/client-navigation/delete-status'

/** 查询客户端导航树（节点） */
export interface ClientNavigationTreeRecord {
	/** 客户端导航 ID */
	id: number

	/** 导航中文名称 */
	chineseName: string

	/** 导航英文名称 */
	englishName: string

	/** 父导航 ID；顶级导航为 0 */
	parentId: number

	/** 展示序号，升序排列；相同序号按 ID 升序排列 */
	serial: number

	/** 跳转页面路径 */
	pagePath?: string

	/** 子导航集合，叶子节点返回空集合 */
	children: ClientNavigationTreeRecord[]
}

/** 查询客户端导航树（响应） */
export type ClientNavigationTreeResponse = ClientNavigationTreeRecord[]

/** 新增客户端导航（参数） */
export interface ClientNavigationCreateData {
	/** 父导航 ID；顶级导航为 0 */
	parentId: number

	/** 导航中文名称 */
	chineseName: string

	/** 导航英文名称 */
	englishName: string

	/** 展示序号，同级导航按此值升序排列 */
	serial: number

	/** 页面路径，可为空；未传或空白时保存为空字符串 */
	pagePath?: string

	/** 导航备注，未传或空白时清空 */
	remark?: string
}

/** 修改客户端导航（参数） */
export interface ClientNavigationUpdateData {
	/** 客户端导航 ID */
	id: number

	/** 导航中文名称 */
	chineseName: string

	/** 导航英文名称 */
	englishName: string

	/** 展示序号，同级导航按此值升序排列 */
	serial: number

	/** 页面路径，可为空；未传或空白时保存为空字符串 */
	pagePath?: string

	/** 导航备注，未传或空白时清空 */
	remark?: string
}

/** 查询客户端导航详情（响应） */
export interface ClientNavigationDetailResponse {
	/** 客户端导航 ID */
	id: number

	/** 导航中文名称 */
	chineseName: string

	/** 导航英文名称 */
	englishName: string

	/** 展示序号 */
	serial: number

	/** 跳转页面路径 */
	pagePath?: string

	/** 导航备注 */
	remark?: string

	/** 父导航 ID；顶级导航为 0 */
	parentId: number

	/** 父导航中文名称；顶级导航返回空字符串 */
	parentChineseName?: string

	/** 父导航英文名称；顶级导航返回空字符串 */
	parentEnglishName?: string

	/** 创建人 ID */
	createUserId?: number

	/** 创建人姓名 */
	createUserName?: string

	/** 创建时间戳，单位：毫秒 */
	createTime?: number

	/** 最后编辑人 ID */
	editUserId?: number

	/** 最后编辑人姓名 */
	editUserName?: string

	/** 最后编辑时间戳，单位：毫秒 */
	editTime?: number

	/** 删除状态：1-未删除，2-已删除 */
	deleteStatus?: ClientNavigationDeleteStatus

	/** 删除人 ID */
	deleteUserId?: number

	/** 删除人姓名 */
	deleteUserName?: string

	/** 删除时间戳，单位：毫秒 */
	deleteTime?: number
}
