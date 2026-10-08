import type { UploadSingleEmits } from './types'

const extraUploadSingleEmits = [
	'update:fileName',
	'update:fileUrl',
	'update:loading',
	'mounted',
] as const satisfies readonly (keyof UploadSingleEmits)[]

export const singleUploadEmits: Array<keyof UploadSingleEmits> = [
	...extraUploadSingleEmits,
]
