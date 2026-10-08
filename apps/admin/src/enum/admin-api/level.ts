import { useOptionMap } from '#/utils/data'
/** API 访问级别枚举 */
export enum AdminApiLevel {
	/** 登录访问 */
	Login = 1,
	/** 用户权限访问 */
	Permission = 2,
}

/** API 访问级别颜色类型映射 */
export const adminApiLevelType: Record<AdminApiLevel, TextType> = {
	[AdminApiLevel.Login]: 'info',
	[AdminApiLevel.Permission]: 'warning',
}

/** API 访问级别：选项列表 + 按值取文案的 formatter */
export const useAdminApiLevel = () => {
	const { t } = useI18n()
	const { options: adminApiLevelList, formatter: adminApiLevelFormatter } =
		useOptionMap(
			[
				{
					label: t('login_access'),
					value: AdminApiLevel.Login,
				},
				{
					label: t('permission_access'),
					value: AdminApiLevel.Permission,
				},
			],
			'value',
		)
	return { adminApiLevelList, adminApiLevelFormatter }
}
