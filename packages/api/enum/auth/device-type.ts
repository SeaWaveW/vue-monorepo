import type { TextType } from '@saco/ui'
import { useI18n } from 'vue-i18n'
import { useOptionMap } from '../../../utils/data'

/** 登录设备类型。认证接口只收这三项，登录日志里的工控机不在这里 */
export enum AuthDeviceType {
	/** 电脑 */
	Pc = 'pc',
	/** 平板 */
	Tablet = 'tablet',
	/** 手机 */
	Mobile = 'mobile',
}

/** 登录设备类型颜色类型映射 */
export const authDeviceTypeType: Record<AuthDeviceType, TextType> = {
	[AuthDeviceType.Pc]: 'info',
	[AuthDeviceType.Tablet]: 'warning',
	[AuthDeviceType.Mobile]: 'primary',
}

/** 登录设备类型：选项列表 + 按值取文案的 formatter */
export const useAuthDeviceType = () => {
	const { t } = useI18n()
	const { options: authDeviceTypeList, formatter: authDeviceTypeFormatter } =
		useOptionMap(
			[
				{
					label: t('pc'),
					value: AuthDeviceType.Pc,
				},
				{
					label: t('tablet'),
					value: AuthDeviceType.Tablet,
				},
				{
					label: t('mobile'),
					value: AuthDeviceType.Mobile,
				},
			],
			'value',
		)
	return { authDeviceTypeList, authDeviceTypeFormatter }
}
