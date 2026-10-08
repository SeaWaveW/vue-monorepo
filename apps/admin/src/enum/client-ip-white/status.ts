import { useOptionMap } from '#/utils/data'
/** 客户 IP 白名单状态枚举 */
export enum ClientIpWhiteStatus {
	/** 可用 */
	Available = 1,
	/** 禁用 */
	Disabled = 2,
}

/** 客户 IP 白名单状态颜色类型映射 */
export const clientIpWhiteStatusType: Record<ClientIpWhiteStatus, TextType> = {
	[ClientIpWhiteStatus.Available]: 'success',
	[ClientIpWhiteStatus.Disabled]: 'danger',
}

/** 客户 IP 白名单状态：选项列表 + 按值取文案的 formatter */
export const useClientIpWhiteStatus = () => {
	const { t } = useI18n()
	const {
		options: clientIpWhiteStatusList,
		formatter: clientIpWhiteStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('available'),
				value: ClientIpWhiteStatus.Available,
			},
			{
				label: t('disabled'),
				value: ClientIpWhiteStatus.Disabled,
			},
		],
		'value',
	)
	return { clientIpWhiteStatusList, clientIpWhiteStatusFormatter }
}
