import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { UploadSingleProps } from './types'

export const singleUploadProps = {
	title: {
		type: String as PropType<UploadSingleProps['title']>,
		default: '',
	},
	required: {
		type: Boolean as PropType<UploadSingleProps['required']>,
		default: false,
	},
	accept: {
		type: [Array] as PropType<UploadSingleProps['accept']>,
		default: [],
	},
	disabled: {
		type: Boolean as PropType<UploadSingleProps['disabled']>,
		default: false,
	},
	drag: {
		type: Boolean as PropType<UploadSingleProps['drag']>,
		default: true,
	},
	paste: {
		type: Boolean as PropType<UploadSingleProps['paste']>,
		default: true,
	},
	size: {
		type: Number as PropType<UploadSingleProps['size']>,
		default: 500,
	},
	fileName: {
		type: String as PropType<UploadSingleProps['fileName']>,
		default: '',
	},
	fileUrl: {
		type: String as PropType<UploadSingleProps['fileUrl']>,
		default: '',
	},
	lightEffect: {
		type: Boolean as PropType<UploadSingleProps['lightEffect']>,
		default: true,
	},
	preview: {
		type: Boolean as PropType<UploadSingleProps['preview']>,
		default: false,
	},
	params: {
		type: Object as PropType<UploadSingleProps['params']>,
		default: undefined,
	},
} satisfies ComponentObjectPropsOptions<UploadSingleProps>
