import { useOptionMap } from '#/utils/data'
/** 动态表单面板宽等级枚举 */
export enum DynamicFormWidthLevel {
	/** 宽等级 1 */
	Level1 = 1,
	/** 宽等级 2 */
	Level2 = 2,
	/** 宽等级 3 */
	Level3 = 3,
	/** 宽等级 4 */
	Level4 = 4,
	/** 宽等级 5 */
	Level5 = 5,
}

/** 动态表单面板宽等级颜色类型映射 */
export const dynamicFormWidthLevelType: Record<
	DynamicFormWidthLevel,
	TextType
> = {
	[DynamicFormWidthLevel.Level1]: 'info',
	[DynamicFormWidthLevel.Level2]: 'info',
	[DynamicFormWidthLevel.Level3]: 'primary',
	[DynamicFormWidthLevel.Level4]: 'warning',
	[DynamicFormWidthLevel.Level5]: 'warning',
}

/** 动态表单面板宽等级：选项列表 + 按值取文案的 formatter */
export const useDynamicFormWidthLevel = () => {
	const { t } = useI18n()
	const {
		options: dynamicFormWidthLevelList,
		formatter: dynamicFormWidthLevelFormatter,
	} = useOptionMap(
		[
			{
				label: t('width_level_1'),
				value: DynamicFormWidthLevel.Level1,
			},
			{
				label: t('width_level_2'),
				value: DynamicFormWidthLevel.Level2,
			},
			{
				label: t('width_level_3'),
				value: DynamicFormWidthLevel.Level3,
			},
			{
				label: t('width_level_4'),
				value: DynamicFormWidthLevel.Level4,
			},
			{
				label: t('width_level_5'),
				value: DynamicFormWidthLevel.Level5,
			},
		],
		'value',
	)
	return { dynamicFormWidthLevelList, dynamicFormWidthLevelFormatter }
}
