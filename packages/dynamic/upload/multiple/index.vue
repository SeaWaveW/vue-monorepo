<template>
	<SacoUpload
		class="saco-upload-multiple"
		:files="localFiles"
		v-bind="bindProps"
		@update:files="onUpdateFiles"
	>
		<div
			v-if="props.lightEffect && loading"
			class="saco-upload-light-effect"
			aria-hidden="true"
		>
			<span class="saco-upload-light-effect__beam" />
		</div>
		<div class="upload-container">
			<SacoSvg class="saco-upload-multiple__icon" :name="displayIcon" />
			<p>{{ displayTips }}</p>
		</div>
	</SacoUpload>
</template>
<script lang="ts" setup generic="P = any" name="DynamicUploadMultiple">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SvgName } from '@saco/ui'
import { SacoMessage } from '@saco/ui/es/components/message'
import { SacoSvg } from '@saco/ui/es/components/svg'
import { SacoUpload } from '@saco/ui/es/components/upload'
import { multipleUploadEmits } from './emits'
import { multipleUploadProps } from './props'
import type { UploadMultipleFileItem } from './types'
import { FILE_SIZE_NUMBER, fileDetection } from '../../../utils/file'
import {
	aliOss,
	isOssAbortError,
	isOssNetworkError,
} from '../../../axios/ali-oss'

const files = defineModel<UploadMultipleFileItem[]>({ required: true })
/** 上传中由业务 v-model:loading 控制（如工作台 dynamic.batchLoading） */
const loading = defineModel<boolean>('loading', { default: false })

const props = defineProps(multipleUploadProps)
/** 同 DynamicUploadSingle：emit 用运行时名单，泛型 P 见 types.d.ts */
const emit = defineEmits(multipleUploadEmits)
const { t } = useI18n()

const bindProps = computed(() => {
	const {
		size,
		modelValue,
		icon,
		tips,
		title,
		lightEffect,
		beforeUpload,
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
const displayIcon = computed<SvgName>(() => props.icon || 'files')
const displayTips = computed(() => props.tips || t('folder_upload_tips'))

const localFiles = ref<File[]>([])
const uploadAbort = new AbortController()
onBeforeUnmount(() => {
	uploadAbort.abort()
})

const onUpdateFiles = async (fileList: File[]) => {
	if (loading.value) return
	const runParams = props.params as P | undefined
	const sizeLimit = props.size * FILE_SIZE_NUMBER
	const validFiles = fileList.filter((file) => {
		return fileDetection(file, props.accept, sizeLimit)
	})
	if (!validFiles.length) return
	let uploadFiles = validFiles
	if (props.beforeUpload) {
		uploadFiles = await props.beforeUpload(validFiles, runParams)
		if (!uploadFiles.length) return
	}
	loading.value = true
	try {
		const results = await Promise.all(
			uploadFiles.map(async (file) => {
				const result = await aliOss.upload(file, {
					signal: uploadAbort.signal,
				})
				return {
					name: file.name,
					url: result.url,
				}
			}),
		)
		files.value = results
		emit('success', results, runParams)
		localFiles.value = []
	} catch (error) {
		if (!isOssAbortError(error) && !isOssNetworkError(error)) {
			SacoMessage.error(t('any_upload_failed', [props.title]))
		}
	} finally {
		if (!uploadAbort.signal.aborted) {
			loading.value = false
		}
	}
}

defineExpose({
	upload: onUpdateFiles,
})
</script>
<style lang="scss" src="./style.scss" />
