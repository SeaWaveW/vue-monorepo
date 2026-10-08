import { useOptionMap } from '#/utils/data'
/** 客户端功能删除状态枚举 */
export enum ClientFunctionDeleteStatus {
	/** 未删除 */
	NotDeleted = 1,
	/** 已删除 */
	Deleted = 2,
}

/** 客户端功能删除状态颜色类型映射 */
export const clientFunctionDeleteStatusType: Record<
	ClientFunctionDeleteStatus,
	TextType
> = {
	[ClientFunctionDeleteStatus.NotDeleted]: 'success',
	[ClientFunctionDeleteStatus.Deleted]: 'danger',
}

/** 客户端功能删除状态：选项列表 + 按值取文案的 formatter */
export const useClientFunctionDeleteStatus = () => {
	const { t } = useI18n()
	const {
		options: clientFunctionDeleteStatusList,
		formatter: clientFunctionDeleteStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('not_deleted'),
				value: ClientFunctionDeleteStatus.NotDeleted,
			},
			{
				label: t('deleted'),
				value: ClientFunctionDeleteStatus.Deleted,
			},
		],
		'value',
	)
	return {
		clientFunctionDeleteStatusList,
		clientFunctionDeleteStatusFormatter,
	}
}
