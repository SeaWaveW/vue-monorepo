import { computed } from 'vue'
import { LEACH_VALUE, createFormatter } from './formatter'

/** 按字段值反查整项 */
type MapItem<V extends PropertyKey, T> = Record<V, T>

/**
 * 选项列表 + 字段值到整项的映射 + 按值取 `label` 的 formatter。
 * `options` 是 computed，须在 setup 调。查不到 / 空 label 显示 `LEACH_VALUE`。
 */
export const useOptionMap = <
	T extends Record<P, PropertyKey> & { label: string },
	P extends keyof T,
>(
	list: T[],
	key: P,
) => {
	const options = computed<T[]>(() => list)
	const maps = list.reduce(
		(acc, item) => {
			acc[item[key]] = item
			return acc
		},
		{} as MapItem<T[P], T>,
	)
	const formatter = createFormatter((value) => {
		const item = maps[value as T[P]]
		return item?.label || LEACH_VALUE
	})
	return {
		options,
		maps,
		formatter,
	}
}
