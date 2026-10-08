import { useOptionMap } from '#/utils/data'
/** Skill 平台类型枚举 */
export enum SkillPlatformType {
	/** 阿里云百炼 */
	AliyunBailian = 1,
	/** 字节跳动 Coze */
	BytedanceCoze = 2,
	/** 私有部署 Dify */
	PrivateDify = 3,
}

/** Skill 平台类型颜色类型映射 */
export const skillPlatformTypeType: Record<SkillPlatformType, TextType> = {
	[SkillPlatformType.AliyunBailian]: 'primary',
	[SkillPlatformType.BytedanceCoze]: 'warning',
	[SkillPlatformType.PrivateDify]: 'info',
}

/** Skill 平台类型：选项列表 + 按值取文案的 formatter */
export const useSkillPlatformType = () => {
	const { t } = useI18n()
	const {
		options: skillPlatformTypeList,
		formatter: skillPlatformTypeFormatter,
	} = useOptionMap(
		[
			{
				label: t('aliyun_bailian'),
				value: SkillPlatformType.AliyunBailian,
			},
			{
				label: t('bytedance_coze'),
				value: SkillPlatformType.BytedanceCoze,
			},
			{
				label: t('private_dify'),
				value: SkillPlatformType.PrivateDify,
			},
		],
		'value',
	)
	return { skillPlatformTypeList, skillPlatformTypeFormatter }
}
