import { computed, watch, type ModelRef } from 'vue'
import type { TabPaneName } from '@saco/ui'
import type { ComponentItem } from '../dynamic/types'

/** 配置区占比选项：label 给人看，value 是格子数 */
export interface ProportionItem {
	label: string
	value: TabPaneName
}

/** 一行最多等分数 */
export const PROPORTION_MAX_SIZE: TabPaneName = 5
/** 表单默认等分数 */
export const PROPORTION_DEFAULT_SIZE: TabPaneName = 3

/**
 * 表单等分数与组件格子数绑定。须在 setup 调一次。
 * 分母变小时只把超出的组件收成满行。
 */
export const useProportion = (
	proportion: ModelRef<TabPaneName>,
	components: ModelRef<ComponentItem[]>,
) => {
	// 子项面板占比
	const proportionList = computed(() => {
		return Array.from(
			{ length: proportion.value as number },
			(_, index) => {
				const value = index + 1
				return {
					label: `${index + 1}/${proportion.value}`,
					value,
				}
			},
		)
	})

	watch(
		() => proportion.value,
		(to, from) => {
			if (!from || from === to) return
			const toNumber = Number(to)
			components.value = components.value.map<ComponentItem>((item) => ({
				...item,
				proportion:
					item.proportion > toNumber ? toNumber : item.proportion,
			}))
		},
		{ immediate: true },
	)

	return {
		proportionList,
	}
}
