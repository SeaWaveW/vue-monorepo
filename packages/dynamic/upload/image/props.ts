import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { UploadImageProps } from './types'

/** 默认只收图片，避免业务漏传 accept 时选到文档 */
export const IMAGE_UPLOAD_ACCEPT: NonNullable<UploadImageProps['accept']> = [
	'.jpg',
	'.jpeg',
	'.png',
	'.gif',
	'.webp',
]

export const imageUploadProps = {
	title: {
		type: String as PropType<UploadImageProps['title']>,
		default: '',
	},
	required: {
		type: Boolean as PropType<UploadImageProps['required']>,
		default: false,
	},
	accept: {
		type: [Array] as PropType<UploadImageProps['accept']>,
		default: () => [...IMAGE_UPLOAD_ACCEPT],
	},
	disabled: {
		type: Boolean as PropType<UploadImageProps['disabled']>,
		default: false,
	},
	drag: {
		type: Boolean as PropType<UploadImageProps['drag']>,
		default: true,
	},
	paste: {
		type: Boolean as PropType<UploadImageProps['paste']>,
		default: true,
	},
	size: {
		type: Number as PropType<UploadImageProps['size']>,
		default: 5,
	},
	fileName: {
		type: String as PropType<UploadImageProps['fileName']>,
		default: '',
	},
	fileUrl: {
		type: String as PropType<UploadImageProps['fileUrl']>,
		default: '',
	},
	radius: {
		type: [Number, String] as PropType<UploadImageProps['radius']>,
		default: 8,
	},
	params: {
		type: Object as PropType<UploadImageProps['params']>,
		default: undefined,
	},
} satisfies ComponentObjectPropsOptions<UploadImageProps>
