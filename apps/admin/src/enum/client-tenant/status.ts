import { useOptionMap } from '#/utils/data'
/** 租户状态枚举 */
export enum ClientTenantStatus {
	/** 启用 */
	Available = 1,
	/** 禁用 */
	Disabled = 2,
}

/** 租户状态颜色类型映射 */
export const clientTenantStatusType: Record<ClientTenantStatus, TextType> = {
	[ClientTenantStatus.Available]: 'success',
	[ClientTenantStatus.Disabled]: 'danger',
}

/** 租户状态：选项列表 + 按值取文案的 formatter */
export const useClientTenantStatus = () => {
	const { t } = useI18n()
	const {
		options: clientTenantStatusList,
		formatter: clientTenantStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('available'),
				value: ClientTenantStatus.Available,
			},
			{
				label: t('disabled'),
				value: ClientTenantStatus.Disabled,
			},
		],
		'value',
	)
	return { clientTenantStatusList, clientTenantStatusFormatter }
}
