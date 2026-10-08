import { useOptionMap } from '#/utils/data'
/** 客户用户状态枚举 */
export enum ClientUserStatus {
	/** 正常 */
	Normal = 1,
	/** 禁用 */
	Disabled = 2,
}

/** 客户用户状态颜色类型映射 */
export const clientUserStatusType: Record<ClientUserStatus, TextType> = {
	[ClientUserStatus.Normal]: 'success',
	[ClientUserStatus.Disabled]: 'danger',
}

/** 客户用户状态：选项列表 + 按值取文案的 formatter */
export const useClientUserStatus = () => {
	const { t } = useI18n()
	const {
		options: clientUserStatusList,
		formatter: clientUserStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('normal'),
				value: ClientUserStatus.Normal,
			},
			{
				label: t('disabled'),
				value: ClientUserStatus.Disabled,
			},
		],
		'value',
	)
	return { clientUserStatusList, clientUserStatusFormatter }
}
