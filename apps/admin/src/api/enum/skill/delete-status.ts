import { useOptionMap } from '#/utils/data'
/** Skill删除状态枚举 */
export enum SkillDeleteStatus {
	/** 未删除 */
	NotDeleted = 1,
	/** 已删除 */
	Deleted = 2,
}

/** Skill删除状态颜色类型映射 */
export const skillDeleteStatusType: Record<SkillDeleteStatus, TextType> = {
	[SkillDeleteStatus.NotDeleted]: 'success',
	[SkillDeleteStatus.Deleted]: 'danger',
}

/** Skill删除状态：选项列表 + 按值取文案的 formatter */
export const useSkillDeleteStatus = () => {
	const { t } = useI18n()
	const {
		options: skillDeleteStatusList,
		formatter: skillDeleteStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('not_deleted'),
				value: SkillDeleteStatus.NotDeleted,
			},
			{
				label: t('deleted'),
				value: SkillDeleteStatus.Deleted,
			},
		],
		'value',
	)
	return { skillDeleteStatusList, skillDeleteStatusFormatter }
}
