import { useOptionMap } from '#/utils/data'
/** 导航删除状态枚举 */
export enum AdminNavigationDeleteStatus {
	/** 未删除 */
	NotDeleted = 1,
	/** 已删除 */
	Deleted = 2,
}

/** 导航删除状态颜色类型映射 */
export const adminNavigationDeleteStatusType: Record<
	AdminNavigationDeleteStatus,
	TextType
> = {
	[AdminNavigationDeleteStatus.NotDeleted]: 'success',
	[AdminNavigationDeleteStatus.Deleted]: 'danger',
}

/** 导航删除状态：选项列表 + 按值取文案的 formatter */
export const useAdminNavigationDeleteStatus = () => {
	const { t } = useI18n()
	const {
		options: adminNavigationDeleteStatusList,
		formatter: adminNavigationDeleteStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('not_deleted'),
				value: AdminNavigationDeleteStatus.NotDeleted,
			},
			{
				label: t('deleted'),
				value: AdminNavigationDeleteStatus.Deleted,
			},
		],
		'value',
	)
	return {
		adminNavigationDeleteStatusList,
		adminNavigationDeleteStatusFormatter,
	}
}
