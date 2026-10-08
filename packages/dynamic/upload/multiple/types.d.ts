import type { SvgName, UploadProps } from '@saco/ui'
import type { ComponentItem } from '../../types'

/** 多文件上传成功后的一项；`name` 是原文件名，不要用 OSS object key */
export interface UploadMultipleFileItem {
	/** 原文件名，提交 / 展示都用这个 */
	name: string
	/** OSS 可访问地址 */
	url: string
}

/** 多文件上传：继承上传能力，`v-model` 对外是结果数组不是 File */
export type UploadMultipleProps<P = any> = Omit<UploadProps, 'accept' | 'files'> & {
	/** 文件类型 */
	accept?: string[]
	/** 文件大小：单位 MB，内部再乘 `FILE_SIZE_NUMBER` */
	size?: number
	/** 空态图标，默认 `files` */
	icon?: SvgName
	/** 空态提示；不传用 `folder_upload_tips` */
	tips?: string
	/** 标题 */
	title?: string
	/** 组件列表 */
	components?: ComponentItem[]
	/** 组件数据 */
	data?: Record<string, any>
	/** 已上传列表；默认 `v-model` */
	modelValue?: UploadMultipleFileItem[]
	/** 上传中；`v-model:loading`，遮罩由业务挂 */
	loading?: boolean
	/** 为 true 时，仅当前 `loading` 挂扫描光效；点选由上传中 disabled 拦住 */
	lightEffect?: boolean
	/** 批量段业务上下文；与事件第二参同一 `P` */
	params?: P
	/**
	 * 过完类型 / 大小后、put OSS 前。第二参是开始时的 `params`。
	 * 返回要实际上传的文件（可异步）；空数组不上传、不发 `success`；不传则整批 put
	 */
	beforeUpload?: (files: File[], params?: P) => File[] | Promise<File[]>
}

/** 多文件上传对外方法；批量映射完触发表单项走 `upload` */
export interface UploadMultipleExpose {
	/** 把 File 推进来走同一套 put / 失败 toast，不要业务自己 aliOss */
	upload: (files: File[]) => void | Promise<void>
}

/** 对外事件以业务模型为主（内部消化 SacoUpload 的 File[]） */
export type UploadMultipleEmits<P = any> = {
	'update:modelValue': [value: UploadMultipleFileItem[]]
	'update:loading': [value: boolean]
	/** 全部 put 成功后才发；失败不发。第二参为本次 `params` */
	success: [value: UploadMultipleFileItem[], params?: P]
} & {}
