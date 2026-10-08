/**
 * DynamicInput 具名导出。单独文件：按需 `@saco/common/dynamic/input` 只拉壳，不经 barrel。
 */
import Comp from './index.vue'

export const DynamicInput = Comp
export default DynamicInput
export type * from './types'
export { inputProps } from './props'
export { inputEmits } from './emits'
