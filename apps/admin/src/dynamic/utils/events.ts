import type { ComponentPublicInstance, ModelRef } from 'vue'
import type { ComponentName, ComponentItem } from '#/dynamic'
import type { UseDynamicPropsData } from './props'
import { useComponentMap } from './components'
interface CompontsInfo {
	/** 组件名称 */
	name: ComponentName
	/** 唯一标识 */
	uniqueId: ComponentItem['uniqueId']
}

/**
 * 拖拽组件
 * @param materialAreaRef 材料区组件实例
 * @param renderAreaRef 渲染区元素
 * @param propsModel 组件数据
 */
export const useComponentDrag = (
	materialAreaRef: Ref<ComponentPublicInstance | null>,
	renderAreaRef: Ref<ComponentPublicInstance | null>,
	propsModel: UseDynamicPropsData,
	proportion: ModelRef<TabPaneName>,
) => {
	const { t } = useI18n()
	const componentMap = useComponentMap()
	const compontsInfo = ref({} as CompontsInfo)
	// 起始区域
	const isMaterialStart = ref(false) // 材料区
	const isRenderStart = ref(false) // 渲染区
	// 渲染组件下标
	const renderStartIndex = ref(-1) // 起始下标
	const renderEnterIndex = ref(-1) // 进入下标
	const renderEnterSide = ref<'left' | 'right' | null>(null) // 进入侧

	// 是否在画布中
	const isInTheCanvas = ref(false)
	/** 重置区域信息 */
	const resetAreaState = () => {
		isMaterialStart.value = false
		isRenderStart.value = false
	}
	/** 重置进入下标 */
	const resetEnterIndex = () => {
		renderEnterIndex.value = -1
		renderEnterSide.value = null
	}
	/** 重置画布命中状态 */
	const resetCanvasState = () => {
		isInTheCanvas.value = false
		resetEnterIndex()
	}
	/** 重置全部拖拽状态 */
	const resetDragState = () => {
		resetCanvasState()
		resetAreaState()
	}
	/** 根据当前 canvas 更新命中区域 */
	const updateCanvasState = (canvasArea: HTMLDivElement) => {
		isInTheCanvas.value = canvasArea.classList.contains('canvas-area')
	}
	/** 获取真实下标 */
	const getTargetIndex = () => {
		return renderEnterSide.value === 'left'
			? renderEnterIndex.value
			: renderEnterIndex.value + 1
	}

	/** 判断是否在已经渲染的组件位置上 */
	const updateEnterIndex = (e: DragEvent) => {
		// 获取元素位置
		const element = document.elementFromPoint(
			e.clientX,
			e.clientY,
		) as HTMLElement | null
		// 是否为组件上
		const componentItem = element?.closest(
			'.component-item',
		) as HTMLDivElement | null
		// 获取组件下标
		const index = Number(componentItem?.dataset.index)
		// 是否为组件上且有下标
		if (!componentItem || Number.isNaN(index)) {
			resetEnterIndex()
			return
		}
		// 获取鼠标所处位置
		const rect = componentItem.getBoundingClientRect()
		// 是否为左侧
		const isLeft = e.clientX < rect.left + rect.width / 2
		// 更新信息
		renderEnterIndex.value = index
		renderEnterSide.value = isLeft ? 'left' : 'right'
	}

	// 材料区拖拽开始：记录组件信息，声明允许 copy
	const materialDragStart = (e: DragEvent) => {
		const target = (e.target as HTMLElement).closest(
			'[data-component-name]',
		) as HTMLDivElement | null
		if (!target || !e.dataTransfer) return
		// 设置起始信息
		isMaterialStart.value = true
		isRenderStart.value = false
		renderStartIndex.value = -1
		// 设置组件信息
		compontsInfo.value = {
			uniqueId: Math.round(Math.random() * 1000000),
			name: target.dataset.componentName as ComponentName,
		}
		// 设置鼠标信息
		e.dataTransfer.effectAllowed = 'copy'
		e.dataTransfer.setData('text/plain', '') // 兼容性写法
	}
	// 渲染区拖拽开始：记录组件信息，声明允许 move
	const renderDragStart = (e: DragEvent) => {
		const target = (e.target as HTMLElement).closest(
			'.component-item',
		) as HTMLDivElement | null
		if (!target || !e.dataTransfer) return
		// 设置起始信息
		isMaterialStart.value = false
		isRenderStart.value = true
		renderStartIndex.value = Number(target.dataset.index)
		// 设置鼠标信息
		e.dataTransfer.effectAllowed = 'move'
		e.dataTransfer.dropEffect = 'move'
	}

	/**
	 * 统一在 document.dragover 处理：
	 * - dropEffect 控制鼠标样式（必须在 dragover 且持续触发）
	 * - isHeader / isBody 跟随指针所在 canvas 实时更新
	 *
	 * 不需要 dragLeave：dragleave 的 relatedTarget 不可靠，
	 * 且只在边界触发一次，不适合做持续状态判断。
	 */
	const handleDragOver = (e: DragEvent) => {
		// 阻止默认行为
		e.preventDefault()
		if (!e.dataTransfer) return
		// 获取画布区域
		const canvasArea = (e.target as HTMLElement).closest(
			'.canvas-area',
		) as HTMLDivElement | null
		// 不在画布区域
		if (!canvasArea) {
			e.dataTransfer.dropEffect = 'none'
			resetCanvasState()
			return
		}
		// 设置鼠标信息
		e.dataTransfer.dropEffect = isRenderStart.value ? 'move' : 'copy'
		updateCanvasState(canvasArea)
		updateEnterIndex(e)
	}

	// 材料区拖拽结束：兜底重置状态
	const materialDragEnd = () => {
		if (isInTheCanvas.value) {
			const defaults = componentMap.value[compontsInfo.value.name]
			if (defaults) {
				// 生成组件
				const component: ComponentItem = {
					uniqueId: Math.round(Math.random() * 1000000),
					name: compontsInfo.value.name,
					...defaults,
				}
				// 若为-1, 则直接往最后添加. 否则根据进入侧添加
				if (renderEnterIndex.value === -1) {
					propsModel.addComponent(
						propsModel.componentsCount.value,
						component,
					)
				} else {
					propsModel.addComponent(getTargetIndex(), component)
				}
			}
		}
		resetDragState()
	}
	// 渲染区拖拽结束
	const renderDragEnd = () => {
		if (!proportion.value) {
			SacoMessageBox({
				title: t('message'),
				message: t('validate_please_select', [t('panel_width')]),
			})
			return
		}
		if (isInTheCanvas.value) {
			// 若存在进入侧, 则替换组件。   否则放到最后
			if (renderEnterSide.value) {
				propsModel.replaceComponent(
					renderStartIndex.value,
					getTargetIndex(),
				)
			} else {
				propsModel.replaceComponent(
					renderStartIndex.value,
					propsModel.componentsCount.value,
				)
			}
		}
		resetDragState()
	}

	// 缓存 DOM，避免卸载时 $el 已空导致无法移除监听
	let materialEl: HTMLElement | null = null
	let renderEl: HTMLElement | null = null

	onMounted(() => {
		materialEl = materialAreaRef.value?.$el
		renderEl = renderAreaRef.value?.$el
		materialEl?.addEventListener('dragstart', materialDragStart)
		materialEl?.addEventListener('dragend', materialDragEnd)
		renderEl?.addEventListener('dragstart', renderDragStart)
		renderEl?.addEventListener('dragend', renderDragEnd)
		document.addEventListener('dragover', handleDragOver)
	})

	onUnmounted(() => {
		materialEl?.removeEventListener('dragstart', materialDragStart)
		materialEl?.removeEventListener('dragend', materialDragEnd)
		renderEl?.removeEventListener('dragstart', renderDragStart)
		renderEl?.removeEventListener('dragend', renderDragEnd)
		document.removeEventListener('dragover', handleDragOver)
		materialEl = null
		renderEl = null
	})

	return {
		renderEnterIndex,
		renderEnterSide,
	}
}

/**
 * 渲染点击组件
 * @param renderingAreaRef 渲染区元素
 * @param propsModel 组件数据
 */
export const useRenderingComponentClick = (
	renderingAreaRef: Ref<ComponentPublicInstance | null>,
	propsModel: UseDynamicPropsData,
) => {
	// 点击事件
	const handleClick = (e: MouseEvent) => {
		const dom = e.target as HTMLElement
		const componentItem = dom.closest(
			'.component-item',
		) as HTMLElement | null
		if (componentItem) {
			const index = Number(componentItem.dataset.index)
			// 获取操作
			const toolItem = dom.closest('.tool-item') as HTMLElement | null
			// 处理操作
			if (toolItem) {
				const type = toolItem.dataset.action
				if (type === 'delete') {
					propsModel.removeComponent(index)
				}
				return
			}
			propsModel.selectComponent(index)
		}
	}
	// 缓存 DOM，避免卸载时 $el 已空导致无法移除监听（和拖拽同一套）
	let renderEl: HTMLElement | null = null
	onMounted(() => {
		renderEl = renderingAreaRef.value?.$el
		renderEl?.addEventListener('click', handleClick)
	})
	onUnmounted(() => {
		renderEl?.removeEventListener('click', handleClick)
		renderEl = null
	})
}
