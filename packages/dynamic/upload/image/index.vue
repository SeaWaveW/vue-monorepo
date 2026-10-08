<template>
	<SacoUpload
		v-loading="loading"
		class="saco-upload-image"
		:class="{ 'is-preview': !!fileUrl }"
		:style="{ '--upload-image-radius': radiusCss }"
		:files="files"
		:multiple="false"
		:folder="false"
		v-bind="bindProps"
		@update:files="onPickerFiles"
	>
		<div class="saco-upload-image__container">
			<template v-if="fileUrl">
				<img
					class="saco-upload-image__preview"
					:src="fileUrl"
					:alt="fileName || ''"
				/>
				<SacoSvg
					v-if="!disabled && !loading"
					name="close"
					class="saco-upload-image__delete"
					:title="t('delete_file')"
					@click.stop="deleteFile"
				/>
			</template>
			<template v-else>
				<label
					class="saco-upload-image__title"
					:class="{ 'asterisk-required': props.required }"
				>
					{{ displayTitle }}
				</label>
				<div class="saco-upload-image__icon-box">
					<SacoSvg
						name="antOutline-cloud-upload"
						class="saco-upload-image__icon"
					/>
				</div>
				<p class="saco-upload-image__tips">{{ fileTips }}</p>
			</template>
		</div>
	</SacoUpload>
</template>
<script lang="ts" setup generic="P = any" name="DynamicUploadImage">
import {
	computed,
	nextTick,
	onBeforeUnmount,
	onMounted,
	ref,
	watch,
} from 'vue'
import { useI18n } from 'vue-i18n'
import SacoLoading from '@saco/ui/es/components/loading'
import { SacoMessage } from '@saco/ui/es/components/message'
import { SacoSvg } from '@saco/ui/es/components/svg'
import { SacoUpload } from '@saco/ui/es/components/upload'
import { imageUploadEmits } from './emits'
import { imageUploadProps } from './props'
import type { UploadSuccessHandler } from '../single/types'
import {
	FILE_SIZE_NUMBER,
	fileDetection,
	numberToSizeUnit,
	aTagDownload,
} from '../../../utils/file'
import {
	aliOss,
	isOssAbortError,
	isOssNetworkError,
} from '../../../axios/ali-oss'
const fileName = defineModel<string>('fileName', { default: '' })
const vLoading = SacoLoading.directive
/** 与 UploadImageProps.fileUrl 可选一致；默认空串，业务 avatarUrl 可为 undefined */
const fileUrl = defineModel<string>('fileUrl', { default: '' })
const loading = defineModel<boolean>('loading', { default: false })

const props = defineProps(imageUploadProps)
/** 同 DynamicUploadSingle：emit 用运行时名单，泛型 P 见 types.d.ts */
const emit = defineEmits(imageUploadEmits)
const { t } = useI18n()
const disabled = computed(() => props.disabled)
const bindProps = computed(() => {
	const {
		size,
		fileName,
		fileUrl,
		radius,
		title,
		required,
		params,
		...rest
	} = props
	return {
		...rest,
		size: size * FILE_SIZE_NUMBER,
		...(loading.value
			? {
					disabled: true,
					drag: false,
					paste: false,
				}
			: {}),
	}
})

const snapshotParams = (): P | undefined => props.params as P | undefined

const notifyLoading = (value: boolean, runParams: P | undefined) => {
	emit('update:loading', value, runParams)
}

const radiusCss = computed(() => {
	const r = props.radius
	if (typeof r === 'number' && Number.isFinite(r) && r >= 0) return `${r}px`
	if (typeof r === 'string' && r.trim()) return r
	return '8px'
})

const displayTitle = computed(() => props.title || t('upload_image'))

const files = ref<File[]>([])
let activeUploadAbort: AbortController | null = null

const runUploadFile = async (
	file: File,
	explicitParams?: P,
	onSuccess?: UploadSuccessHandler<P>,
) => {
	const runParams = explicitParams ?? snapshotParams()
	const flag = fileDetection(
		file,
		props.accept,
		props.size * FILE_SIZE_NUMBER,
	)
	if (!flag) {
		return
	}
	if (!onSuccess && loading.value) {
		return
	}
	activeUploadAbort?.abort()
	const runAbort = new AbortController()
	activeUploadAbort = runAbort
	notifyLoading(true, runParams)
	await nextTick()
	try {
		const result = await aliOss.upload(file, {
			signal: runAbort.signal,
		})
		emit('update:fileName', file.name, runParams)
		emit('update:fileUrl', result.url, runParams)
		onSuccess?.(
			{ fileName: file.name, fileUrl: result.url },
			runParams,
		)
		files.value = []
	} catch (error) {
		if (isOssAbortError(error) || isOssNetworkError(error)) {
			return
		}
		SacoMessage.error(t('any_upload_failed', [displayTitle.value]))
	} finally {
		if (activeUploadAbort === runAbort) {
			activeUploadAbort = null
		}
		if (!runAbort.signal.aborted) {
			notifyLoading(false, runParams)
		}
	}
}

const onPickerFiles = (fileList: File[]) => {
	const file = fileList[0]
	if (!file) {
		return
	}
	void onUpdateFiles(file, snapshotParams())
}

const onUpdateFiles = async (file: File, params?: P) => {
	await runUploadFile(file, params)
}

const exposeUpload = async (
	file: File,
	params?: P,
	onSuccess?: UploadSuccessHandler<P>,
) => {
	await runUploadFile(file, params, onSuccess)
}

const readSlotConfig = () => ({
	upload: exposeUpload,
	accept: props.accept?.length ? [...props.accept] : undefined,
	title: props.title,
})

const syncUploadMounted = () => {
	emit('mounted', readSlotConfig(), snapshotParams())
}

onMounted(() => {
	syncUploadMounted()
})
watch(() => props.params, syncUploadMounted)
watch(
	() => [props.accept, props.title] as const,
	syncUploadMounted,
)
onBeforeUnmount(() => {
	activeUploadAbort?.abort()
	emit('mounted', null, snapshotParams())
})

const fileTips = computed(() => {
	const accept = props.accept?.join('、')
	return `${t('control_upload_tips')}，${accept}。>${numberToSizeUnit(props.size * FILE_SIZE_NUMBER)}`
})
const deleteFile = () => {
	files.value = []
	fileName.value = ''
	fileUrl.value = ''
}

defineExpose({
	upload: exposeUpload,
})
</script>
<style lang="scss" src="./style.scss" />
