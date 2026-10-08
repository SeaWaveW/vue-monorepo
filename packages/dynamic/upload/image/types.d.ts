import type { UploadProps } from '@saco/ui'
import type { DynamicUploadSlotConfig } from '../single/types'

/** 图片上传默认后缀（与 `fileSuffixList` 图片组对齐） */
export type ImageUploadAccept = (
	| '.jpg'
	| '.jpeg'
	| '.png'
	| '.gif'
	| '.svg'
	| '.webp'
	| '.bmp'
)[]

/** 单图片上传：继承上传能力，去掉多选/文件夹/files，补业务字段 */
export type UploadImageProps<P = any> = Omit<
	UploadProps,
	'files' | 'multiple' | 'folder' | 'accept'
> & {
	/** 文件类型；默认图片后缀 */
	accept?: string[]
	/** 文件大小：单位 MB（内部乘 FILE_SIZE_NUMBER） */
	size?: number
	/** 可空；预览不展示文件名，业务可不绑 */
	fileName?: string
	/** modelBind：OSS 可访问地址，预览 / 下载都走它 */
	fileUrl?: string
	/** 标题；不传则用 `upload_image` */
	title?: string
	/** 是否必填 */
	required?: boolean
	/** 上传中；`v-model:loading`，表单 isUploading 靠它 */
	loading?: boolean
	/**
	 * 卡片 / 预览图四角圆角。
	 * 数字按 px；传 `50%` 时因 1:1 会成正圆。
	 */
	radius?: number | string
	params?: P
}

/** 图片上传对外方法；批量映射完触发表单项走 `upload` */
export interface UploadImageExpose<P = any> {
	/** 把 File 推进来走同一套 put / 失败 toast，不要业务自己 aliOss */
	upload: (file: File, params?: P) => Promise<void>
}

/** 对外事件以业务模型为主（内部消化 update:files） */
export type UploadImageEmits<P = any> = {
	'update:fileName': [value: string, params?: P]
	'update:fileUrl': [value: string, params?: P]
	'update:loading': [value: boolean, params?: P]
	mounted: [config: DynamicUploadSlotConfig<P> | null, params?: P]
}
