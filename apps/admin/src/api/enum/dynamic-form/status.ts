import { useOptionMap } from '#/utils/data'
/** 动态表单状态枚举 */
export enum DynamicFormStatus {
	/** 可用 */
	Available = 1,
	/** 禁用 */
	Disabled = 2,
}

/** 动态表单状态颜色类型映射 */
export const dynamicFormStatusType: Record<DynamicFormStatus, TextType> = {
	[DynamicFormStatus.Available]: 'success',
	[DynamicFormStatus.Disabled]: 'danger',
}

/** 动态表单状态：选项列表 + 按值取文案的 formatter */
export const useDynamicFormStatus = () => {
	const { t } = useI18n()
	const {
		options: dynamicFormStatusList,
		formatter: dynamicFormStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('available'),
				value: DynamicFormStatus.Available,
			},
			{
				label: t('disabled'),
				value: DynamicFormStatus.Disabled,
			},
		],
		'value',
	)
	return { dynamicFormStatusList, dynamicFormStatusFormatter }
}
