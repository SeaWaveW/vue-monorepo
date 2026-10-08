import { useOptionMap } from '#/utils/data'
/** 登录设备类型枚举 */
export enum AdminUserLoginLogDeviceType {
	/** 电脑 */
	Pc = 'pc',
	/** 平板 */
	Tablet = 'tablet',
	/** 手机 */
	Mobile = 'mobile',
}

/** 登录设备类型颜色类型映射 */
export const userLoginLogDeviceTypeType: Record<
	AdminUserLoginLogDeviceType,
	TextType
> = {
	[AdminUserLoginLogDeviceType.Pc]: 'info',
	[AdminUserLoginLogDeviceType.Tablet]: 'warning',
	[AdminUserLoginLogDeviceType.Mobile]: 'primary',
}

/** 登录设备类型：选项列表 + 按值取文案的 formatter */
export const useAdminUserLoginLogDeviceType = () => {
	const { t } = useI18n()
	const {
		options: adminUserLoginLogDeviceTypeList,
		formatter: adminUserLoginLogDeviceTypeFormatter,
	} = useOptionMap(
		[
			{
				label: t('pc'),
				value: AdminUserLoginLogDeviceType.Pc,
			},
			{
				label: t('tablet'),
				value: AdminUserLoginLogDeviceType.Tablet,
			},
			{
				label: t('mobile'),
				value: AdminUserLoginLogDeviceType.Mobile,
			},
		],
		'value',
	)
	return {
		adminUserLoginLogDeviceTypeList,
		adminUserLoginLogDeviceTypeFormatter,
	}
}
