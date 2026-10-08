import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { ImagePreviewProps } from './types'

export const imagePreviewProps = {
	src: {
		type: String as PropType<ImagePreviewProps['src']>,
		default: '',
	},
	alt: {
		type: String as PropType<ImagePreviewProps['alt']>,
		default: '',
	},
	radius: {
		type: [Number, String] as PropType<ImagePreviewProps['radius']>,
		default: 8,
	},
} satisfies ComponentObjectPropsOptions<ImagePreviewProps>
