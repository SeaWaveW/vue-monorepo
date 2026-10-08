import { useOptionMap } from '#/utils/data'
/** 客户用户组删除状态枚举 */
export enum ClientUserGroupDeleteStatus {
	/** 未删除 */
	NotDeleted = 1,
	/** 已删除 */
	Deleted = 2,
}

/** 客户用户组删除状态颜色类型映射 */
export const clientUserGroupDeleteStatusType: Record<
	ClientUserGroupDeleteStatus,
	TextType
> = {
	[ClientUserGroupDeleteStatus.NotDeleted]: 'success',
	[ClientUserGroupDeleteStatus.Deleted]: 'danger',
}

/** 客户用户组删除状态：选项列表 + 按值取文案的 formatter */
export const useClientUserGroupDeleteStatus = () => {
	const { t } = useI18n()
	const {
		options: clientUserGroupDeleteStatusList,
		formatter: clientUserGroupDeleteStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('not_deleted'),
				value: ClientUserGroupDeleteStatus.NotDeleted,
			},
			{
				label: t('deleted'),
				value: ClientUserGroupDeleteStatus.Deleted,
			},
		],
		'value',
	)
	return {
		clientUserGroupDeleteStatusList,
		clientUserGroupDeleteStatusFormatter,
	}
}
