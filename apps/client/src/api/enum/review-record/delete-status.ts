import { useOptionMap } from '#/utils/data'
/** 审核记录删除状态枚举 */
export enum ReviewRecordDeleteStatus {
	/** 未删除 */
	NotDeleted = 1,
	/** 已删除 */
	Deleted = 2,
}

/** 审核记录删除状态颜色类型映射 */
export const reviewRecordDeleteStatusType: Record<
	ReviewRecordDeleteStatus,
	TextType
> = {
	[ReviewRecordDeleteStatus.NotDeleted]: 'success',
	[ReviewRecordDeleteStatus.Deleted]: 'danger',
}

/** 审核记录删除状态：选项列表 + 按值取文案的 formatter */
export const useReviewRecordDeleteStatus = () => {
	const { t } = useI18n()
	const {
		options: reviewRecordDeleteStatusList,
		formatter: reviewRecordDeleteStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('not_deleted'),
				value: ReviewRecordDeleteStatus.NotDeleted,
			},
			{
				label: t('deleted'),
				value: ReviewRecordDeleteStatus.Deleted,
			},
		],
		'value',
	)
	return { reviewRecordDeleteStatusList, reviewRecordDeleteStatusFormatter }
}
