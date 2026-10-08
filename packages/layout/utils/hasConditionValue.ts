/**
 * 查询条件是否有有效值。
 * null / '' / [] / 空对象不算；0 / false 算有筛选。
 * 给 CommonTeleportNav / CommonTeleportDialog 的收起后搜索闪烁用。
 */
export const hasConditionValue = (value: unknown): boolean => {
	if (value == null) return false
	if (typeof value === 'string') return value.trim() !== ''
	if (Array.isArray(value)) return value.some(hasConditionValue)
	if (typeof value === 'object') {
		return Object.values(value).some(hasConditionValue)
	}
	return true
}
