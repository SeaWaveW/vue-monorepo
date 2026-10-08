/** 详情 / 只读场景的图片展示，不带上传与删除 */
export interface ImagePreviewProps {
	/** OSS / 可访问地址；空则走 `leachFormatter`，不要再套 DynamicUploadImage disabled */
	src?: string
	/** img alt；预览不展示文件名，可不传 */
	alt?: string
	/**
	 * 卡片四角圆角，与 `DynamicUploadImage` 对齐。
	 * 数字按 px；传 `50%` 时因 1:1 会成正圆。
	 */
	radius?: number | string
}

/** 无自有 emit；原生 img 事件 fallthrough */
export type ImagePreviewEmits = Record<string, never>
