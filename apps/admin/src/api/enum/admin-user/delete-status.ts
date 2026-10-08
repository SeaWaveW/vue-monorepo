import { useOptionMap } from '#/utils/data'
/** 后台用户删除状态枚举 */
export enum AdminUserDeleteStatus {
	/** 未删除 */
	NotDeleted = 1,
	/** 已删除 */
	Deleted = 2,
}

/** 后台用户删除状态颜色类型映射 */
export const userDeleteStatusType: Record<AdminUserDeleteStatus, TextType> = {
	[AdminUserDeleteStatus.NotDeleted]: 'success',
	[AdminUserDeleteStatus.Deleted]: 'danger',
}

/** 后台用户删除状态：选项列表 + 按值取文案的 formatter */
export const useUserDeleteStatus = () => {
	const { t } = useI18n()
	const {
		options: userDeleteStatusList,
		formatter: userDeleteStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('not_deleted'),
				value: AdminUserDeleteStatus.NotDeleted,
			},
			{
				label: t('deleted'),
				value: AdminUserDeleteStatus.Deleted,
			},
		],
		'value',
	)
	return { userDeleteStatusList, userDeleteStatusFormatter }
}
