import type { ComponentObjectPropsOptions, PropType, Ref } from 'vue'
import type { ComponentItem } from '#/dynamic'
import type { DynamicProps } from './types'

export const dynamicProps = {
	components: {
		type: Array as PropType<DynamicProps['components']>,
		default: () => [],
	},
} satisfies ComponentObjectPropsOptions<DynamicProps>

export const useDynamicPropsData = (components: Ref<ComponentItem[]>) => {
	// 组件数量
	const componentsCount = computed(() => components.value.length)
	// 选中的组件位置
	const componentIndex = ref<number>(-1)
	// 选中的组件
	const activeComponent = ref<ComponentItem | null>(null)
	/** 选中画布中的组件（同步 index，配置区更新依赖它） */
	const selectComponent = (index: number) => {
		const component = components.value[index]
		if (!component) {
			activeComponent.value = null
			componentIndex.value = -1
			return
		}
		activeComponent.value = component
		componentIndex.value = index
	}
	/** 添加组件(仅材料区可用) */
	const addComponent = (index: number, component: ComponentItem) => {
		// 获取原位置组件
		const oldComponent = components.value[index]
		if (oldComponent) {
			components.value.splice(index, 0, component)
		} else {
			components.value[index] = component
		}
		components.value = [...components.value]
		selectComponent(index)
	}
	/** 删除组件 */
	const removeComponent = (index: number) => {
		components.value.splice(index, 1)
		components.value = [...components.value]
		activeComponent.value = null
		componentIndex.value = -1
	}
	/** 替换组件位置(仅渲染区拖拽可用) */
	const replaceComponent = (fromIndex: number, toIndex: number) => {
		// 落在自身左右相邻位置时不移动
		if (fromIndex === toIndex || fromIndex + 1 === toIndex) return
		// 拷贝一份
		const list = [...components.value]
		// 删除原来位置
		const [item] = list.splice(fromIndex, 1)
		// 更新插入下标
		const insertIndex = fromIndex < toIndex ? toIndex - 1 : toIndex
		// 插入到目标位置
		list.splice(insertIndex, 0, item)
		components.value = list
		// 设置选中
		selectComponent(insertIndex)
	}
	/** 更新单个组件 */
	const updateComponent = (index: number, component: ComponentItem) => {
		components.value[index] = component
		components.value = [...components.value]
	}
	return {
		components,
		componentsCount,
		activeComponent,
		componentIndex,
		selectComponent,
		addComponent,
		removeComponent,
		replaceComponent,
		updateComponent,
	}
}

export type UseDynamicPropsData = ReturnType<typeof useDynamicPropsData>
