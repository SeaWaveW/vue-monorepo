import { useOptionMap } from '#/utils/data'
/** 审核 Agent删除状态枚举 */
export enum ReviewAgentDeleteStatus {
	/** 未删除 */
	NotDeleted = 1,
	/** 已删除 */
	Deleted = 2,
}

/** 审核 Agent删除状态颜色类型映射 */
export const reviewAgentDeleteStatusType: Record<
	ReviewAgentDeleteStatus,
	TextType
> = {
	[ReviewAgentDeleteStatus.NotDeleted]: 'success',
	[ReviewAgentDeleteStatus.Deleted]: 'danger',
}

/** 审核 Agent删除状态：选项列表 + 按值取文案的 formatter */
export const useReviewAgentDeleteStatus = () => {
	const { t } = useI18n()
	const {
		options: reviewAgentDeleteStatusList,
		formatter: reviewAgentDeleteStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('not_deleted'),
				value: ReviewAgentDeleteStatus.NotDeleted,
			},
			{
				label: t('deleted'),
				value: ReviewAgentDeleteStatus.Deleted,
			},
		],
		'value',
	)
	return { reviewAgentDeleteStatusList, reviewAgentDeleteStatusFormatter }
}
