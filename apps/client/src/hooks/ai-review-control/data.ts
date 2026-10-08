import type { ComponentItem, DynamicUploadSlotConfig } from '#/dynamic'
import type { UploadMultipleFileItem } from '#/dynamic/upload/multiple'
import type {
	AiReviewUploadSessionParams,
	MatchedUploadGroup,
	MatchedUploadRow,
	UseDataInput,
} from './types'
import {
	buildReviewRecordCreateData,
	pruneDataMapByTaskList,
	writeDataMapField,
} from './make'

const NONE_ACCEPT: string[] = ['.__none__']

/**
 * 当前浏览器能不能选文件夹。
 * 属性能写上不等于能选完：安卓 Chrome 115 会打开选择器，但右上角的勾确认不了目录。
 */
const supportsDirectoryUpload = () => {
	const ua = navigator.userAgent
	const isIpadDesktopUa =
		navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
	const isIos = /iP(hone|od|ad)/i.test(ua) || isIpadDesktopUa
	if (isIos) {
		// iOS 上的 Chrome / Firefox / Edge 都是系统 WebKit，看系统版本
		// 18.4 之前选不了目录
		const matched = ua.match(
			/(?:CPU (?:iPhone )?OS |Version\/)(\d+)[_.](\d+)/,
		)
		if (!matched) {
			return false
		}
		const major = Number(matched[1])
		const minor = Number(matched[2])
		if (major > 18) {
			return true
		}
		return major === 18 && minor >= 4
	}
	if (/Android|HarmonyOS/i.test(ua)) {
		const firefox = ua.match(/Firefox\/(\d+)/)
		const chrome = ua.match(/Chrome\/(\d+)/)
		// 安卓 Firefox 不带 Chrome 标记。目录选择从 153 起
		if (firefox && !chrome) {
			return Number(firefox[1]) >= 153
		}
		// Chrome、Edge、三星、Opera、华为、QQ 都带 Chrome 版本。132 起才能选完，131 会崩
		if (!chrome) {
			return false
		}
		return Number(chrome[1]) >= 132
	}
	if (/MSIE |Trident\//i.test(ua)) {
		return false
	}
	const edge = ua.match(/Edg\/(\d+)/)
	if (edge) {
		return Number(edge[1]) >= 79
	}
	const legacyEdge = ua.match(/Edge\/(\d+)/)
	if (legacyEdge) {
		return Number(legacyEdge[1]) >= 14
	}
	const firefox = ua.match(/Firefox\/(\d+)/)
	if (firefox) {
		return Number(firefox[1]) >= 50
	}
	const opera = ua.match(/OPR\/(\d+)/)
	if (opera) {
		return Number(opera[1]) >= 17
	}
	const chrome = ua.match(/Chrome\/(\d+)/)
	if (chrome) {
		return Number(chrome[1]) >= 30
	}
	const safari = ua.match(/Version\/(\d+)\.(\d+)/)
	if (safari && /Safari\//.test(ua)) {
		const major = Number(safari[1])
		const minor = Number(safari[2])
		if (major > 11) {
			return true
		}
		return major === 11 && minor >= 1
	}
	return false
}

/** 上传 emit 第二参解析写桶目标，避免切 tab 后写到当前选中 agent */
const readUploadTarget = (
	params: AiReviewUploadSessionParams | undefined,
	fallbackFormKeys: string,
	fallbackUniqueId: number,
) => ({
	formKeys: params?.formKeys ?? fallbackFormKeys,
	uniqueId: params?.uniqueId ?? fallbackUniqueId,
})

/** dataMap 写、vBind/vOn、批量文件夹 */
export function useData(input: UseDataInput) {
	const { t } = useI18n()
	const store = useAiReviewControlStore()
	const { formKeys, currentAgent, dynamic } = input

	/** 侧栏 uniqueId 组成变了才裁 dataMap；轮询只换数组引用时不要重跑 */
	watch(
		() =>
			store.taskList.reduce((key, row) => {
				if (!row.uniqueId) {
					return key
				}
				return `${key}\0${row.uniqueId}`
			}, ''),
		() => {
			store.dataMap = pruneDataMapByTaskList(
				store.dataMap,
				store.taskList,
			)
		},
		{ immediate: true },
	)

	/** 各 formKeys 批量区已选文件（DynamicUploadMultiple v-model） */
	let fileMap: Record<string, UploadMultipleFileItem[]> = {}
	/** 为 true 时 vOn 写桶不触发表单 validateField */
	const silentWrite = ref(false)
	/** agent-form 内 SacoForm 实例，批量后 validateField 用 */
	const formRef = ref<FormExpose | null>(null)

	/** 写 dataMap[formKeys][uniqueId][fieldKey] */
	const writeField = (
		key: string,
		uniqueId: number,
		fieldKey: string,
		value: any,
	) => {
		store.dataMap = writeDataMapField(
			store.dataMap,
			key,
			uniqueId,
			fieldKey,
			value,
		)
	}

	/** 组开始审核提交体，可指定 formKeys 桶 */
	const getSubmitFormData = (formKeys?: string) => {
		return buildReviewRecordCreateData(
			store.taskId,
			store.taskList,
			store.agentList,
			store.dataMap,
			formKeys,
		)
	}

	/** 切 Agent/任务前打开，避免 vOn 写桶触发 validateField */
	const beginSilentWrite = () => {
		silentWrite.value = true
	}

	/** 切 tab 完成后下一 tick 恢复校验 */
	const endSilentWrite = () => {
		nextTick(() => {
			silentWrite.value = false
		})
	}

	/** 当前 schema 里 type 为 upload 的表单项 */
	const readUploadItems = (items: ComponentItem[]) => {
		return items.filter((item) => {
			return item.type === 'upload'
		})
	}

	/** 当前 tab 批量文件夹文件列表双向绑定 */
	const batchFileFiles = computed({
		get: () => fileMap[formKeys.value] ?? [],
		set: (value) => {
			fileMap[formKeys.value] = value
		},
	})

	/** 批量区 accept：uploadMap 合并；无 upload 项时用 NONE_ACCEPT 禁止选文件 */
	const batchFileAccept = computed(() => {
		const key = formKeys.value
		const fromMap = dynamic.readUploadMapAccept(key)
		if (fromMap.length) {
			return fromMap
		}
		const items = readUploadItems(dynamic.components.value)
		if (!items.length) {
			return NONE_ACCEPT
		}
		return []
	})

	/** 映射 API 返回行 ↔ 本地 File ↔ ComponentItem */
	const readMatchedRows = <T extends { name?: string }>(
		fileList: T[],
		records: ReviewRecordMatchFileUploadComponentsRecord[],
		items: ComponentItem[],
	) => {
		const fileByName = Object.fromEntries(
			fileList.flatMap((item) => {
				return item.name ? [[item.name, item] as const] : []
			}),
		) as Record<string, T>
		const componentByKey = Object.fromEntries(
			items.flatMap((item) => {
				const pairs: [string, ComponentItem][] = []
				if (item.title) {
					pairs.push([item.title, item])
				}
				if (item.id) {
					pairs.push([item.id, item])
				}
				return pairs
			}),
		) as Record<string, ComponentItem>
		return records.flatMap((row) => {
			const fileName = row.fileName
			const uploadComponentName = row.uploadComponentName
			if (!fileName || !uploadComponentName) {
				return []
			}
			const file = fileByName[fileName]
			if (!file) {
				return []
			}
			const component = componentByKey[uploadComponentName]
			if (!component || component.uniqueId == null) {
				return []
			}
			return [{ file, component }]
		})
	}

	/** 同一 uniqueId 的多文件合并为一组，供 dispatchUpload 串行 put */
	const readMatchedGroups = (rows: MatchedUploadRow<File>[]) => {
		return rows.reduce<{
			groups: MatchedUploadGroup[]
			index: Record<number, number>
		}>(
			(bucket, row) => {
				const uniqueId = row.component.uniqueId
				if (uniqueId == null) {
					return bucket
				}
				const at = bucket.index[uniqueId]
				if (at === undefined) {
					bucket.index[uniqueId] = bucket.groups.length
					bucket.groups.push({
						uniqueId,
						files: [row.file],
						component: row.component,
					})
				} else {
					bucket.groups[at].files.push(row.file)
				}
				return bucket
			},
			{ groups: [], index: {} },
		).groups
	}

	/** 批量 onSuccess：按 modelBind 写 fileName / fileUrl 到 dataMap */
	const writeUploadResult = (
		item: ComponentItem,
		bucketFormKeys: string,
		result: { fileName: string; fileUrl: string },
		params?: AiReviewUploadSessionParams,
	) => {
		const target = readUploadTarget(
			params,
			bucketFormKeys,
			item.uniqueId ?? 0,
		)
		if (target.uniqueId == null) {
			return
		}
		const modelBind = item.modelBind ?? {}
		if (modelBind.fileName) {
			writeField(
				target.formKeys,
				target.uniqueId,
				modelBind.fileName,
				result.fileName,
			)
		}
		if (modelBind.fileUrl) {
			writeField(
				target.formKeys,
				target.uniqueId,
				modelBind.fileUrl,
				result.fileUrl,
			)
		}
	}

	/** 调 uploadMap 闭包逐个 OSS，loading 与写桶不依赖组件仍挂载 */
	const dispatchUpload = async (
		bucketFormKeys: string,
		group: MatchedUploadGroup,
	) => {
		const uniqueId = group.component.uniqueId
		if (uniqueId == null) return
		const slot = dynamic.readUploadMapEntry(bucketFormKeys, uniqueId)
		const upload = slot?.upload
		if (!upload) {
			return
		}
		const sessionParams: AiReviewUploadSessionParams = {
			formKeys: bucketFormKeys,
			uniqueId,
		}
		const item = group.component
		try {
			for (const file of group.files) {
				dynamic.updateLoading(bucketFormKeys, uniqueId, true)
				try {
					await upload(file, sessionParams, (result, params) => {
						writeUploadResult(item, bucketFormKeys, result, params)
					})
				} finally {
					dynamic.updateLoading(bucketFormKeys, uniqueId, false)
				}
			}
		} finally {
			if (bucketFormKeys === formKeys.value) {
				const item = dynamic.components.value.find((row) => {
					return row.uniqueId === uniqueId
				})
				const prop = item ? dynamic.itemProp(item) : undefined
				if (prop) {
					formRef.value?.validateField(prop)
				}
			}
		}
	}

	/** 单组 dispatch，失败 toast 表单项 title */
	const uploadMatchedGroup = async (
		group: MatchedUploadGroup,
		key: string,
	) => {
		const uniqueId = group.component.uniqueId
		if (uniqueId == null) return
		try {
			await dispatchUpload(key, group)
		} catch {
			SacoMessage.error(t('any_upload_failed', [group.component.title]))
		}
	}

	/** DynamicUploadMultiple：映射 → 哨兵 → 并行各组 OSS，返回 [] 表示不由多文件组件再 put */
	const onBeforeUpload = async (
		fileList: File[],
		params?: AiReviewUploadSessionParams,
	) => {
		const bucketFormKeys = params?.formKeys ?? formKeys.value
		const uploadItems = readUploadItems(dynamic.components.value)
		const uploadComponents = uploadItems.map((item) => {
			return {
				name: item.title!,
				description: item.description || '',
			}
		})
		const skillId = currentAgent.value?.skillId
		if (!uploadComponents.length || skillId == null) {
			return []
		}
		dynamic.setBatchLoading(bucketFormKeys, true)
		try {
			const res = await reviewRecordMatchFileUploadComponents({
				fileNames: fileList.map((file) => file.name),
				uploadComponents,
				skillId,
			})
			const records = res.data
			if (!records) {
				return []
			}
			const rows = readMatchedRows(fileList, records, uploadItems)
			const groups = readMatchedGroups(rows)
			if (!groups.length) return []
			const sentinelIds = groups.map((group) => {
				return group.uniqueId
			})
			dynamic.setBatchSentinels(bucketFormKeys, sentinelIds)
			dynamic.setBatchLoading(bucketFormKeys, false)
			await Promise.all(
				groups.map((group) => {
					return uploadMatchedGroup(group, bucketFormKeys)
				}),
			)
			return []
		} finally {
			dynamic.clearBatchSentinels(bucketFormKeys)
			dynamic.setBatchLoading(bucketFormKeys, false)
		}
	}

	/** 批量区点击拦截：未选 Agent、浏览器不能选文件夹，或映射/OSS 进行中 */
	const onGuardBatch = (e: Event) => {
		if (!currentAgent.value) {
			e.preventDefault()
			e.stopPropagation()
			SacoMessage.warning(t('validate_please_select_any', [t('agent')]))
			return
		}
		if (!supportsDirectoryUpload()) {
			e.preventDefault()
			e.stopPropagation()
			SacoMessage.warning(
				t('control_browser_version_unsupported_message'),
			)
			return
		}
		if (!dynamic.batchDisabled.value) {
			return
		}
		e.preventDefault()
		e.stopPropagation()
		SacoMessage.warning(t('control_file_uploading_no_repeat_message'))
	}

	/** 动态表单项 props：model 切片 + upload 的 params/loading/disabled */
	const vBind = (item: ComponentItem) => {
		const modelBind = item.modelBind ?? {}
		const uniqueId = item.uniqueId
		const key = formKeys.value
		const source =
			uniqueId != null ? (dynamic.formModel.value[uniqueId] ?? {}) : {}
		const modelProps = Object.keys(modelBind).reduce<
			NonNullable<ComponentItem['props']>
		>((props, bindKey) => {
			props[bindKey] = source[modelBind[bindKey]]
			return props
		}, {})
		const isUpload = item.type === 'upload'
		return {
			...item.props,
			...modelProps,
			title: item.title,
			required: item.required,
			...(isUpload && uniqueId != null
				? {
						params: {
							formKeys: key,
							uniqueId,
						} satisfies AiReviewUploadSessionParams,
						lightEffect: true,
						loading: dynamic.readUploadLoading(key, uniqueId),
						disabled:
							Boolean(item.props?.disabled) ||
							dynamic.batchDisabled.value,
					}
				: {}),
		}
	}

	/** 动态表单项事件：写 dataMap、uploadMap、单格 loading */
	const vOn = (item: ComponentItem) => {
		const modelBind = item.modelBind ?? {}
		const uniqueId = item.uniqueId
		const bucketFormKeys = formKeys.value
		const listeners: Record<string, (value: any) => void> = {}
		if (uniqueId == null) return listeners
		if (item.type === 'upload') {
			listeners['update:loading'] = (
				uploading: boolean,
				params?: AiReviewUploadSessionParams,
			) => {
				const target = readUploadTarget(
					params,
					bucketFormKeys,
					uniqueId,
				)
				dynamic.updateLoading(
					target.formKeys,
					target.uniqueId,
					uploading,
				)
			}
			listeners.mounted = (
				config: DynamicUploadSlotConfig<AiReviewUploadSessionParams> | null,
				params?: AiReviewUploadSessionParams,
			) => {
				const target = readUploadTarget(
					params,
					bucketFormKeys,
					uniqueId,
				)
				dynamic.patchUploadMap(target.formKeys, target.uniqueId, config)
			}
		}
		const modelField = dynamic.readModelField(item)
		Object.keys(modelBind).reduce((bound, bindKey) => {
			const fieldKey = modelBind[bindKey]
			if (!fieldKey) {
				return bound
			}
			listeners[`update:${bindKey}`] = (
				value: any,
				params?: AiReviewUploadSessionParams,
			) => {
				const target = readUploadTarget(
					params,
					bucketFormKeys,
					uniqueId,
				)
				writeField(target.formKeys, target.uniqueId, fieldKey, value)
				if (silentWrite.value) return
				if (target.formKeys !== formKeys.value) return
				const prop = dynamic.itemProp(item)
				if (!prop) return
				if (fieldKey !== modelField) return
				formRef.value?.validateField(prop)
			}
			return bound
		}, listeners)
		return listeners
	}

	/** 单格 upload 正在 OSS，用于 agent-form 点击拦截重复上传 */
	const isBatchUploadLocked = (uniqueId: number) => {
		return dynamic.readUploadLoading(formKeys.value, uniqueId)
	}

	onBeforeUnmount(() => {
		fileMap = {}
	})

	return {
		formRef,
		beginSilentWrite,
		endSilentWrite,
		getSubmitFormData,
		vBind,
		vOn,
		batchFileFiles,
		batchFileAccept,
		onBeforeUpload,
		onGuardBatch,
		isBatchUploadLocked,
	}
}
