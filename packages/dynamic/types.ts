import type { ComponentName } from './index'

/**
 * 动态表单模型绑定。
 * key 是包装组件的 prop 名（如 `modelValue` / `fileUrl`），
 * value 是写入 `defaultModel` / 提交 data 的字段名。
 * 漏了画布改值不会回写到物料项。
 */
export type ComponentModelBind = Record<string, string>

/** `modelBind` 的 prop 名；配置区选中绑定字段时用 */
export type ComponentModelKey = keyof ComponentModelBind

/**
 * 与 `modelBind` 同形的默认模型。
 * 每个 bind 的 value 对应 `defaultModel` 里一项，预览 / 渲染都从这里取初值。
 */
export type ComponentDefaultModel = {
	[K in keyof ComponentModelBind]: ComponentModelBind[K]
}

/**
 * 动态表单一份提交数据。
 * 运行时按组件 `id`（或 uniqueId）当 key，值形状跟该项 `defaultModel` 走。
 */
export type ComponentDataItem = Record<string, any>

/**
 * 画布上的一项物料。
 * 存在 `schemaJson.components` 里；`name` 必须是 `ComponentMap` 的 key，
 * `SacoRender` 靠它找到已注册的 Dynamic* 组件。
 */
export interface ComponentItem<T = Record<string, any>> {
	/** 画布内唯一；拖入时生成，列表 v-for 的 key，找不到就退回下标 */
	uniqueId?: number
	/** 包装组件名，必须是 `ComponentMap` 的 key（如 `DynamicInput`） */
	name?: ComponentName
	/** 组件类型标注（input / select / upload），校验文案、预览只读靠它分流 */
	type?: string
	/** 占栅格列数，对应 `--proportion-span`；不传则跟表单总列数走 */
	proportion: number
	/** 提交数据键；有 title 时由 title 映射，空则当自定义功能 */
	id?: string
	/** 表单项标题，也用来生成 id；空标题的上传不画 label */
	title?: string
	/** 配置区「组件描述」，写入 schemaJson，跟 title 一起存 */
	description?: string
	/** 是否必填；校验和 FormItem 红星都看这个 */
	required?: boolean
	/** 传给包装组件的 props（不含 v-model 本体，模型走 `modelBind`） */
	props: Omit<T, 'modelValue'> & {
		/** 输入类是否参与字数限制；配置区 lengthBindList 才写 */
		limitLength?: boolean
	}
	/** prop 名 → data 字段；预览 / 渲染按这个从 defaultModel 取 v-model */
	modelBind?: ComponentModelBind
	/** 当前选中的 bind 键；props.data 变了要回写 modelBind 时用 */
	modelKey?: ComponentModelKey
	/** 该项默认值，key 跟 modelBind 的 value 对齐 */
	defaultModel?: Record<string, any>
}
