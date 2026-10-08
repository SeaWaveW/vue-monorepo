<template>
	<SacoUpload
		class="saco-upload-single"
		:class="{ 'is-preview': props.preview }"
		:files="files"
		:multiple="false"
		:folder="false"
		v-bind="bindProps"
		@update:files="onPickerFiles"
	>
		<div
			v-if="props.lightEffect && loading"
			class="saco-upload-light-effect"
			aria-hidden="true"
		>
			<span class="saco-upload-light-effect__beam" />
		</div>
		<div class="upload-container">
			<div class="icon-box">
				<SacoSvg name="antOutline-cloud-upload" class="icon" />
			</div>
			<div class="info-box">
				<div class="field-name">
					<label
						class="text"
						:class="{ 'asterisk-required': props.required }"
					>
						{{ props.title }}
					</label>
					<SacoSvg
						v-if="fileUrl && !props.preview"
						name="success-filled"
						class="icon"
					/>
				</div>
				<div class="file-info">
					<div v-if="fileName" class="info-item">
						<div
							class="name-tips"
							:title="fileName"
							@click.stop="onFileNameClick"
						>
							<label class="text">{{ fileBaseName }}</label>
							<span class="suffix">{{ fileSuffix }}</span>
						</div>
						<SacoSvg
							v-if="!props.preview && !loading"
							name="close"
							class="icon"
							:title="t('delete_file')"
							@click.stop="deleteFile"
						/>
					</div>
					<div v-else class="info-item desc-tips">
						{{ fileTips }}
					</div>
				</div>
			</div>
		</div>
	</SacoUpload>
</template>
<script lang="ts" setup generic="P = any" name="DynamicUploadSingle">
import {
	computed,
	nextTick,
	onBeforeUnmount,
	onMounted,
	ref,
	watch,
} from 'vue'
import { useI18n } from 'vue-i18n'
import { SacoMessage } from '@saco/ui/es/components/message'
import { SacoSvg } from '@saco/ui/es/components/svg'
import { SacoUpload } from '@saco/ui/es/components/upload'
import { singleUploadEmits } from './emits'
import { singleUploadProps } from './props'
import type { UploadSuccessHandler } from './types'
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
const fileName = defineModel<string>('fileName', { required: true })
/** 与单文件 props.fileUrl 可选一致；未上传时走空串 */
const fileUrl = defineModel<string>('fileUrl', { default: '' })
/** v-model:loading；OSS 段只 emit(带 params)，由业务回写后再同步到 model */
const loading = defineModel<boolean>('loading', { default: false })

const props = defineProps(singleUploadProps)
/** setup-name 二次 compileScript 无 fs，不能 defineEmits<从 ./types 导入>；运行时名单见 emits.ts */
const emit = defineEmits(singleUploadEmits)
const { t } = useI18n()
const bindProps = computed(() => {
	const {
		size,
		fileName,
		fileUrl,
		title,
		required,
		lightEffect,
		preview,
		params,
		...rest
	} = props
	return {
		...rest,
		size: size * FILE_SIZE_NUMBER,
		...(preview || loading.value
			? {
					disabled: true,
					drag: false,
					paste: false,
				}
			: {}),
	}
})

/** 本段 OSS 开始时快照 params，全程 emit 带同一引用，不解析 formKeys */
const snapshotParams = (): P | undefined => props.params as P | undefined

/** 带 params 第二参通知业务；不在此处改 loading.value，避免无参 update 写错桶 */
const notifyLoading = (value: boolean, runParams: P | undefined) => {
	emit('update:loading', value, runParams)
}

const files = ref<File[]>([])
/** 仅中断当前这一次 put；卸载时 abort，但不影响 uploadMap 里已登记的 upload 闭包再调起新一轮 */
let activeUploadAbort: AbortController | null = null
const runUploadFile = async (
	file: File,
	explicitParams?: P,
	onSuccess?: UploadSuccessHandler<P>,
) => {
	/** OSS 全程用同一快照；批量 dispatch 显式传入，点选用 props.params */
	const runParams = explicitParams ?? snapshotParams()
	const flag = fileDetection(
		file,
		props.accept,
		props.size * FILE_SIZE_NUMBER,
	)
	if (!flag) {
		return
	}
	/** 批量带 onSuccess 时可能已卸组件，loading model 不可信 */
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
		SacoMessage.error(t('any_upload_failed', [props.title]))
	} finally {
		if (activeUploadAbort === runAbort) {
			activeUploadAbort = null
		}
		if (!runAbort.signal.aborted) {
			notifyLoading(false, runParams)
		}
	}
}

/** SacoUpload 只 emit File[]；取首项并带上当前 params */
const onPickerFiles = (fileList: File[]) => {
	const file = fileList[0]
	if (!file) {
		return
	}
	void onUpdateFiles(file, snapshotParams())
}

/** 点选 / 批量 expose 共用：第二参为写桶用的 params */
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

const nameParts = computed(() => fileName.value?.split('.') || [])
const fileBaseName = computed(() => {
	return nameParts.value.slice(0, -1).join('.')
})
const fileSuffix = computed(() => {
	const suffix = nameParts.value[nameParts.value.length - 1]
	return suffix === fileBaseName.value ? '' : `.${suffix}`
})

const fileTips = computed(() => {
	if (props.preview) {
		return t('not_uploaded')
	}
	const accept = props.accept?.join('、')
	return `${t('control_upload_tips')}，${accept}。>${numberToSizeUnit(props.size * FILE_SIZE_NUMBER)}`
})

const downloadFile = () => {
	aTagDownload(fileUrl.value ?? '', fileName.value ?? '')
}
const onFileNameClick = () => {
	downloadFile()
}
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
