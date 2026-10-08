import { useOptionMap } from '#/utils/data'
/** 客户端导航删除状态枚举 */
export enum ClientNavigationDeleteStatus {
	/** 未删除 */
	NotDeleted = 1,
	/** 已删除 */
	Deleted = 2,
}

/** 客户端导航删除状态颜色类型映射 */
export const clientNavigationDeleteStatusType: Record<
	ClientNavigationDeleteStatus,
	TextType
> = {
	[ClientNavigationDeleteStatus.NotDeleted]: 'success',
	[ClientNavigationDeleteStatus.Deleted]: 'danger',
}

/** 客户端导航删除状态：选项列表 + 按值取文案的 formatter */
export const useClientNavigationDeleteStatus = () => {
	const { t } = useI18n()
	const {
		options: clientNavigationDeleteStatusList,
		formatter: clientNavigationDeleteStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('not_deleted'),
				value: ClientNavigationDeleteStatus.NotDeleted,
			},
			{
				label: t('deleted'),
				value: ClientNavigationDeleteStatus.Deleted,
			},
		],
		'value',
	)
	return {
		clientNavigationDeleteStatusList,
		clientNavigationDeleteStatusFormatter,
	}
}
