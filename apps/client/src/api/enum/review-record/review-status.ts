import { useOptionMap } from '#/utils/data'
/** 审核记录审核状态枚举 */
export enum ReviewRecordReviewStatus {
	/** 审核中 */
	Reviewing = 1,
	/** 成功 */
	Success = 2,
	/** 失败 */
	Fail = 3,
}

/** 审核记录审核状态颜色类型映射 */
export const reviewRecordReviewStatusType: Record<
	ReviewRecordReviewStatus,
	TextType
> = {
	[ReviewRecordReviewStatus.Reviewing]: 'primary',
	[ReviewRecordReviewStatus.Success]: 'success',
	[ReviewRecordReviewStatus.Fail]: 'danger',
}

/** 审核记录审核状态：选项列表 + 按值取文案的 formatter */
export const useReviewRecordReviewStatus = () => {
	const { t } = useI18n()
	const {
		options: reviewRecordReviewStatusList,
		formatter: reviewRecordReviewStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('reviewing'),
				value: ReviewRecordReviewStatus.Reviewing,
			},
			{
				label: t('success'),
				value: ReviewRecordReviewStatus.Success,
			},
			{
				label: t('fail'),
				value: ReviewRecordReviewStatus.Fail,
			},
		],
		'value',
	)
	return { reviewRecordReviewStatusList, reviewRecordReviewStatusFormatter }
}
