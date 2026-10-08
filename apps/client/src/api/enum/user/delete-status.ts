import { useOptionMap } from '#/utils/data'
/** 客户用户删除状态枚举 */
export enum ClientUserDeleteStatus {
	/** 未删除 */
	NotDeleted = 1,
	/** 已删除 */
	Deleted = 2,
}

/** 客户用户删除状态颜色类型映射 */
export const clientUserDeleteStatusType: Record<
	ClientUserDeleteStatus,
	TextType
> = {
	[ClientUserDeleteStatus.NotDeleted]: 'success',
	[ClientUserDeleteStatus.Deleted]: 'danger',
}

/** 客户用户删除状态：选项列表 + 按值取文案的 formatter */
export const useClientUserDeleteStatus = () => {
	const { t } = useI18n()
	const {
		options: clientUserDeleteStatusList,
		formatter: clientUserDeleteStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('not_deleted'),
				value: ClientUserDeleteStatus.NotDeleted,
			},
			{
				label: t('deleted'),
				value: ClientUserDeleteStatus.Deleted,
			},
		],
		'value',
	)
	return { clientUserDeleteStatusList, clientUserDeleteStatusFormatter }
}
