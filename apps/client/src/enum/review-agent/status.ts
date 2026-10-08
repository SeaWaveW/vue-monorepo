import { useOptionMap } from '#/utils/data'
/** 审核 Agent 可用状态枚举 */
export enum ReviewAgentStatus {
	/** 可用 */
	Available = 1,
	/** 禁用 */
	Disabled = 2,
}

/** 审核 Agent 可用状态颜色类型映射 */
export const reviewAgentStatusType: Record<ReviewAgentStatus, TextType> = {
	[ReviewAgentStatus.Available]: 'success',
	[ReviewAgentStatus.Disabled]: 'danger',
}

/** 审核 Agent 可用状态：选项列表 + 按值取文案的 formatter */
export const useReviewAgentStatus = () => {
	const { t } = useI18n()
	const {
		options: reviewAgentStatusList,
		formatter: reviewAgentStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('available'),
				value: ReviewAgentStatus.Available,
			},
			{
				label: t('disabled'),
				value: ReviewAgentStatus.Disabled,
			},
		],
		'value',
	)
	return { reviewAgentStatusList, reviewAgentStatusFormatter }
}
