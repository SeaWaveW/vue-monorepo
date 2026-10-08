import type { ComponentItem, DynamicUploadSlotConfig } from '#/dynamic'
import { useComponentStore } from '#/store'
import { readUploadMapKey } from './context'
import type { AiReviewUploadSessionParams } from './types'
import type { UseDynamicInput } from './types'

/** 动态表单：loading 三表、formModel / formRules */
export function useDynamic(input: UseDynamicInput) {
	const { t } = useI18n()
	const store = useAiReviewControlStore()
	const componentStore = useComponentStore()
	const { formKeys, currentAgent } = input

	/** 按 formKeys：批量文件夹映射阶段 loading */
	let batchLoadingMap = reactive<Record<string, boolean>>({})
	/** 按 formKeys：映射命中的 upload uniqueId，OSS 完成前保留 uploadMap */
	let batchSentinelMap = reactive<Record<string, number[]>>({})
	/** 按 formKeys → uniqueId：单格 OSS loading */
	let uploadLoadingMap = reactive<Record<string, Record<number, boolean>>>({})
	/** 键 formKeys_uniqueId：mount 登记的 upload 闭包 */
	let uploadMap: Record<
		string,
		DynamicUploadSlotConfig<AiReviewUploadSessionParams>
	> = {}

	/** 当前 tab 批量区是否 mapping/loading */
	const batchLoading = computed(() => batchLoadingMap[formKeys.value])
	/** 当前 tab 各 upload uniqueId 的 loading 表 */
	const uploadLoading = computed(() => uploadLoadingMap[formKeys.value] ?? {})

	/** 哨兵列表里任一格仍在上传时，禁用其它 upload / 批量重复点 */
	const batchDisabled = computed(() => {
		const sentinelList = batchSentinelMap[formKeys.value]
		return sentinelList?.some((uniqueId) => uploadLoading.value[uniqueId])
	})

	/** 批量文件夹映射阶段整区 loading（DynamicUploadMultiple） */
	const setBatchLoading = (key: string, loading: boolean) => {
		batchLoadingMap[key] = loading
	}

	/** 映射命中的 upload uniqueId 列表，OSS 分发完成前保留 uploadMap */
	const setBatchSentinels = (key: string, uniqueIds: number[]) => {
		batchSentinelMap[key] = [...uniqueIds]
	}

	/** 批量结束，去掉哨兵以便 upload 卸载时可删 map 项 */
	const clearBatchSentinels = (key: string) => {
		delete batchSentinelMap[key]
	}

	/** 单格 upload OSS 中状态，供 :loading 与 batchDisabled */
	const updateLoading = (key: string, uniqueId: number, loading: boolean) => {
		uploadLoadingMap[key] ??= {}
		uploadLoadingMap[key][uniqueId] = loading
	}

	/** 读某 formKeys 下指定 uniqueId 是否在上传 */
	const readUploadLoading = (key: string, uniqueId: number) => {
		return uploadLoadingMap[key]?.[uniqueId]
	}

	/** 登记或摘除 uploadMap；卸载 null 时 batch/哨兵进行中不删 */
	const patchUploadMap = (
		formKeys: string,
		uniqueId: number,
		config: DynamicUploadSlotConfig<AiReviewUploadSessionParams> | null,
	) => {
		const mapKey = readUploadMapKey(formKeys, uniqueId)
		if (config) {
			uploadMap[mapKey] = config
			return
		}
		/** 映射 / 分发进行中保留条目，切 agent 卸组件后 batch 仍能调 upload */
		if (batchLoadingMap[formKeys]) {
			return
		}
		const sentinels = batchSentinelMap[formKeys]
		if (sentinels?.includes(uniqueId)) {
			return
		}
		delete uploadMap[mapKey]
	}

	/** 取已 mount 的 upload 闭包与 accept，供 dispatchUpload */
	const readUploadMapEntry = (formKeys: string, uniqueId: number) => {
		return uploadMap[readUploadMapKey(formKeys, uniqueId)]
	}

	/** 合并当前 agent 下已登记 upload 的 accept，给批量区限制类型 */
	const readUploadMapAccept = (formKeys: string) => {
		const prefix = `${formKeys}_`
		const scanned = Object.keys(uploadMap).reduce<{
			open: boolean
			accept: Set<string>
		}>(
			(bucket, mapKey) => {
				if (!bucket.open || !mapKey.startsWith(prefix)) {
					return bucket
				}
				const listed = uploadMap[mapKey].accept
				if (!listed?.length) {
					bucket.open = false
					return bucket
				}
				listed.reduce((accept, suffix) => {
					accept.add(suffix)
					return accept
				}, bucket.accept)
				return bucket
			},
			{ open: true, accept: new Set<string>() },
		)
		if (!scanned.open) {
			return []
		}
		return [...scanned.accept]
	}

	/** 开始审核按钮：当前 tab 批量或任一单格 upload 进行中 */
	const isAnyUploading = computed(() => {
		if (batchLoading.value) return true
		return Object.values(uploadLoading.value).some((loading) => loading)
	})

	onBeforeUnmount(() => {
		batchLoadingMap = reactive({})
		batchSentinelMap = reactive({})
		uploadLoadingMap = reactive({})
		uploadMap = {}
	})

	/** 当前 Agent 动态表单 schema 项 */
	const components = computed(() => currentAgent.value?.components ?? [])

	/** 表单栅格列数 proportion */
	const proportion = computed(() => currentAgent.value?.proportion)

	/** 当前 formKeys 桶，供 SacoForm :model */
	const formModel = computed(() => store.dataMap[formKeys.value] ?? {})

	/** 表单项主校验字段在 modelBind 里的 key，用于 prop 与 validateField */
	const readModelField = (item: ComponentItem) => {
		const modelBind = item.modelBind ?? {}
		const modelKey = item.modelKey
		if (modelKey) {
			const mapped = modelBind[modelKey]
			if (mapped) return mapped
		}
		const keys = Object.keys(modelBind)
		if (!keys.length) return undefined
		return modelBind[keys[0]]
	}

	/** SacoFormItem :prop，形如 `uniqueId.fieldKey` */
	const itemProp = (item: ComponentItem) => {
		if (item.uniqueId == null) return undefined
		const fieldKey = readModelField(item)
		if (!fieldKey) return String(item.uniqueId)
		return `${item.uniqueId}.${fieldKey}`
	}

	/** 由 components 必填项生成的 SacoForm :rules */
	const formRules = computed(() =>
		components.value.reduce<Record<string, RulesItem[]>>((rules, item) => {
			const prop = itemProp(item)
			if (!prop || !item.required) return rules
			const title = item.title ?? ''
			const type = item.type
			const name = item.name
			const message =
				type === 'upload'
					? t('validate_please_upload_any', [title])
					: type === 'select' ||
						  type === 'radio' ||
						  type === 'checkbox' ||
						  name === 'DynamicSelect' ||
						  name === 'DynamicRadio'
						? t('validate_please_select_any', [title])
						: t('validate_please_enter_any', [title])
			rules[prop] = [
				{
					required: true,
					message,
					...(type === 'upload' ? { trigger: 'blur' as const } : {}),
				},
			]
			return rules
		}, {}),
	)

	/** 部分 Dynamic* 不渲染外层标题（common 配置） */
	const hideTitle = (item: ComponentItem) => {
		return componentStore.notTitles.includes(item.name!)
	}

	return {
		batchLoading,
		batchDisabled,
		setBatchLoading,
		setBatchSentinels,
		clearBatchSentinels,
		updateLoading,
		readUploadLoading,
		patchUploadMap,
		readUploadMapEntry,
		readUploadMapAccept,
		isAnyUploading,
		components,
		proportion,
		formModel,
		formRules,
		hideTitle,
		itemProp,
		readModelField,
	}
}
