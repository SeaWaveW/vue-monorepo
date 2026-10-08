import type { ComponentItem } from '../types'
import { FILE_SIZE_NUMBER, fileDetection } from '../../utils/file'
import { IMAGE_UPLOAD_ACCEPT, imageUploadProps } from './image/props'
import { singleUploadProps } from './single/props'

/** 与 `singleUploadProps` / `imageUploadProps` 默认 size（MB）一致 */
const SINGLE_SIZE_MB = singleUploadProps.size.default as number
const IMAGE_SIZE_MB = imageUploadProps.size.default as number

/**
 * 动态表单项上的 accept；与 DynamicUploadSingle / DynamicUploadImage 渲染时一致。
 * @param item 画布项 `name` + `props`
 */
export const readDynamicUploadAccept = (
	item: Pick<ComponentItem, 'name' | 'props'>,
): string[] => {
	const listed = item.props?.accept
	if (Array.isArray(listed) && listed.length) {
		const accept: string[] = []
		for (const suffix of listed) {
			if (typeof suffix === 'string') {
				accept.push(suffix)
			}
		}
		if (accept.length) {
			return accept
		}
	}
	if (item.name === 'DynamicUploadImage') {
		return [...IMAGE_UPLOAD_ACCEPT]
	}
	return []
}

/**
 * 体积上限（B）；`props.size` 为 MB，默认跟各上传组件 props 默认一致。
 */
export const readDynamicUploadSizeBytes = (
	item: Pick<ComponentItem, 'name' | 'props'>,
) => {
	const raw = Number(item.props?.size)
	const defaultMb =
		item.name === 'DynamicUploadImage' ? IMAGE_SIZE_MB : SINGLE_SIZE_MB
	const mb = Number.isFinite(raw) && raw > 0 ? raw : defaultMb
	return mb * FILE_SIZE_NUMBER
}

/**
 * 与表单项内 DynamicUpload* 点选同一套 fileDetection（类型 + 体积）。
 */
export const detectDynamicUploadFile = (
	file: File,
	item: Pick<ComponentItem, 'name' | 'props'>,
) => {
	const accept = readDynamicUploadAccept(item)
	const sizeBytes = readDynamicUploadSizeBytes(item)
	return fileDetection(
		file,
		accept.length ? accept : undefined,
		sizeBytes,
	)
}
