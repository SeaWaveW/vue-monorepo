import { useOptionMap } from '#/utils/data'
/** 登录状态枚举 */
export enum AdminUserLoginLogStatus {
	/** 成功 */
	Success = 1,
	/** 失败 */
	Fail = 2,
}

/** 登录状态颜色类型映射 */
export const adminUserLoginLogStatusType: Record<
	AdminUserLoginLogStatus,
	TextType
> = {
	[AdminUserLoginLogStatus.Success]: 'success',
	[AdminUserLoginLogStatus.Fail]: 'danger',
}

/** 登录状态：选项列表 + 按值取文案的 formatter */
export const useAdminUserLoginLogStatus = () => {
	const { t } = useI18n()
	const {
		options: adminUserLoginLogStatusList,
		formatter: adminUserLoginLogStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('success'),
				value: AdminUserLoginLogStatus.Success,
			},
			{
				label: t('fail'),
				value: AdminUserLoginLogStatus.Fail,
			},
		],
		'value',
	)
	return { adminUserLoginLogStatusList, adminUserLoginLogStatusFormatter }
}
