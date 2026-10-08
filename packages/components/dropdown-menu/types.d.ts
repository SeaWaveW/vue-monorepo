import type { DropdownProps } from '@saco/ui'

/**
 * 下拉选项列表；K 为选中值字段，默认 value。
 * 给消费方和 install 再导出。SFC 里必须再写一份内联 `defineProps`，
 * 不能 `defineProps<DropdownMenuProps>()`：setup-extend 编译不带 fs。
 */
export interface DropdownMenuProps<
	D extends AnyObj = AnyObj,
	K extends keyof D = 'value',
> {
	data: D[]
	/** 选中值对应的字段名，须是 D 的 key */
	fieldValue?: K
	/** 展示文案字段名 */
	fieldLabel?: keyof D & string
	filterable?: boolean
	placement?: DropdownProps['placement']
	/** 禁用后不打开菜单、不抛 command */
	disabled?: boolean
	/**
	 * 当前选中值（对应 fieldValue 字段）。
	 * 不用 defineModel：其对 T|undefined 会剥掉 undefined，Partial 详情绑不上。
	 */
	modelValue?: D[K]
}

export interface DropdownMenuEmits<
	D extends AnyObj = AnyObj,
	K extends keyof D = 'value',
> {
	'update:modelValue': [value: D[K]]
	command: [item: D]
}
