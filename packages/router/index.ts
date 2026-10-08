/**
 * 子路径 `@saco/common/router`。内部用 `src/i18n` / `src/pinia` 同一份单例做守卫。
 * 业务 `app.use(i18n)` / `app.use(pinia)` 必须是 `@saco/common/i18n`、`@saco/common/pinia`。
 * 主包不再再导出；页签 store 走 `/store`，不要从这里混掏。
 */
export { createAppRouter, generateRouter } from './create'
export type * from './create'
export type { AppRouteMeta, AppRouteRecordRaw } from './types'
