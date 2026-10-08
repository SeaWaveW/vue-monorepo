/**
 * DynamicUploadSingle 具名导出。单独文件：按需路径不经 components barrel。
 */
import Comp from './index.vue'

export const DynamicUploadSingle = Comp
export default DynamicUploadSingle
export type * from './types'
export { singleUploadProps } from './props'
export { singleUploadEmits } from './emits'
