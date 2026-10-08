import { useOptionMap } from '#/utils/data'
/** 动态表单草稿状态枚举 */
export enum DynamicFormIsDraft {
	/** 草稿 */
	Draft = 1,
	/** 正式 */
	Formal = 2,
}

/** 动态表单草稿状态颜色类型映射 */
export const dynamicFormIsDraftType: Partial<
	Record<DynamicFormIsDraft, TextType>
> = {
	[DynamicFormIsDraft.Draft]: 'warning',
}

/** 动态表单草稿状态：选项列表 + 按值取文案的 formatter */
export const useDynamicFormIsDraft = () => {
	const { t } = useI18n()
	const {
		options: dynamicFormIsDraftList,
		formatter: dynamicFormIsDraftFormatter,
	} = useOptionMap(
		[
			{
				label: t('draft'),
				value: DynamicFormIsDraft.Draft,
			},
			{
				label: t('formal'),
				value: DynamicFormIsDraft.Formal,
			},
		],
		'value',
	)
	return { dynamicFormIsDraftList, dynamicFormIsDraftFormatter }
}
