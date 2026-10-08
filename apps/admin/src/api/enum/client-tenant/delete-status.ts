import { useOptionMap } from '#/utils/data'
/** 租户删除状态枚举 */
export enum ClientTenantDeleteStatus {
	/** 未删除 */
	NotDeleted = 1,
	/** 已删除 */
	Deleted = 2,
}

/** 租户删除状态颜色类型映射 */
export const clientTenantDeleteStatusType: Record<
	ClientTenantDeleteStatus,
	TextType
> = {
	[ClientTenantDeleteStatus.NotDeleted]: 'success',
	[ClientTenantDeleteStatus.Deleted]: 'danger',
}

/** 租户删除状态：选项列表 + 按值取文案的 formatter */
export const useClientTenantDeleteStatus = () => {
	const { t } = useI18n()
	const {
		options: clientTenantDeleteStatusList,
		formatter: clientTenantDeleteStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('not_deleted'),
				value: ClientTenantDeleteStatus.NotDeleted,
			},
			{
				label: t('deleted'),
				value: ClientTenantDeleteStatus.Deleted,
			},
		],
		'value',
	)
	return { clientTenantDeleteStatusList, clientTenantDeleteStatusFormatter }
}
