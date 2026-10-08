import { useOptionMap } from '#/utils/data'
/** 客户端登录状态枚举 */
export enum ClientUserLoginLogStatus {
	/** 成功 */
	Success = 1,
	/** 失败 */
	Fail = 2,
}

/** 客户端登录状态颜色类型映射 */
export const clientUserLoginLogStatusType: Record<
	ClientUserLoginLogStatus,
	TextType
> = {
	[ClientUserLoginLogStatus.Success]: 'success',
	[ClientUserLoginLogStatus.Fail]: 'danger',
}

/** 客户端登录状态：选项列表 + 按值取文案的 formatter */
export const useClientUserLoginLogStatus = () => {
	const { t } = useI18n()
	const {
		options: clientUserLoginLogStatusList,
		formatter: clientUserLoginLogStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('success'),
				value: ClientUserLoginLogStatus.Success,
			},
			{
				label: t('fail'),
				value: ClientUserLoginLogStatus.Fail,
			},
		],
		'value',
	)
	return { clientUserLoginLogStatusList, clientUserLoginLogStatusFormatter }
}
