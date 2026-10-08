import { useOptionMap } from '#/utils/data'
/** 客户端 API 访问级别枚举 */
export enum ClientApiLevel {
	/** 登录访问 */
	Login = 1,
	/** 用户权限访问 */
	Permission = 2,
}

/** 客户端 API 访问级别颜色类型映射 */
export const clientApiLevelType: Record<ClientApiLevel, TextType> = {
	[ClientApiLevel.Login]: 'info',
	[ClientApiLevel.Permission]: 'warning',
}

/** 客户端 API 访问级别：选项列表 + 按值取文案的 formatter */
export const useClientApiLevel = () => {
	const { t } = useI18n()
	const { options: clientApiLevelList, formatter: clientApiLevelFormatter } =
		useOptionMap(
			[
				{
					label: t('login_access'),
					value: ClientApiLevel.Login,
				},
				{
					label: t('permission_access'),
					value: ClientApiLevel.Permission,
				},
			],
			'value',
		)
	return { clientApiLevelList, clientApiLevelFormatter }
}
