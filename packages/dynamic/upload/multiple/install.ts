/**
 * DynamicUploadMultiple 具名导出。单独文件：按需路径不经 components barrel。
 */
import Comp from './index.vue'

export const DynamicUploadMultiple = Comp
export default DynamicUploadMultiple
export type * from './types'
export { multipleUploadProps } from './props'
export { multipleUploadEmits } from './emits'
