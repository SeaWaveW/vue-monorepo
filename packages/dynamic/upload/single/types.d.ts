import type { UploadProps } from '@saco/ui'

/** 单文件上传：继承上传能力，去掉多选/文件夹/files，补业务字段；`P` 为 `params` 与 emit 第二参 */
export type UploadSingleProps<P = any> = Omit<
	UploadProps,
	'files' | 'multiple' | 'folder' | 'accept'
> & {
	/** 文件类型 */
	accept?: string[]
	/** 文件大小：单位 B */
	size?: number
	/** modelBind：文件名 */
	fileName?: string
	/** modelBind：OSS 可访问地址（原 base64 本地预览已改为直传） */
	fileUrl?: string
	/** 标题 */
	title?: string
	/** 是否必填 */
	required?: boolean
	/** 上传中；`v-model:loading`，遮罩由业务挂 */
	loading?: boolean
	/** 为 true 时，仅 `loading` 为 true 才挂扫描光效；点选由上传中 disabled 拦住 */
	lightEffect?: boolean
	/** 详情只读：空态「未上传」，不显示删除；点文件名仍下载 */
	preview?: boolean
	/** 业务桶上下文；相关 emit 第二参原样回传（切 tab 时靠它写对 dataMap） */
	params?: P
}

export type UploadSuccessHandler<P = any> = (
	result: Required<Pick<UploadSingleProps, 'fileName' | 'fileUrl'>>,
	params?: P,
) => void

/** 单文件上传对外方法；批量映射完按文件逐个调 `upload` */
export interface UploadSingleExpose<P = any> {
	/**
	 * 上传一个 File，走同一套 put / 失败 toast。
	 * @param onSuccess 批量等场景传入；与 emit 并行，卸组件后靠回调写桶
	 */
	upload: (
		file: File,
		params?: P,
		onSuccess?: UploadSuccessHandler<P>,
	) => Promise<void>
}

/** 挂载时交给业务 `uploadMap` 的配置 */
export interface DynamicUploadSlotConfig<P = any> {
	upload: UploadSingleExpose<P>['upload']
	accept?: string[]
	title?: string
}

/** 对外事件以业务模型为主（内部消化 update:files） */
export type UploadSingleEmits<P = any> = {
	'update:fileName': [value: string, params?: P]
	'update:fileUrl': [value: string, params?: P]
	'update:loading': [value: boolean, params?: P]
	/** 挂载 / params 变更登记 upload；卸载传 null。第二参为 `params` */
	mounted: [config: DynamicUploadSlotConfig<P> | null, params?: P]
}
