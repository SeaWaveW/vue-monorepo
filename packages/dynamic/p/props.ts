import type { ComponentObjectPropsOptions } from 'vue'
import type { PProps } from './types'

/** 故意空：声明了 HTML 属性当 props 会拦住 fallthrough */
export const pProps = {} satisfies ComponentObjectPropsOptions<PProps>
