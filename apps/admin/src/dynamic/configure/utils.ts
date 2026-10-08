import type { InjectionKey, Ref } from 'vue'
import type { ComponentItem } from '#/dynamic'

/**
 * 配置区 SacoForm 下发给子项的校验入口。
 * 跟 `FormExpose.validateField` 对齐，库签名变了只改这里。
 */
export type ConfigureFormRef = Pick<FormExpose, 'validateField'>

/** provide / inject 共用，子项不要再写字符串 key */
export const configureFormRefKey: InjectionKey<ConfigureFormRef> =
	Symbol('configureFormRef')

/** 子项取配置区表单校验 */
export const useConfigureForm = () => inject(configureFormRefKey)

/** 单段转大驼峰（仅保留字母数字） */
const toPascalSegment = (raw: string): string => {
	const clean = raw.replace(/[^a-zA-Z0-9]/g, '')
	if (!clean) return ''
	// 禁止数字开头，避免非法标识
	const base = /^[0-9]/.test(clean) ? `N${clean}` : clean
	return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase()
}

/** 拉丁串按分隔拆成大驼峰片段 */
const pushLatinWords = (segments: string[], latin: string) => {
	for (const word of latin.split(/[\s_-]+/)) {
		const part = toPascalSegment(word)
		if (part) segments.push(part)
	}
}

/**
 * title → id（统一大驼峰）
 * - 中文：拼音音节拼接，如 性别 → XingBie
 * - 英文：去空白/分隔后大驼峰，如 user name → UserName
 * - 其它语言（韩/日等）：音译拉丁后再大驼峰，如 여자 → Yeoja
 */
export const titleToId = async (title: string): Promise<string> => {
	const text = title.trim()
	if (!text) return ''

	const segments: string[] = []
	// 汉字 / 拉丁数字 / 其它字母（韩文、假名等）
	const chunks = text.match(/[\u4e00-\u9fff]+|[a-zA-Z0-9]+|\p{L}+/gu) || []

	for (const chunk of chunks) {
		if (/[\u4e00-\u9fff]/.test(chunk)) {
			// 词典 280KB+，只在转中文 title 时再拉，不要跟配置页打成同步依赖
			const { pinyin } = await import('pinyin-pro')
			const syllables = pinyin(chunk, {
				toneType: 'none',
				type: 'array',
				v: true,
			}) as string[]
			for (const syllable of syllables) {
				const part = toPascalSegment(syllable)
				if (part) segments.push(part)
			}
		} else if (/^[a-zA-Z0-9]+$/.test(chunk)) {
			const part = toPascalSegment(chunk)
			if (part) segments.push(part)
		} else {
			// 韩语等：先音译成拉丁，再按词拼大驼峰；182KB，只在非中英时拉
			const { transliterate } = await import('transliteration')
			pushLatinWords(segments, transliterate(chunk))
		}
	}

	return segments.join('')
}

const ID_DEBOUNCE_MS = 300

/**
 * 监听 component.title，写入 id（切组件不触发）
 * 当前：title 原样当 id。后续要转拼音/音译时，把 nextId 改回 await titleToId(titleValue)
 */
export const useTitleId = (component: Ref<ComponentItem | null>) => {
	let idSyncTimer: ReturnType<typeof setTimeout> | null = null
	let idSyncToken = 0

	const clearIdSyncTimer = () => {
		if (!idSyncTimer) return
		clearTimeout(idSyncTimer)
		idSyncTimer = null
	}

	watch(
		() => [component.value?.uniqueId, component.value?.title] as const,
		([uniqueId, title], prev) => {
			// 切组件 / 首次挂载：只取消未完成任务，不写 id
			if (uniqueId !== prev?.[0]) {
				idSyncToken += 1
				clearIdSyncTimer()
				return
			}

			clearIdSyncTimer()
			const token = ++idSyncToken
			const titleValue = title || ''
			idSyncTimer = setTimeout(() => {
				idSyncTimer = null
				if (token !== idSyncToken) return
				if (!component.value || component.value.uniqueId !== uniqueId) {
					return
				}
				// 先不做转换：title 是什么，id 就是什么
				const nextId = titleValue
				if ((component.value.id || '') === nextId) return
				component.value = {
					...component.value,
					id: nextId,
				}
			}, ID_DEBOUNCE_MS)
		},
	)

	onBeforeUnmount(() => {
		idSyncToken += 1
		clearIdSyncTimer()
	})
}
