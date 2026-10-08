import { useOptionMap } from '#/utils/data'
/** 用户组删除状态枚举 */
export enum AdminUserGroupDeleteStatus {
	/** 未删除 */
	NotDeleted = 1,
	/** 已删除 */
	Deleted = 2,
}

/** 用户组删除状态颜色类型映射 */
export const userGroupDeleteStatusType: Record<
	AdminUserGroupDeleteStatus,
	TextType
> = {
	[AdminUserGroupDeleteStatus.NotDeleted]: 'success',
	[AdminUserGroupDeleteStatus.Deleted]: 'danger',
}

/** 用户组删除状态：选项列表 + 按值取文案的 formatter */
export const useUserGroupDeleteStatus = () => {
	const { t } = useI18n()
	const {
		options: userGroupDeleteStatusList,
		formatter: userGroupDeleteStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('not_deleted'),
				value: AdminUserGroupDeleteStatus.NotDeleted,
			},
			{
				label: t('deleted'),
				value: AdminUserGroupDeleteStatus.Deleted,
			},
		],
		'value',
	)
	return { userGroupDeleteStatusList, userGroupDeleteStatusFormatter }
}
