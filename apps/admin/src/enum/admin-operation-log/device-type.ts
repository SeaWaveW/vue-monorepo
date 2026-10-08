import { useOptionMap } from '#/utils/data'
/** 操作日志设备类型枚举 */
export enum AdminOperationLogDeviceType {
	/** 电脑 */
	Pc = 'pc',
	/** 平板 */
	Tablet = 'tablet',
	/** 手机 */
	Mobile = 'mobile',
}

/** 操作日志设备类型颜色类型映射 */
export const operationLogDeviceTypeType: Record<
	AdminOperationLogDeviceType,
	TextType
> = {
	[AdminOperationLogDeviceType.Pc]: 'info',
	[AdminOperationLogDeviceType.Tablet]: 'warning',
	[AdminOperationLogDeviceType.Mobile]: 'primary',
}

/** 操作日志设备类型：选项列表 + 按值取文案的 formatter */
export const useAdminOperationLogDeviceType = () => {
	const { t } = useI18n()
	const {
		options: adminOperationLogDeviceTypeList,
		formatter: adminOperationLogDeviceTypeFormatter,
	} = useOptionMap(
		[
			{
				label: t('pc'),
				value: AdminOperationLogDeviceType.Pc,
			},
			{
				label: t('tablet'),
				value: AdminOperationLogDeviceType.Tablet,
			},
			{
				label: t('mobile'),
				value: AdminOperationLogDeviceType.Mobile,
			},
		],
		'value',
	)
	return {
		adminOperationLogDeviceTypeList,
		adminOperationLogDeviceTypeFormatter,
	}
}
