import type { ComponentItem } from '../../dynamic'
import type { TabPaneName } from '@saco/ui'

/** 动态表单只读预览。`data` 按组件 id 盖过 defaultModel，详情回填用 */
export interface DynamicPreviewProps {
	components?: ComponentItem[]
	proportion?: TabPaneName
	/** 审核填写数据；提交 inputDataJson 的 key 是 id */
	data?: Record<string, any>
}
