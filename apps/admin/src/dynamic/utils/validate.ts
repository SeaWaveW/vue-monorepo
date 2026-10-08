import type { ComponentItem, ComponentDataItem } from '#/dynamic'
import type Configure from '../configure/index.vue'

/**
 * 校验组件数据
 * @param components 组件列表
 * @param activeComponent 当前激活组件
 * @param componentIndex 当前激活组件索引
 * @param configureRef 配置区实例引用
 * @returns 校验方法
 */
export const useValidate = (
	components: Ref<ComponentItem[]>,
	activeComponent: Ref<ComponentItem | null>,
	componentIndex: Ref<number>,
	configureRef: Ref<InstanceType<typeof Configure> | null>,
) => {
	return () => {
		let errorIndex = -1
		const titleMaps = new Map<string, number>() // 标题重复映射

		comVal: for (
			let cIndex = 0;
			cIndex < components.value.length;
			cIndex++
		) {
			const cItem = components.value[cIndex]
			// 未存在主键或重复(标题)
			const realTitle = (cItem.title || '')?.toString().trim()
			if (!realTitle || titleMaps.has(realTitle)) {
				// 空标题 map 里还没有这把 key，get 是 undefined；重复才用第一次出现的下标
				errorIndex = titleMaps.get(realTitle) ?? cIndex
				break comVal
			}
			titleMaps.set(realTitle, cIndex)
			// 勾了限制字数但没填区间：FormItem 规则只在当前选中项上跑，这里要扫全表
			if (cItem.props.limitLength) {
				const range = cItem.props as {
					minlength?: number | null
					maxlength?: number | null
				}
				if (range.minlength == null || range.maxlength == null) {
					errorIndex = cIndex
					break comVal
				}
			}
			// 未存在模型绑定
			const modelKeys = Object.keys(cItem.modelBind || {})
			modelKeys.forEach((key) => {
				if (errorIndex === -1 && (!key || !cItem.modelBind?.[key])) {
					errorIndex = cIndex
				}
			})
			// 如果需要数据列表
			if ('data' in cItem.props) {
				dataVal: for (
					let dIndex = 0;
					dIndex < cItem.props.data.length;
					dIndex++
				) {
					const dItem = cItem.props.data[dIndex]
					if (!dItem.label || !dItem.value) {
						errorIndex = cIndex
						break dataVal
					}
					const isRepeat = cItem.props.data.some(
						(sItem: ComponentDataItem, sIndex: number) => {
							return (
								sIndex !== dIndex &&
								(sItem.label === dItem.label ||
									sItem.value === dItem.value)
							)
						},
					)
					if (isRepeat) {
						errorIndex = cIndex
						break dataVal
					}
				}
			}
		}

		// 如果存在不通过项
		if (errorIndex !== -1) {
			componentIndex.value = errorIndex
			activeComponent.value = components.value[errorIndex]
			nextTick(() => {
				configureRef.value?.validate?.()
			})
		}
		return errorIndex === -1
	}
}
