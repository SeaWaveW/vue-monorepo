import { createStore } from '../pinia'

/** 登录 / 刷新令牌里落进用户 store 的字段（TokenVO 用户侧，不含 token） */
export interface UserInfo {
	/** 当前用户 ID */
	userId: number
	/** 当前用户名称 */
	userName: string
	/** 当前用户邮箱 */
	email?: string
	/** 当前用户手机号 */
	phone?: string
	/** 当前用户头像图片链接 */
	avatarUrl?: string
}

export const useUserStore = createStore(
	'user',
	{
		state: () => {
			return {
				/** 当前用户 ID*/
				userId: 0 as number,
				/** 当前用户名称*/
				userName: '' as string,
				/** 当前用户邮箱 */
				email: '' as string,
				/** 当前用户手机号 */
				phone: '' as string,
				/** 当前用户头像图片链接 */
				avatarUrl: '' as string,
				/** 拥有的菜单列表(路由) */
				routerPaths: [] as string[],
				/** 权限列表 */
				apiPaths: [] as string[],
				/** 收藏的菜单 */
				collectMenu: [] as AnyObj[],
				/** 可访问的菜单 */
				accessibleMenu: [] as AnyObj[],
			}
		},
		actions: {
			/** 写入当前用户；登录 / 刷新直接传 TokenVO，只取用户侧字段 */
			setUserInfo(data: UserInfo) {
				this.$patch({
					userId: data.userId,
					userName: data.userName,
					email: data.email ?? '',
					phone: data.phone ?? '',
					avatarUrl: data.avatarUrl ?? '',
				})
			},
			/** 设置当前拥有的菜单列表(路由) */
			setRouterPaths(paths: string[]) {
				this.routerPaths = paths
			},
			/** 设置当前拥有的权限列表 */
			setApiPaths(paths: string[]) {
				this.apiPaths = paths
			},
			/** 保存收藏的菜单 */
			setCollectMenu(menu: any[]) {
				this.collectMenu = menu
			},
			/** 保存可访问的菜单 */
			setAccessibleMenu(menu: any[]) {
				this.accessibleMenu = menu
			},
			/** 清空用户信息缓存 */
			clearUserInfo() {
				this.setRouterPaths([])
				this.setApiPaths([])
				this.setCollectMenu([])
				this.setAccessibleMenu([])
				this.setUserInfo({ userId: 0, userName: '' })
			},
		},
	},
	[
		'userId',
		'userName',
		'email',
		'phone',
		'avatarUrl',
		'routerPaths',
		'apiPaths',
		'collectMenu',
		'accessibleMenu',
	],
	true,
)
