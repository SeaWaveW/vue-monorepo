/** 给 Select 过弱类型：和 SelectItem 重叠 `label`，行上仍是 name/id，不 map */
type FormTypeSelectItem = FormTypePageRecord & { label?: string }

/**
 * 表单类型下拉。
 * 原样把 all 接口丢给 Select，用 `field-label` / `field-value` 取值，不要 map。
 * 须在 setup 调；进页和列表 `sameChannel.on` 里自己调 `loadFormTypeList`。
 */
export const useFormTypeOptions = () => {
	const formTypeList = ref<FormTypeSelectItem[]>([])
	const formTypeLoading = ref(false)
	const loadFormTypeList = () => {
		formTypeLoading.value = true
		formTypeAll()
			.then((res) => {
				formTypeList.value = res.data || []
			})
			.finally(() => {
				formTypeLoading.value = false
			})
	}
	return { formTypeList, formTypeLoading, loadFormTypeList }
}
