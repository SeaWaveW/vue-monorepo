import { useOptionMap } from '#/utils/data'
/** 动态表单删除状态枚举 */
export enum DynamicFormDeleteStatus {
	/** 未删除 */
	NotDeleted = 1,
	/** 已删除 */
	Deleted = 2,
}

/** 动态表单删除状态颜色类型映射 */
export const dynamicFormDeleteStatusType: Record<
	DynamicFormDeleteStatus,
	TextType
> = {
	[DynamicFormDeleteStatus.NotDeleted]: 'success',
	[DynamicFormDeleteStatus.Deleted]: 'danger',
}

/** 动态表单删除状态：选项列表 + 按值取文案的 formatter */
export const useDynamicFormDeleteStatus = () => {
	const { t } = useI18n()
	const {
		options: dynamicFormDeleteStatusList,
		formatter: dynamicFormDeleteStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('not_deleted'),
				value: DynamicFormDeleteStatus.NotDeleted,
			},
			{
				label: t('deleted'),
				value: DynamicFormDeleteStatus.Deleted,
			},
		],
		'value',
	)
	return { dynamicFormDeleteStatusList, dynamicFormDeleteStatusFormatter }
}
