import { nextTick, ref, watch, type Ref } from 'vue'

/**
 * 只要勾选相关方法。不要写 `TableExpose`：业务 link 本地 ui 时和
 * common 自己 node_modules 里那份 `@saco/ui` 是两套类型，VNode 对不上。
 */
export interface TableSelectionExpose {
	clearSelection: () => void
	toggleRowSelection: (row: any, selected?: boolean) => void
}

/**
 * 只读 `.value`，不要 `Ref<TableExpose>`。
 * 模板 ref 会把 getter 推成整份 expose，`Ref` 逆变再和另一份 `@saco/ui` 比 formatter / VNode 就红。
 */
export interface TableSelectionRef {
	/** 当前表格实例；空则只改 apis，不驱动勾选列 */
	value: TableSelectionExpose | null | undefined
}

/** useTableSelection 返回值：只负责勾选 / 移除，list 由调用方的 apis 持有 */
export interface UseTableSelectionReturn<D> {
	/** 表格 selection-change：有 reserve 时 rows 已含其它页，直接写回 apis */
	handleSelectionChange: (rows: D[]) => void
	/** 移除一行。弹窗走取消勾选；页面直接从 apis 删 */
	handleRemove: (item: D) => void
}

/**
 * 跨页勾选 / 页面移除，写的是传入的响应式 `apis`，不另建 list、不打详情。
 * 从 `@saco/common/utils` 取。须传 `Ref<D[]>`：独立 `ref` 直接传；`reactive` 表单字段用 `toRef(formModel, 'apis')`。
 * 不要传 `formModel.apis`：那只是当前数组，详情 `Object.assign` 换新引用后 hook 还指着旧的。
 * 新增 / 修改 / 详情只传 apis；弹窗再传 tableRef / visible / onOpen（须 `reserve-selection`）。
 * 须在 setup 调一次。
 */
export const useTableSelection = <D extends { id: number }>(
	apis: Ref<D[]>,
	tableRef?: TableSelectionRef,
	visible?: Ref<boolean>,
	onOpen?: () => void,
): UseTableSelectionReturn<D> => {
	/** 程序化勾选时跳过 selection-change，避免中间态写回 */
	const restoringSelection = ref(false)
	if (visible) {
		// 情况1：选接口弹窗，打开时按现有 apis 恢复勾选
		watch(visible, (newVal) => {
			if (!newVal) return
			restoringSelection.value = true
			nextTick(() => {
				// 页面侧可能已从 apis 删行，先清表格残留勾选再按 apis 恢复
				tableRef?.value?.clearSelection()
				apis.value.forEach((row) => {
					tableRef?.value?.toggleRowSelection(row, true)
				})
				onOpen?.()
				nextTick(() => {
					restoringSelection.value = false
				})
			})
		})
	}
	const handleSelectionChange = (rows: D[]) => {
		if (restoringSelection.value) return
		apis.value = [...rows]
	}
	const handleRemove = (item: D) => {
		if (tableRef) {
			// 情况1：弹窗有勾选列，取消勾选后走 selection-change
			tableRef.value?.toggleRowSelection(item, false)
			return
		}
		// 情况2：新增 / 修改页表格只展示，从 apis 删
		apis.value = apis.value.filter((row) => row.id !== item.id)
	}
	return {
		handleSelectionChange,
		handleRemove,
	}
}
