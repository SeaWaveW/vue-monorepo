import type { UploadMultipleEmits } from './types'

const extraUploadMultipleEmits = ['success'] as const satisfies readonly (keyof UploadMultipleEmits)[]

export const multipleUploadEmits: Array<keyof UploadMultipleEmits> = [
	...extraUploadMultipleEmits,
]
