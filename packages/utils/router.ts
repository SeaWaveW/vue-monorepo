import { useRoute } from 'vue-router'

type ParamValue = string | number | string[]
type RouterParams<T extends ParamValue[]> = Record<string, T[number]>

/**
 * 按 key 列表读当前路由 params，返回同名对象。
 * T 与 keys 下标对齐。params 用 vue-router 原值（同名多个是 string[]，由 T 声明）。
 * 内部用了 useRoute，须在 setup 里调；一次性取值，不要叫 use。
 *
 * @example
 * ```ts
 * const { id } = getRouterParams<[number]>(['id'])
 * const { id, tab } = getRouterParams<[number, string]>(['id', 'tab'])
 * const { id } = getRouterParams<[string[]]>(['id'])
 * ```
 */
export const getRouterParams = <T extends ParamValue[]>(
	keys: string[],
): RouterParams<T> => {
	const route = useRoute()
	const params: RouterParams<T> = {}
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i]
		// 原样用 vue-router 的 params，不做 Number / 空值守卫
		params[key] = route.params[key] as T[number]
	}
	return params
}
