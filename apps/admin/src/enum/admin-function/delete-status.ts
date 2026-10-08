import { useOptionMap } from '#/utils/data'
/** 功能删除状态枚举 */
export enum AdminFunctionDeleteStatus {
	/** 未删除 */
	NotDeleted = 1,
	/** 已删除 */
	Deleted = 2,
}

/** 功能删除状态颜色类型映射 */
export const adminFunctionDeleteStatusType: Record<
	AdminFunctionDeleteStatus,
	TextType
> = {
	[AdminFunctionDeleteStatus.NotDeleted]: 'success',
	[AdminFunctionDeleteStatus.Deleted]: 'danger',
}

/** 功能删除状态：选项列表 + 按值取文案的 formatter */
export const useAdminFunctionDeleteStatus = () => {
	const { t } = useI18n()
	const {
		options: adminFunctionDeleteStatusList,
		formatter: adminFunctionDeleteStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('not_deleted'),
				value: AdminFunctionDeleteStatus.NotDeleted,
			},
			{
				label: t('deleted'),
				value: AdminFunctionDeleteStatus.Deleted,
			},
		],
		'value',
	)
	return { adminFunctionDeleteStatusList, adminFunctionDeleteStatusFormatter }
}
