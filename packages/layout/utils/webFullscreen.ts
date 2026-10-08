import { onBeforeUnmount, onMounted, ref } from 'vue'

/** 全屏意图，给其它页签读退出状态 */
const FULLSCREEN_KEY = 'saco-layout-fullscreen'

/** Safari 前缀：读当前全屏节点 / 退出 */
type WebkitDocument = Document & {
	webkitFullscreenElement?: Element
	webkitExitFullscreen?: () => Promise<void>
}

/** Safari 前缀：申请全屏 */
type WebkitElement = HTMLElement & {
	webkitRequestFullscreen?: () => Promise<void>
}

/**
 * 跨页签同步退出全屏。
 * 进入全屏必须当前页用户手势，不能代其它页签申请（会警告且失败）。
 */
export const layoutFullscreenChannel =
	typeof BroadcastChannel !== 'undefined'
		? new BroadcastChannel('sqt_layout_fullscreen')
		: null

/** 标准 API 没有再回退 webkit */
const fullscreenEl = (doc: Document) => {
	const webkitDoc = doc as WebkitDocument
	return doc.fullscreenElement ?? webkitDoc.webkitFullscreenElement
}

/** 当前文档是否处于浏览器全屏 */
export const isDocumentFullscreen = (doc: Document = document) => {
	return Boolean(fullscreenEl(doc))
}

/** 对元素申请全屏 */
const requestFs = (el: HTMLElement) => {
	const webkitEl = el as WebkitElement
	const request = el.requestFullscreen ?? webkitEl.webkitRequestFullscreen
	if (!request) {
		return Promise.resolve()
	}
	return Promise.resolve(request.call(el))
}

/** 退出当前文档全屏 */
const exitFs = (doc: Document) => {
	const webkitDoc = doc as WebkitDocument
	const exit = doc.exitFullscreen ?? webkitDoc.webkitExitFullscreen
	if (!exit) {
		return Promise.resolve()
	}
	return Promise.resolve(exit.call(doc))
}

/** 进入全屏；已在全屏则跳过 */
export const enterFullscreen = (doc: Document = document) => {
	if (isDocumentFullscreen(doc)) {
		return Promise.resolve()
	}
	return requestFs(doc.documentElement).catch(() => undefined)
}

/** 退出全屏；未全屏则跳过 */
export const exitFullscreen = (doc: Document = document) => {
	if (!isDocumentFullscreen(doc)) {
		return Promise.resolve()
	}
	return exitFs(doc).catch(() => undefined)
}

/** 写入意图并通知其它页签（true 进入 / false 退出） */
export const persistFullscreen = (on: boolean) => {
	localStorage.setItem(FULLSCREEN_KEY, on ? '1' : '0')
	layoutFullscreenChannel?.postMessage(on)
}

export interface UseWebFullscreenOptions {
	/** 其它页签退出全屏时跟着退出，仅 layout 根组件开 */
	sync?: boolean
}

/**
 * 全屏开关。
 * `sync` 只给 layout 开：ESC / 其它页签退出时同步退出，不代申请进入。
 */
export const useWebFullscreen = (options: UseWebFullscreenOptions = {}) => {
	const isFullscreen = ref(isDocumentFullscreen())

	/** 只能在点击图标等用户手势里调用 */
	const toggleFullscreen = async () => {
		if (isDocumentFullscreen()) {
			await exitFullscreen()
		} else {
			await enterFullscreen()
		}
		persistFullscreen(isDocumentFullscreen())
		isFullscreen.value = isDocumentFullscreen()
	}

	/** ESC 或系统退出时同步状态；layout 再广播给其它页签 */
	const onChange = () => {
		const on = isDocumentFullscreen()
		isFullscreen.value = on
		if (options.sync) {
			persistFullscreen(on)
		}
	}

	onMounted(() => {
		document.addEventListener('fullscreenchange', onChange)
		document.addEventListener('webkitfullscreenchange', onChange)
	})
	onBeforeUnmount(() => {
		document.removeEventListener('fullscreenchange', onChange)
		document.removeEventListener('webkitfullscreenchange', onChange)
	})

	if (options.sync) {
		// 只处理退出：其它页签发 false 时跟着退；true 不能在这里 requestFullscreen
		const onMessage = (event: MessageEvent<boolean>) => {
			if (!event.data) {
				void exitFullscreen()
			}
		}

		onMounted(() => {
			layoutFullscreenChannel?.addEventListener('message', onMessage)
		})
		onBeforeUnmount(() => {
			layoutFullscreenChannel?.removeEventListener('message', onMessage)
		})
	}

	return { isFullscreen, toggleFullscreen }
}
