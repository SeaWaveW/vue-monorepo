/** 给 Select 过弱类型：和 SelectItem 重叠 `label`，行上仍是 name/id，不 map */
type SkillTypeSelectItem = SkillTypePageRecord & { label?: string }

/**
 * Skill 类型下拉。
 * 原样把 all 接口丢给 Select，用 `field-label` / `field-value` 取值，不要 map。
 * 须在 setup 调；进页和列表 `sameChannel.on` 里自己调 `loadSkillTypeList`。
 */
export const useSkillTypeOptions = () => {
	const skillTypeList = ref<SkillTypeSelectItem[]>([])
	const skillTypeLoading = ref(false)
	const loadSkillTypeList = () => {
		skillTypeLoading.value = true
		skillTypeAll()
			.then((res) => {
				skillTypeList.value = res.data || []
			})
			.finally(() => {
				skillTypeLoading.value = false
			})
	}
	return { skillTypeList, skillTypeLoading, loadSkillTypeList }
}
