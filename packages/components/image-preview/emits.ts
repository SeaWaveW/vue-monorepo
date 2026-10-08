import type { ImagePreviewEmits } from './types'

/** 无自有事件；click 等走原生 img 的 fallthrough */
export const imagePreviewEmits: Array<keyof ImagePreviewEmits> = []
