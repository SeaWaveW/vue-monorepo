import { useOptionMap } from '#/utils/data'
/** Skill 类型删除状态枚举 */
export enum SkillTypeDeleteStatus {
	/** 未删除 */
	NotDeleted = 1,
	/** 已删除 */
	Deleted = 2,
}

/** Skill 类型删除状态颜色类型映射 */
export const skillTypeDeleteStatusType: Record<
	SkillTypeDeleteStatus,
	TextType
> = {
	[SkillTypeDeleteStatus.NotDeleted]: 'success',
	[SkillTypeDeleteStatus.Deleted]: 'danger',
}

/** Skill 类型删除状态：选项列表 + 按值取文案的 formatter */
export const useSkillTypeDeleteStatus = () => {
	const { t } = useI18n()
	const {
		options: skillTypeDeleteStatusList,
		formatter: skillTypeDeleteStatusFormatter,
	} = useOptionMap(
		[
			{
				label: t('not_deleted'),
				value: SkillTypeDeleteStatus.NotDeleted,
			},
			{
				label: t('deleted'),
				value: SkillTypeDeleteStatus.Deleted,
			},
		],
		'value',
	)
	return { skillTypeDeleteStatusList, skillTypeDeleteStatusFormatter }
}
