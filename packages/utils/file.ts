import type { SvgName } from '@saco/ui'

/** 1MB，给上传默认上限用 */
export const FILE_SIZE_NUMBER = 1024 * 1024

/** 文件校验失败文案（类型 / 体积） */
export const FILE_ERROR_TYPE = {
	TYPE_ERROR: '请选择支持的文件类型',
	SIZE_ERROR: '文件大小超出限制',
}

export interface FileSuffixItem {
	/** 后缀名 */
	label: string
	/** 后缀值 */
	value: string
	/** 关联图标 */
	icon?: SvgName
	/** 是否可用 */
	usable: boolean
}

/** 文件后缀列表 */
export const fileSuffixList: FileSuffixItem[] = [
	// ========== 图片类 ==========
	{ label: 'JPG', value: '.jpg', usable: false },
	{ label: 'JPEG', value: '.jpeg', usable: false },
	{ label: 'PNG', value: '.png', usable: false },
	{ label: 'GIF', value: '.gif', usable: false },
	{ label: 'SVG', value: '.svg', usable: false },
	{ label: 'WebP', value: '.webp', usable: false },
	{ label: 'BMP', value: '.bmp', usable: false },

	// ========== 文档类 ==========
	{ label: 'PDF', value: '.pdf', usable: true },
	{ label: 'Word (.docx)', value: '.docx', usable: true },
	{ label: 'Word (.doc)', value: '.doc', usable: true },
	{ label: 'Excel (.xlsx)', value: '.xlsx', usable: true },
	{ label: 'Excel (.xls)', value: '.xls', usable: true },
	{ label: 'PowerPoint (.pptx)', value: '.pptx', usable: false },
	{ label: 'PowerPoint (.ppt)', value: '.ppt', usable: false },
	{ label: '文本 (.txt)', value: '.txt', usable: false },
	{ label: 'CSV', value: '.csv', usable: false },

	// ========== 音视频类 ==========
	{ label: 'MP3', value: '.mp3', usable: false },
	{ label: 'WAV', value: '.wav', usable: false },
	{ label: 'AAC', value: '.aac', usable: false },
	{ label: 'MP4', value: '.mp4', usable: false },
	{ label: 'AVI', value: '.avi', usable: false },
	{ label: 'MOV', value: '.mov', usable: false },
	{ label: 'WebM', value: '.webm', usable: false },

	// ========== 压缩包类 ==========
	{ label: 'ZIP', value: '.zip', usable: false },
	{ label: 'RAR', value: '.rar', usable: false },
	{ label: '7Z', value: '.7z', usable: false },
	{ label: 'TAR', value: '.tar', usable: false },

	// ========== 代码/数据类 ==========
	{ label: 'HTML', value: '.html', usable: false },
	{ label: 'CSS', value: '.css', usable: false },
	{ label: 'JavaScript', value: '.js', usable: false },
	{ label: 'JSON', value: '.json', usable: false },
	{ label: 'XML', value: '.xml', usable: false },
]

/**
 * 文件检测
 * @param file 文件
 * @param accept 支持的后缀名单；没配或空数组不拦类型
 * @param size 体积上限，单位 B
 * @returns 是否合法
 */
export const fileDetection = (file: File, accept?: string[], size?: number) => {
	const suffix = file.name.split('.').pop()?.toLocaleLowerCase?.()
	// 没配或空数组不拦类型，否则业务漏传 accept 一份都传不上去
	if (accept?.length) {
		const isType = accept.some((item) => item.endsWith(suffix!))
		if (!isType) {
			console.error(FILE_ERROR_TYPE.TYPE_ERROR)
			return false
		}
	}
	const isSize = size && file.size > size
	if (isSize) {
		console.error(FILE_ERROR_TYPE.SIZE_ERROR)
		return false
	}
	return true
}

/**
 * 文件转 base64
 * @param file 文件
 * @returns Promise<string> 文件 base64 编码
 */
export const fileToBase64 = (file: File) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onload = () => resolve(reader.result as string)
		reader.onerror = () => reject(new Error('文件读取失败'))
	})
}

/**
 * 用隐藏 `<a download>` 触发下载
 * @param url 文件地址
 * @param name 文件名称
 */
export const aTagDownload = (url: string, name: string) => {
	const a = document.createElement('a')
	a.href = url
	a.download = name
	a.style.display = 'none'
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
}

/**
 * 将字节大小格式化为可读文案（自动选 B / KB / MB / GB / TB）
 * @param size 大小（单位：B）
 */
export const numberToSizeUnit = (size: number) => {
	if (!Number.isFinite(size) || size <= 0) return '0B'
	const units = ['B', 'KB', 'MB', 'GB', 'TB'] as const
	const base = 1024
	// 落到合适量级（不超过 TB）
	const exp = Math.min(
		Math.floor(Math.log(size) / Math.log(base)),
		units.length - 1,
	)
	const value = size / base ** exp
	// B 不留小数；更大量级保留最多 2 位并去掉末尾 0
	if (exp === 0) return `${Math.round(value)}B`
	const text = value.toFixed(2).replace(/\.?0+$/, '')
	return `${text}${units[exp]}`
}
