import { useOptionMap } from '#/utils/data'
/** 客户端登录设备类型枚举 */
export enum ClientUserLoginLogDeviceType {
	/** 电脑 */
	Pc = 'pc',
	/** 平板 */
	Tablet = 'tablet',
	/** 手机 */
	Mobile = 'mobile',
	/** 工控机 */
	Industrial = 'industrial',
}

/** 客户端登录设备类型颜色类型映射 */
export const clientUserLoginLogDeviceTypeType: Record<
	ClientUserLoginLogDeviceType,
	TextType
> = {
	[ClientUserLoginLogDeviceType.Pc]: 'info',
	[ClientUserLoginLogDeviceType.Tablet]: 'warning',
	[ClientUserLoginLogDeviceType.Mobile]: 'primary',
	[ClientUserLoginLogDeviceType.Industrial]: 'success',
}

/** 客户端登录设备类型：选项列表 + 按值取文案的 formatter */
export const useClientUserLoginLogDeviceType = () => {
	const { t } = useI18n()
	const {
		options: clientUserLoginLogDeviceTypeList,
		formatter: clientUserLoginLogDeviceTypeFormatter,
	} = useOptionMap(
		[
			{
				label: t('pc'),
				value: ClientUserLoginLogDeviceType.Pc,
			},
			{
				label: t('tablet'),
				value: ClientUserLoginLogDeviceType.Tablet,
			},
			{
				label: t('mobile'),
				value: ClientUserLoginLogDeviceType.Mobile,
			},
			{
				label: t('industrial'),
				value: ClientUserLoginLogDeviceType.Industrial,
			},
		],
		'value',
	)
	return {
		clientUserLoginLogDeviceTypeList,
		clientUserLoginLogDeviceTypeFormatter,
	}
}
