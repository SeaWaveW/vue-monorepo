/** 锥形收到任务上的时长。PC 和触控端同一段。稍长一点，起步那一帧才不顿 */
const COLLAPSE_MS = 520
/** 竖条越多锥边越顺；每条是弹窗的一列，靠近任务的列先变窄 */
const CONE_SLICE_COUNT = 24
/** 触控端少一半竖条。边仍走同一套收尖，图层少才不掉帧 */
const TOUCH_SLICE_COUNT = 16
/** 内存不超过 4GB，或逻辑核不超过 4。再少一半，收尖公式不变 */
const LOW_SLICE_COUNT = 8
/** 关键帧落在收尖公式上。密一点，第一段位移小，帧间仍是直线补间 */
const COLLAPSE_FRAME_COUNT = 17

interface CollapseOptions {
	getTaskId: () => string
	getRecordId: () => number
	isOpen: () => boolean
	/** 开始收：停详情轮询、停播报 */
	onStart: () => void
	/** 锥收到任务上：关窗。原弹窗保持隐藏，避免闪回整窗 */
	onDone: () => void
}

interface ConeRect {
	left: number
	top: number
	width: number
	height: number
}

interface ConeSlice {
	el: HTMLElement
	bandW: number
	bandX: number
}

const clamp01 = (value: number) => {
	return Math.max(0, Math.min(1, value))
}

/**
 * srcU 0 是弹窗左边、1 是右边。
 * 朝向任务的那一侧先位移、先变矮，另一侧还宽着，轮廓才是锥。
 */
const readConeSample = (
	t: number,
	srcU: number,
	from: ConeRect,
	to: ConeRect,
	tipIsLeft: boolean,
) => {
	const u = tipIsLeft ? srcU : 1 - srcU
	// 远端以前要等过一段才动，近端先飞出外框，整块会先变大，点下去像顿一下才开始收
	// 远端从 t=0 就收，近端仍更快（0.58 时先到）。中段两边的进度差和原来一样
	const lead = clamp01(t / 0.58)
	const trail = clamp01(t)
	const pull = trail + (lead - trail) * (1 - u) ** 1.2
	const srcX = from.left + srcU * from.width
	const dstX =
		to.left + to.width * (tipIsLeft ? 0.2 + u * 0.6 : 0.8 - u * 0.6)
	const x = srcX + (dstX - srcX) * pull
	const srcCy = from.top + from.height / 2
	const dstCy = to.top + to.height / 2
	const cy = srcCy + (dstCy - srcCy) * pull
	const h = from.height + (to.height - from.height) * pull
	const bow = Math.sin(srcU * Math.PI) * Math.sin(clamp01(t) * Math.PI) * 16
	const hh = Math.max(2, h - bow)
	return { x, y: cy - hh / 2, h: hh }
}

const readConeRect = (rect: DOMRect): ConeRect => {
	return {
		left: rect.left,
		top: rect.top,
		width: rect.width,
		height: rect.height,
	}
}

/**
 * 已落库对记录 id；还在草稿对钉住的 uniqueId。
 * 对不上且侧栏只有一条审核中，就飞到那条；多条时不猜，落到任务栏卡片。
 */
const readCollapseTarget = (taskId: string, recordId: number) => {
	const items = Array.from(
		document.querySelectorAll<HTMLElement>('.task-item'),
	)
	if (recordId) {
		const reviewId = String(recordId)
		const byId = items.find((el) => el.dataset.reviewId === reviewId)
		if (byId) {
			return byId
		}
	}
	const byUnique = items.find((el) => el.dataset.taskUniqueId === taskId)
	if (byUnique) {
		return byUnique
	}
	const afoot = items.filter((el) => el.classList.contains('is-afoot'))
	if (afoot.length === 1) {
		return afoot[0]
	}
	const panel = document.querySelector('.task-list')
	if (panel instanceof HTMLElement) {
		return panel
	}
	return null
}

/** 平板 / 手机浏览器是 h5，套壳是 app。pc 和桌面 pwa 用 24 条 */
const isTouchClient = () => {
	const type = document.documentElement.getAttribute('data-device-type')
	return type === 'h5' || type === 'app'
}

interface NavigatorWithMemory extends Navigator {
	deviceMemory?: number
}

/** Chrome 才有 deviceMemory。没有时看核数，4 核及以下按低配少切 */
const isLowSpec = () => {
	const nav: NavigatorWithMemory = navigator
	const memory = nav.deviceMemory
	if (typeof memory === 'number' && memory > 0 && memory <= 4) {
		return true
	}
	const cores = nav.hardwareConcurrency
	return cores > 0 && cores <= 4
}

const readSliceCount = () => {
	if (isLowSpec()) {
		return LOW_SLICE_COUNT
	}
	return isTouchClient() ? TOUCH_SLICE_COUNT : CONE_SLICE_COUNT
}

const readDialog = () => {
	const dialogEl = document.querySelector(
		'.review-progress-dialog:not(.is-cone-slice)',
	)
	if (!(dialogEl instanceof HTMLElement)) {
		return null
	}
	return dialogEl
}

/** 每帧只改 transform。改 left / width 会触发布局，锥形会一卡一卡 */
const readSliceTransform = (
	slice: ConeSlice,
	t: number,
	from: ConeRect,
	to: ConeRect,
	tipIsLeft: boolean,
) => {
	const srcU0 = slice.bandX / from.width
	const srcU1 = (slice.bandX + slice.bandW) / from.width
	const start = readConeSample(t, srcU0, from, to, tipIsLeft)
	const end = readConeSample(t, srcU1, from, to, tipIsLeft)
	const mid = readConeSample(t, (srcU0 + srcU1) / 2, from, to, tipIsLeft)
	const width = Math.abs(end.x - start.x) + 1
	const scaleX = width / slice.bandW
	const scaleY = mid.h / from.height
	const left = Math.min(start.x, end.x)
	return `translate3d(${left}px, ${mid.y}px, 0) scale(${scaleX}, ${scaleY})`
}

const placeConeSlices = (
	slices: ConeSlice[],
	t: number,
	from: ConeRect,
	to: ConeRect,
	tipIsLeft: boolean,
) => {
	for (const slice of slices) {
		slice.el.style.transform = readSliceTransform(
			slice,
			t,
			from,
			to,
			tipIsLeft,
		)
	}
}

/** 把收尖公式采样成关键帧。主线程不再逐帧改样式 */
const buildCollapseAnimations = (
	slices: ConeSlice[],
	mask: HTMLElement | null,
	from: ConeRect,
	to: ConeRect,
	tipIsLeft: boolean,
) => {
	const anims: Animation[] = []
	const lastFrame = COLLAPSE_FRAME_COUNT - 1
	for (const slice of slices) {
		const keyframes: Keyframe[] = []
		for (let index = 0; index < COLLAPSE_FRAME_COUNT; index += 1) {
			const t = index / lastFrame
			keyframes.push({
				transform: readSliceTransform(slice, t, from, to, tipIsLeft),
				offset: t,
			})
		}
		anims.push(
			slice.el.animate(keyframes, {
				duration: COLLAPSE_MS,
				easing: 'linear',
				fill: 'forwards',
			}),
		)
	}
	// 遮罩跟着收起淡出。直接关掉模糊时，左缘有一段底色盖不住，会成一条白
	if (mask) {
		anims.push(
			mask.animate(
				[
					{ opacity: 1, offset: 0 },
					{ opacity: 0, offset: 1 },
				],
				{
					duration: COLLAPSE_MS,
					easing: 'linear',
					fill: 'forwards',
				},
			),
		)
	}
	return anims
}

/** 克隆出来的节点仍带着进度条 transition !important。行内 important 才能压过 scoped */
const freezeMotion = (root: HTMLElement) => {
	const nodes = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]
	for (const node of nodes) {
		node.style.setProperty('animation', 'none', 'important')
		node.style.setProperty('transition', 'none', 'important')
	}
}

/** 把弹窗切成竖条铺回原位；原弹窗先藏起来，避免和竖条叠两层 */
const buildConeLayer = (dialogEl: HTMLElement, from: ConeRect) => {
	const layer = document.createElement('div')
	layer.className = 'review-collapse-cone'
	// 触控端裁切不能和竖条的 transform 写在同一层，否则整窗叠住
	const touch = isTouchClient()
	if (touch) {
		layer.classList.add('is-touch')
	}
	const maskEl = dialogEl.closest('.review-progress-dialog-mask')
	const maskZ = maskEl ? Number(getComputedStyle(maskEl).zIndex) : 2000
	layer.style.zIndex = String((Number.isFinite(maskZ) ? maskZ : 2000) + 1)
	const sliceCount = readSliceCount()
	// 正文左右是空的弹窗底色。切进去会先飞到屏幕左边，变成一条和弹窗同色的竖条
	const bodyEl = dialogEl.querySelector('.saco-dialog__body')
	let padL = 0
	let padR = 0
	if (bodyEl instanceof HTMLElement) {
		const bodyStyle = getComputedStyle(bodyEl)
		padL = Number.parseFloat(bodyStyle.paddingLeft) || 0
		padR = Number.parseFloat(bodyStyle.paddingRight) || 0
	}
	const sliceSpan = Math.max(from.width - padL - padR, 1)
	const bandW = sliceSpan / sliceCount
	const slices: ConeSlice[] = []
	for (let index = 0; index < sliceCount; index += 1) {
		const slice = document.createElement('div')
		slice.className = 'review-collapse-cone__slice'
		slice.style.width = `${bandW}px`
		slice.style.height = `${from.height}px`
		const cloned = dialogEl.cloneNode(true)
		if (!(cloned instanceof HTMLElement)) {
			continue
		}
		cloned.classList.add('is-cone-slice')
		cloned.style.width = `${from.width}px`
		cloned.style.height = `${from.height}px`
		cloned.style.minHeight = '0'
		cloned.style.margin = '0'
		cloned.style.left = '0'
		cloned.style.top = '0'
		cloned.style.visibility = 'visible'
		freezeMotion(cloned)
		const bandX = padL + index * bandW
		cloned.style.transform = `translate3d(${-bandX}px, 0, 0)`
		// 电脑竖条自己裁。内层再裁时，左缘会多出一条没被遮罩盖住的底色
		if (touch) {
			const clip = document.createElement('div')
			clip.className = 'review-collapse-cone__clip'
			clip.append(cloned)
			slice.append(clip)
		} else {
			slice.append(cloned)
		}
		layer.append(slice)
		slices.push({
			el: slice,
			bandW,
			bandX,
		})
	}
	document.body.append(layer)
	dialogEl.style.visibility = 'hidden'
	if (maskEl instanceof HTMLElement) {
		maskEl.classList.add('is-collapsing')
		maskEl.style.opacity = '1'
	}
	return {
		layer,
		slices,
		maskEl: maskEl instanceof HTMLElement ? maskEl : null,
	}
}

/** 收起到任务栏：关键帧播完收到对应任务再关 */
export const useReviewCollapse = (options: CollapseOptions) => {
	let collapsing = false
	let collapseAnims: Animation[] = []
	let collapseLayer: HTMLElement | undefined
	let collapseMask: HTMLElement | null = null

	const restoreDialog = () => {
		const dialogEl = readDialog()
		if (dialogEl) {
			dialogEl.style.visibility = ''
		}
		if (collapseMask) {
			collapseMask.style.opacity = ''
			collapseMask.style.visibility = ''
			collapseMask.style.backdropFilter = ''
			collapseMask.classList.remove('is-collapsing')
		}
		collapseMask = null
	}

	const clear = (restore: boolean) => {
		const anims = collapseAnims
		collapseAnims = []
		for (const anim of anims) {
			if (anim.playState === 'finished') {
				continue
			}
			anim.cancel()
		}
		collapseLayer?.remove()
		collapseLayer = undefined
		collapsing = false
		if (restore) {
			restoreDialog()
			return
		}
		collapseMask = null
	}

	const start = () => {
		if (!options.isOpen() || collapsing) {
			return
		}
		options.onStart()
		const dialogEl = readDialog()
		const targetEl = readCollapseTarget(
			options.getTaskId(),
			options.getRecordId(),
		)
		if (!dialogEl || !targetEl) {
			options.onDone()
			return
		}
		targetEl.scrollIntoView({ block: 'nearest', inline: 'nearest' })
		const from = readConeRect(dialogEl.getBoundingClientRect())
		const to = readConeRect(targetEl.getBoundingClientRect())
		if (!from.width || !from.height || !to.width || !to.height) {
			options.onDone()
			return
		}
		const tipIsLeft = to.left + to.width / 2 <= from.left + from.width / 2
		const cone = buildConeLayer(dialogEl, from)
		collapseLayer = cone.layer
		collapseMask = cone.maskEl
		placeConeSlices(cone.slices, 0, from, to, tipIsLeft)
		collapsing = true
		collapseAnims = buildCollapseAnimations(
			cone.slices,
			collapseMask,
			from,
			to,
			tipIsLeft,
		)
		for (const anim of collapseAnims) {
			anim.finished.catch(() => {})
		}
		const lead = collapseAnims[0]
		if (!lead) {
			clear(false)
			options.onDone()
			return
		}
		lead.finished
			.then(() => {
				if (!collapsing) {
					return
				}
				clear(false)
				options.onDone()
			})
			.catch(() => {})
	}

	return {
		start,
		clear,
	}
}
