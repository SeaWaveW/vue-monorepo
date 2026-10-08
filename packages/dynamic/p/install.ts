/**
 * DynamicP 具名导出。单独文件：按需 `@saco/common/dynamic/p` 只拉壳，不经 barrel。
 */
import Comp from './index.vue'

export const DynamicP = Comp
export default DynamicP
export type * from './types'
export { pProps } from './props'
export { pEmits } from './emits'
