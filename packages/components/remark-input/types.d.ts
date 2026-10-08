import type { SearchRowLogo } from '../../utils/search'

/** 表格行内改备注；D 跟列表行走，须带 SearchRowLogo 的编辑态字段 */
export interface RemarkInputProps<
	D extends SearchRowLogo<AnyObj> = SearchRowLogo<AnyObj>,
> {
	handleSave: (row: D) => void
	apiPath: string
	/** 字段最长字符数，与对应资源 swagger maxLength 一致 */
	maxlength: number
	placeholder?: string
	/** 要改的行字段；默认 remark，未达预期反馈传 unmetExpectationFeedback */
	field?: string
}
