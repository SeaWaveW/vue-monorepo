/**
 * DynamicUploadImage 具名导出。单独文件：按需路径不经 components barrel。
 */
import Comp from './index.vue'

export const DynamicUploadImage = Comp
export default DynamicUploadImage
export type * from './types'
export { imageUploadProps, IMAGE_UPLOAD_ACCEPT } from './props'
export { imageUploadEmits } from './emits'
