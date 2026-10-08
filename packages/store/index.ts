/**
 * 子路径 `@saco/common/store` 公开出口。
 * `createStore` 从 `src/pinia` 取，与 `createAppRouter` 同一 pinia 单例。
 * `useComponentStore` 是动态表单物料清单，不持久化。
 * `useSettingStore` 记下偏好字号；html 根字号由 `@saco/rem-plugin` 按视口注入。
 * 主包不再再导出；业务从这里具名取，不要从 `@saco/common` 或 `/router` 混掏。
 */
export {
	useRouterStore,
	mutateRoute,
	resolveCacheTitle,
	setDocumentTitle,
} from './router'
export type * from './router'
export { useComponentStore } from './component'
export type * from './component'
export { useUserStore } from './user'
export type * from './user'
export { useSettingStore } from './setting'
export type * from './setting'
