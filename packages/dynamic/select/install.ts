/**
 * DynamicSelect 具名导出。单独文件：按需 `@saco/common/dynamic/select` 只拉壳，不经 barrel。
 */
import Comp from './index.vue'

export const DynamicSelect = Comp
export default DynamicSelect
export type * from './types'
export { selectProps } from './props'
export { selectEmits } from './emits'
