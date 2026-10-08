import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { UploadMultipleProps } from './types'

export const multipleUploadProps = {
	icon: {
		type: String as PropType<UploadMultipleProps['icon']>,
		default: 'files',
	},
	tips: {
		type: String as PropType<UploadMultipleProps['tips']>,
		default: '',
	},
	title: {
		type: String as PropType<UploadMultipleProps['title']>,
		default: '',
	},
	components: {
		type: Array as PropType<UploadMultipleProps['components']>,
		default: () => [],
	},
	data: {
		type: Object as PropType<UploadMultipleProps['data']>,
		default: () => ({}),
	},
	accept: {
		type: [Array] as PropType<UploadMultipleProps['accept']>,
		default: [],
	},
	disabled: {
		type: Boolean as PropType<UploadMultipleProps['disabled']>,
		default: false,
	},
	drag: {
		type: Boolean as PropType<UploadMultipleProps['drag']>,
		default: true,
	},
	paste: {
		type: Boolean as PropType<UploadMultipleProps['paste']>,
		default: true,
	},
	size: {
		type: Number as PropType<UploadMultipleProps['size']>,
		default: 1024 * 5,
	},
	modelValue: {
		type: Array as PropType<UploadMultipleProps['modelValue']>,
		default: () => [],
	},
	folder: {
		type: Boolean as PropType<UploadMultipleProps['folder']>,
		default: true,
	},
	multiple: {
		type: Boolean as PropType<UploadMultipleProps['multiple']>,
		default: true,
	},
	lightEffect: {
		type: Boolean as PropType<UploadMultipleProps['lightEffect']>,
		default: true,
	},
	params: {
		type: Object as PropType<UploadMultipleProps['params']>,
		default: undefined,
	},
	beforeUpload: {
		type: Function as PropType<UploadMultipleProps['beforeUpload']>,
	},
} satisfies ComponentObjectPropsOptions<UploadMultipleProps>
