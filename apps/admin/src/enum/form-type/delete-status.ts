import { useOptionMap } from '#/utils/data'
/** 表单类型删除状态枚举 */
export enum FormTypeDeleteStatus {
	/** 未删除 */
	NotDeleted = 1,
	/** 已删除 */
	Deleted = 2,
}

/** 表单类型删除状态颜色类型映射 */
export const formTypeDeleteStatusType: Record<FormTypeDeleteStatus, TextType> =
	{
		[FormTypeDeleteStatus.NotDeleted]: 'success',
		[FormTypeDeleteStatus.Deleted]: 'danger',
	}

/** 表单类型删除状态：选项列表 + 按值取文案的 formatter */
export const useFormTypeDeleteStatus = () => {
	const { t } = useI18n()
	const {
		options: formTypeDeleteStatusList,
		formatter: formTypeDeleteStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('not_deleted'),
				value: FormTypeDeleteStatus.NotDeleted,
			},
			{
				label: t('deleted'),
				value: FormTypeDeleteStatus.Deleted,
			},
		],
		'value',
	)
	return { formTypeDeleteStatusList, formTypeDeleteStatusFormatter }
}
