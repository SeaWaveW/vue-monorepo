import { useOptionMap } from '#/utils/data'
/** 可用状态枚举 */
export enum AdminIpWhiteStatus {
	/** 可用 */
	Available = 1,
	/** 禁用 */
	Disabled = 2,
}

/** 可用状态颜色类型映射 */
export const adminIpWhiteStatusType: Record<AdminIpWhiteStatus, TextType> = {
	[AdminIpWhiteStatus.Available]: 'success',
	[AdminIpWhiteStatus.Disabled]: 'danger',
}

/** IP白名单状态：选项列表 + 按值取文案的 formatter */
export const useAdminIpWhiteStatus = () => {
	const { t } = useI18n()
	const {
		options: adminIpWhiteStatusList,
		formatter: adminIpWhiteStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('available'),
				value: AdminIpWhiteStatus.Available,
			},
			{
				label: t('disabled'),
				value: AdminIpWhiteStatus.Disabled,
			},
		],
		'value',
	)
	return { adminIpWhiteStatusList, adminIpWhiteStatusFormatter }
}
