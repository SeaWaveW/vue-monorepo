import type { SetupContext } from 'vue'
import type { ComponentItem } from '#/dynamic'

/** 基础配置（配置区编辑的字段） */
export type ComponentBaseConfig = Pick<
	ComponentItem,
	'label' | 'proportion' | 'id'
>

/** porps: json数据 */
export interface DynamicProps {
	components: ComponentItem[]
}
/** emits: 更新数据 */
export interface DynamicEmits {
	'update:components': [data: DynamicProps['components']]
}

/** expose: 导出方法 */
export interface DynamicExpose {
	validateComponents: () => boolean
}

/** ctx: 上下文 */
export type DynamicCtx = SetupContext<DynamicEmits, DynamicExpose>

/** 组件暴露 */
export type WithComponentExpose<
	C extends abstract new (...args: any) => any,
	E,
> = C & {
	new (...args: any[]): InstanceType<C> & E
	__type: { expose: E }
}
