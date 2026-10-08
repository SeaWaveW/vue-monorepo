import { useOptionMap } from '#/utils/data'
/** 客户端操作日志设备类型枚举 */
export enum ClientOperationLogDeviceType {
	/** 电脑 */
	Pc = 'pc',
	/** 平板 */
	Tablet = 'tablet',
	/** 手机 */
	Mobile = 'mobile',
	/** 工控机 */
	Industrial = 'industrial',
}

/** 客户端操作日志设备类型颜色类型映射 */
export const clientOperationLogDeviceTypeType: Record<
	ClientOperationLogDeviceType,
	TextType
> = {
	[ClientOperationLogDeviceType.Pc]: 'info',
	[ClientOperationLogDeviceType.Tablet]: 'warning',
	[ClientOperationLogDeviceType.Mobile]: 'primary',
	[ClientOperationLogDeviceType.Industrial]: 'success',
}

/** 客户端操作日志设备类型：选项列表 + 按值取文案的 formatter */
export const useClientOperationLogDeviceType = () => {
	const { t } = useI18n()
	const {
		options: clientOperationLogDeviceTypeList,
		formatter: clientOperationLogDeviceTypeFormatter,
	} = useOptionMap(
		[
			{
				label: t('pc'),
				value: ClientOperationLogDeviceType.Pc,
			},
			{
				label: t('tablet'),
				value: ClientOperationLogDeviceType.Tablet,
			},
			{
				label: t('mobile'),
				value: ClientOperationLogDeviceType.Mobile,
			},
			{
				label: t('industrial'),
				value: ClientOperationLogDeviceType.Industrial,
			},
		],
		'value',
	)
	return {
		clientOperationLogDeviceTypeList,
		clientOperationLogDeviceTypeFormatter,
	}
}
