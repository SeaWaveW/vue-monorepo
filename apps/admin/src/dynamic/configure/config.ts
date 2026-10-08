import type { Ref, ModelRef } from 'vue'
import {
	AsyncComponentLoader,
	type ComponentItem,
	type ComponentName,
} from '#/dynamic'

/** 个性化配置面板（按业务组件名懒加载） */
export const configureComponents: Partial<
	Record<ComponentName, AsyncComponentLoader>
> = {
	DynamicSelect: () => import('./component/select.vue'),
	DynamicUploadSingle: () => import('./component/upload.vue'),
	DynamicUploadMultiple: () => import('./component/upload.vue'),
	DynamicUploadImage: () => import('./component/upload.vue'),
}

/** 不参与动态模型绑定的组件列表 */
export const notModelBindList: ComponentItem['name'][] = []

/** 个性化配置：按 modelBind 读写 defaultModel */
export const usePropsDefaultBind = (
	component: Ref<ComponentItem | null | undefined>,
) => {
	// 模型绑定
	const defaulBind = computed(() => {
		const { modelBind = {}, defaultModel = {} } = component.value || {}
		return Object.keys(modelBind).reduce(
			(binds, key) => {
				// bind 的 key 为键，bind 的 value 为 defaultModel 对应字段
				binds[key] = defaultModel[modelBind[key]]
				return binds
			},
			{} as Record<string, unknown>,
		)
	})
	// 模型事件绑定（同 tick 双发时合并进 defaultModel，避免后一次盖掉前一次）
	const defaultOn = computed(() => {
		const modelBind = component.value?.modelBind || {}
		return Object.keys(modelBind).reduce(
			(ons, key) => {
				const fieldKey = modelBind[key]
				if (!fieldKey) return ons
				ons[`update:${key}`] = (value: unknown) => {
					const current = component.value
					if (!current) return
					current.defaultModel = {
						...current.defaultModel,
						[fieldKey]: value,
					}
					component.value = {
						...current,
						defaultModel: { ...current.defaultModel },
					}
				}
				return ons
			},
			{} as Record<string, (value: unknown) => void>,
		)
	})

	return {
		defaulBind,
		defaultOn,
	}
}

/** 顶层字段可空：未选中组件时 get 为 undefined */
type OuterModel = {
	[K in keyof ComponentItem]: ComponentItem[K] | undefined
}

/**
 * 选中项顶层字段的双向绑定。模板写 `outerModel.proportion` 即可。
 * 赋值时整份替换，父级才能收到 `update:component`。
 */
export const useOuterModel = <T extends ComponentItem | null | undefined>(
	component: ModelRef<T>,
) => {
	return new Proxy({} as OuterModel, {
		get(_target, key) {
			if (typeof key !== 'string' || !component.value) return undefined
			return component.value[key as keyof ComponentItem]
		},
		set(_target, key, value) {
			if (typeof key !== 'string' || !component.value) return true
			component.value = {
				...component.value,
				[key]: value,
			} as T
			return true
		},
	})
}

/** props 字段可空：未选中或没有该 key 时 get 为 undefined */
type PropsModel = {
	[K in keyof ComponentItem['props']]: ComponentItem['props'][K] | undefined
}

/**
 * 选中项 `props` 的双向绑定。模板写 `propsModel.minlength` 即可。
 * 赋值时整份替换 component，并摊开原 props，父级才能收到 `update:component`。
 */
export const usePropsModel = <T extends ComponentItem | null | undefined>(
	component: ModelRef<T>,
) => {
	return new Proxy({} as PropsModel, {
		get(_target, key) {
			if (typeof key !== 'string' || !component.value) return undefined
			return component.value.props?.[key]
		},
		set(_target, key, value) {
			if (typeof key !== 'string' || !component.value) return true
			component.value = {
				...component.value,
				props: {
					...component.value.props,
					[key]: value,
				},
			} as T
			return true
		},
	})
}

/** 参与数据列表绑定的组件列表 */
export const dataListBindList: ComponentItem['name'][] = [
	'DynamicSelect',
	'DynamicRadio',
]

/** 参与长度限制的组件列表 */
export const lengthBindList: ComponentItem['name'][] = ['DynamicInput']

/** 参与提示词绑定的组件列表 */
export const placeholderBindList: ComponentItem['name'][] = ['DynamicInput']
