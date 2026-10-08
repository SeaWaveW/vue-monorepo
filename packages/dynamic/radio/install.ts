/**
 * DynamicRadio 具名导出。单独文件：按需 `@saco/common/dynamic/radio` 只拉壳，不经 barrel。
 */
import Comp from './index.vue'

export const DynamicRadio = Comp
export default DynamicRadio
export type * from './types'
export { radioProps } from './props'
export { radioEmits } from './emits'
