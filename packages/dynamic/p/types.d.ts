/** 无自有 props；class / id / title / 点击等走 fallthrough 到原生 p */
export type PProps = Record<string, never>

/** 无自有 emit；原生事件同样 fallthrough */
export type PEmits = Record<string, never>
