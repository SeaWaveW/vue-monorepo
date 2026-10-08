/** 聚焦输入框时 iOS 会把小于 16px 的字放大整页，锁住缩放 */
const VIEWPORT =
	'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover'

/** 键盘弹起前的整页高度。缩成可视高度会被 overflow:hidden 裁掉输入框 */
let layoutWidth = 0
let layoutHeight = 0

/** 设备已经横过来，但 innerWidth 还可能被上一轮写死的宽高卡住 */
const mediaLandscape = () =>
	window.matchMedia('(orientation: landscape)').matches

const readViewport = () => {
	const root = document.documentElement
	const lockedWidth = root.style.width
	const lockedHeight = root.style.height
	// 先摘掉写死的宽高，否则转回横屏后 innerWidth 一直是竖屏
	if (lockedWidth || lockedHeight) {
		root.style.width = ''
		root.style.height = ''
	}
	let width = window.innerWidth
	let height = window.innerHeight
	const viewport = window.visualViewport
	const boxLandscape = width > height
	if (viewport && viewport.width > viewport.height === boxLandscape) {
		width = Math.round(viewport.width)
		height = Math.round(viewport.height)
	}
	// 尺寸仍停在上一向，横竖查询已经变了。不交换的话表单缩在左边，版权被裁掉
	if (mediaLandscape() !== width > height) {
		return {
			width: height,
			height: width,
		}
	}
	return { width, height }
}

/** 宽几乎不变、高度明显变矮：键盘。旋转会改横竖，不能当成键盘把高度锁回竖屏 */
const isKeyboard = (width: number, height: number) =>
	layoutWidth > 0 &&
	mediaLandscape() === layoutWidth > layoutHeight &&
	Math.abs(width - layoutWidth) < 40 &&
	height < layoutHeight - 60

/** 清掉上一轮平移。只清 #app 时，挂到 body 的下拉还停在旧坐标 */
const clearKeyboardShift = () => {
	document.body.style.transform = ''
	document.getElementById('app')?.style.removeProperty('transform')
}

const revealFocused = (visibleHeight: number) => {
	window.scrollTo(0, 0)
	clearKeyboardShift()
	const el = document.activeElement
	if (
		!(el instanceof HTMLInputElement) &&
		!(el instanceof HTMLTextAreaElement)
	) {
		return
	}
	const bottom = el.getBoundingClientRect().bottom
	// 输入框底边留在键盘上方，方便看着已输入的内容
	const shift = Math.min(0, visibleHeight - 16 - bottom)
	// 平移 body：Select 面板 Teleport 到 body，只移 #app 会把触发器挪走、面板不动
	if (shift) document.body.style.transform = `translateY(${shift}px)`
}

/** 跟当前看得见的区域对齐。用 screen 长边会比 Safari 可视区更高，页面就铺不满 */
const fitViewport = () => {
	const { width, height } = readViewport()
	if (!width || !height) return
	const root = document.documentElement
	root.style.width = `${width}px`
	if (isKeyboard(width, height)) {
		root.style.height = `${layoutHeight}px`
		revealFocused(height)
		return
	}
	layoutWidth = width
	layoutHeight = height
	root.style.height = `${height}px`
	clearKeyboardShift()
	window.scrollTo(0, 0)
}

const lockViewportScale = () => {
	const meta = document.querySelector('meta[name="viewport"]')
	if (!meta) return
	meta.setAttribute('content', VIEWPORT)
}

/** 旋转当帧 visualViewport 还是旧尺寸。平板回横屏更晚，150ms 不够 */
const fitAfterRotate = () => {
	lockViewportScale()
	fitViewport()
	requestAnimationFrame(fitViewport)
	for (const delay of [150, 400, 800]) {
		window.setTimeout(fitViewport, delay)
	}
}

const onFocusIn = () => {
	const { width, height } = readViewport()
	if (isKeyboard(width, height)) revealFocused(height)
}

if (typeof window !== 'undefined') {
	// 热更新会再执行本文件。旧的 resize 还在，会把刚改对的横屏尺寸写回竖屏
	const previous = Reflect.get(window, '__sqtFitViewport') as
		| {
				fitViewport: typeof fitViewport
				fitAfterRotate: typeof fitAfterRotate
				onFocusIn: typeof onFocusIn
		  }
		| undefined
	if (previous) {
		window.removeEventListener('resize', previous.fitViewport)
		window.removeEventListener('orientationchange', previous.fitAfterRotate)
		window.visualViewport?.removeEventListener(
			'resize',
			previous.fitViewport,
		)
		document.removeEventListener('focusin', previous.onFocusIn)
	}
	Reflect.set(window, '__sqtFitViewport', {
		fitViewport,
		fitAfterRotate,
		onFocusIn,
	})
	lockViewportScale()
	fitViewport()
	window.addEventListener('resize', fitViewport)
	window.addEventListener('orientationchange', fitAfterRotate)
	window.visualViewport?.addEventListener('resize', fitViewport)
	document.addEventListener('focusin', onFocusIn)
}
