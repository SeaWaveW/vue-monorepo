import { useOptionMap } from '#/utils/data'
/** 后台用户状态枚举 */
export enum AdminUserStatus {
	/** 正常 */
	Normal = 1,
	/** 禁用 */
	Disabled = 2,
}

/** 后台用户状态颜色类型映射 */
export const adminUserStatusType: Record<AdminUserStatus, TextType> = {
	[AdminUserStatus.Normal]: 'success',
	[AdminUserStatus.Disabled]: 'danger',
}

/** 后台用户状态：选项列表 + 按值取文案的 formatter */
export const useAdminUserStatus = () => {
	const { t } = useI18n()
	const {
		options: adminUserStatusList,
		formatter: adminUserStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('normal'),
				value: AdminUserStatus.Normal,
			},
			{
				label: t('disabled'),
				value: AdminUserStatus.Disabled,
			},
		],
		'value',
	)
	return { adminUserStatusList, adminUserStatusFormatter }
}
