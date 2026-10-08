import { defineAsyncComponent, type App, type Component } from 'vue'
import type { ComponentItem } from './types'
import type { InputProps } from './input/types'
import type { SelectProps } from './select/types'
import type { RadioProps } from './radio/types'
import type { UploadSingleProps } from './upload/single/types'
import type { UploadMultipleProps } from './upload/multiple/types'
import type { UploadImageProps } from './upload/image/types'
import type { PProps } from './p/types'

/**
 * 子路径 `@saco/common/dynamic` 公开出口。
 * 只给动态表单：`ComponentMap` / `projectComponents` / `asyncRegister`。
 * 跨页共用组件从 `@saco/common/components` 取，不要再塞进这张物料表。
 */
export { DynamicInput } from './input/install'
export { DynamicSelect } from './select/install'
export { DynamicRadio } from './radio/install'
export { DynamicUploadSingle } from './upload/single/install'
export { DynamicUploadMultiple } from './upload/multiple/install'
export { DynamicUploadImage } from './upload/image/install'
export { DynamicP } from './p/install'
export {
	detectDynamicUploadFile,
	readDynamicUploadAccept,
	readDynamicUploadSizeBytes,
} from './upload/detect'

export type AsyncComponentLoader = () => Promise<{ default: Component }>
/** 动态表单物料 props 映射（只含可拖入画布的包装组件；Layout 壳从 `@saco/common/layout` 取） */
export interface ComponentMap {
	DynamicInput: ComponentItem<InputProps>
	DynamicSelect: ComponentItem<SelectProps>
	DynamicRadio: ComponentItem<RadioProps>
	DynamicUploadSingle: ComponentItem<UploadSingleProps>
	DynamicUploadMultiple: ComponentItem<UploadMultipleProps>
	DynamicUploadImage: ComponentItem<UploadImageProps>
	DynamicP: ComponentItem<PProps>
}

export type ComponentName = keyof ComponentMap
export type ProjectComponents = Record<ComponentName, AsyncComponentLoader>
export type ComponentMaps = {
	[K in ComponentName]: ComponentMap[K]
}

/** 动态表单支持的组件列表（全量注册走异步，后期加物料只改这里） */
export const projectComponents: ProjectComponents = {
	DynamicInput: () => import('./input/index.vue'),
	DynamicSelect: () => import('./select/index.vue'),
	DynamicRadio: () => import('./radio/index.vue'),
	DynamicUploadSingle: () => import('./upload/single/index.vue'),
	DynamicUploadMultiple: () => import('./upload/multiple/index.vue'),
	DynamicUploadImage: () => import('./upload/image/index.vue'),
	DynamicP: () => import('./p/index.vue'),
}

/**
 * 全局注册动态表单组件（异步）。
 * 函数本身可当 Vue 插件：`app.use(asyncRegister)`，不要再包一层 default。
 */
export const asyncRegister = (app: App) => {
	Object.entries(projectComponents).forEach(([name, loader]) => {
		app.component(name, defineAsyncComponent(loader))
	})
}

export type * from './types'
export type * from './input/types'
export type * from './select/types'
export type * from './radio/types'
export type * from './upload/single/types'
export type * from './upload/multiple/types'
export type * from './upload/image/types'
export type * from './p/types'
