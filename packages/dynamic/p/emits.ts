import type { PEmits } from './types'

/** 无自有事件；click 等走原生 p 的 fallthrough */
export const pEmits: Array<keyof PEmits> = []
