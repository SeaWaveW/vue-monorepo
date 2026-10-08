import { useOptionMap } from '#/utils/data'
/** 租户类型枚举 */
export enum ClientTenantType {
	/** 数据设置主体 */
	DataSetting = 1,
	/** 客户主体 */
	ClientSubject = 2,
}

/** 租户类型颜色类型映射 */
export const clientTenantTypeType: Record<ClientTenantType, TextType> = {
	[ClientTenantType.DataSetting]: 'info',
	[ClientTenantType.ClientSubject]: 'primary',
}

/** 租户类型：选项列表 + 按值取文案的 formatter */
export const useClientTenantType = () => {
	const { t } = useI18n()
	const {
		options: clientTenantTypeList,
		formatter: clientTenantTypeFormatter,
	} = useOptionMap(
		[
			{
				label: t('data_setting_subject'),
				value: ClientTenantType.DataSetting,
			},
			{
				label: t('client_subject'),
				value: ClientTenantType.ClientSubject,
			},
		],
		'value',
	)
	return { clientTenantTypeList, clientTenantTypeFormatter }
}
