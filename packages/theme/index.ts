/**
 * 子路径 `@saco/common/theme`。带主题样式副作用。
 * 业务 `themePlugin` / `useTheme` 从这里取，主包不再再导出。
 */
export { themeColors } from './setup'
export { themePlugin, useTheme } from './instance'
export type * from './types'
export type * from './module/types'
