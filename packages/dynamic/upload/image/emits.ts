import type { UploadImageEmits } from './types'

const extraUploadImageEmits = [
	'update:fileName',
	'update:fileUrl',
	'update:loading',
	'mounted',
] as const satisfies readonly (keyof UploadImageEmits)[]

export const imageUploadEmits: Array<keyof UploadImageEmits> = [
	...extraUploadImageEmits,
]
