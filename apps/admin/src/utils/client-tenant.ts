/** 给 Select 过弱类型：和 SelectItem 重叠 `label`，行上仍是 name/id，不 map */
type ClientTenantSelectItem = ClientTenantPageRecord & { label?: string }

/**
 * 客户主体下拉。
 * 原样把 all 接口丢给 Select，用 `field-label` / `field-value` 取值，不要 map。
 * 须在 setup 调；进页和列表 `sameChannel.on` 里自己调 `loadTenantList`，不要在这里再开频道。
 */
export const useClientTenantOptions = () => {
	const tenantList = ref<ClientTenantSelectItem[]>([])
	const tenantLoading = ref(false)
	const loadTenantList = () => {
		tenantLoading.value = true
		clientTenantAll()
			.then((res) => {
				// 拦截器解到 body，列表在 data
				tenantList.value = res.data || []
			})
			.finally(() => {
				tenantLoading.value = false
			})
	}
	return { tenantList, tenantLoading, loadTenantList }
}
