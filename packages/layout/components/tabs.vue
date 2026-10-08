<template>
	<div
		class="layout-tabs"
		:class="{ 'is-overflow': isOverflow }"
		@pointerdown="onTabsPointerDown"
		@contextmenu="openTabMenu"
	>
		<button
			v-show="isOverflow"
			type="button"
			class="layout-tabs__prev"
			:class="{ 'is-twinkle': canScrollLeft }"
			:disabled="!canScrollLeft"
			@click="scrollTabs(-1)"
		>
			<SacoSvg class="layout-tabs__arrow" name="arrow-left" />
		</button>
		<div class="layout-tabs__scroll">
			<div
				ref="viewportRef"
				class="layout-tabs__viewport"
				:class="{
					'is-fade-left': canScrollLeft,
					'is-fade-right': canScrollRight,
				}"
				@scroll="syncScrollState"
			>
				<SacoTabs
					sortable
					bar-fit="item"
					:model-value="routerStore.active"
					@tab-change="routerStore.switchCache(($event as string))"
					@tab-sort="onTabSort"
				>
					<SacoTabPane
						v-for="item in routerStore.tabs"
						:key="item.path"
						:name="item.path"
						:draggable="item.name !== homeName"
					>
						<template #label>
							{{ tabTitle(item) }}
							<SacoSvg
								v-if="item.name !== homeName"
								class="layout-tabs__close"
								name="outline-close"
								@click.stop="routerStore.delCache(item.path)"
							/>
						</template>
					</SacoTabPane>
				</SacoTabs>
			</div>
		</div>
		<button
			v-show="isOverflow"
			type="button"
			class="layout-tabs__next"
			:class="{ 'is-twinkle': canScrollRight }"
			:disabled="!canScrollRight"
			@click="scrollTabs(1)"
		>
			<SacoSvg class="layout-tabs__arrow" name="arrow-right" />
		</button>
		<div class="right-menu" :style="menuStyle">
			<SacoDropdown
				ref="menuRef"
				trigger="click"
				placement="bottom-start"
				popper-class="right-menu-popper"
				@command="onCommand"
			>
				<span />
				<template #dropdown>
					<SacoDropdownMenu>
						<SacoDropdownItem
							v-if="showCloseOther"
							command="closeOther"
						>
							{{ t('close_other_tab') }}
						</SacoDropdownItem>
						<SacoDropdownItem
							v-if="contextTab?.name !== homeName"
							command="close"
						>
							{{ t('close') }}
						</SacoDropdownItem>
						<SacoDropdownItem
							v-if="contextTab?.path === routerStore.active"
							command="refresh"
						>
							{{ t('refresh') }}
						</SacoDropdownItem>
					</SacoDropdownMenu>
				</template>
			</SacoDropdown>
		</div>
	</div>
</template>
<script lang="ts" setup name="CommonLayoutTabs">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { SacoSvg } from '@saco/ui/es/components/svg'
import { SacoTabs } from '@saco/ui/es/components/tabs'
import { SacoTabPane } from '@saco/ui/es/components/tab-pane'
import { SacoDropdown } from '@saco/ui/es/components/dropdown'
import { SacoDropdownItem } from '@saco/ui/es/components/dropdown-item'
import { SacoDropdownMenu } from '@saco/ui/es/components/dropdown-menu'
import { SacoMessage } from '@saco/ui/es/components/message'
import type { DropdownExpose } from '@saco/ui'
import { useRouterStore, resolveCacheTitle, type RouterCache } from '../../store'

const { t } = useI18n()
const router = useRouter()
const routerStore = useRouterStore()
const menuRef = ref<DropdownExpose>()
const contextTab = ref<RouterCache>()
const menuStyle = ref({ left: '0px', top: '0px' })
const viewportRef = ref<HTMLElement>()
const isOverflow = ref(false)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const homeName = computed(() => routerStore.homeRoute.name)
/** 一次约翻一屏，太小要点很多次 */
const SCROLL_RATIO = 0.7
/**
 * 按住多久出菜单。和系统长按同一档，手机才不会先弹出「复制」。
 * 鼠标右键不走这里，仍由 contextmenu 打开。
 */
const LONG_PRESS_MS = 500
/**
 * 和页签起拖的位移同一档（tabs 里是 6）。
 * 没挪开就当长按；一拖就把菜单收掉，否则平板拖着菜单还挂着。
 */
const PRESS_MOVE_PX = 6
let overflowObserver: ResizeObserver | undefined
/** 卸掉后 nextTick 还会 bindOverflowObserver / 绑 wheel，为 false 就不再建 */
let alive = true
/** 长按计时；挪开或松手要清，否则拖拽中途还会弹出菜单 */
let longPressTimer = 0
let pressAt = 0
let pressX = 0
let pressY = 0
let pressTarget: EventTarget | null = null
/** 菜单是否已经打开；拖拽时用来决定要不要收 */
let menuOpen = false
/** 拖拽作废还没执行的 nextTick 打开，否则菜单会在拖起来之后又弹出来 */
let menuTicket = 0
let pressListening = false

const tabTitle = (item: RouterCache) => resolveCacheTitle(item.meta)

const onTabSort = (from: string | number, to: string | number) => {
	routerStore.sortCache(String(from), String(to))
}

const syncScrollState = () => {
	const viewport = viewportRef.value
	if (!viewport) {
		isOverflow.value = false
		canScrollLeft.value = false
		canScrollRight.value = false
		return
	}
	const { scrollLeft, clientWidth, scrollWidth } = viewport
	const overflow = scrollWidth - clientWidth > 1
	isOverflow.value = overflow
	canScrollLeft.value = overflow && scrollLeft > 1
	canScrollRight.value =
		overflow && scrollLeft + clientWidth < scrollWidth - 1
	// 关到不再溢出时滚回起点，否则会留一截空白
	if (!overflow && scrollLeft) viewport.scrollLeft = 0
}

const scrollTabs = (dir: -1 | 1) => {
	const viewport = viewportRef.value
	if (!viewport) return
	const distance = Math.max(viewport.clientWidth * SCROLL_RATIO, 80)
	viewport.scrollBy({ left: dir * distance, behavior: 'smooth' })
}

const scrollActiveIntoView = () => {
	const viewport = viewportRef.value
	const active = viewport?.querySelector<HTMLElement>(
		'.saco-tabs__item.is-active',
	)
	if (!viewport || !active) return
	const viewRect = viewport.getBoundingClientRect()
	const tabRect = active.getBoundingClientRect()
	// 给内凹耳留空，贴边裁切会切掉谷歌页签两耳
	const pad = 12
	if (tabRect.left < viewRect.left + pad) {
		viewport.scrollBy({
			left: tabRect.left - viewRect.left - pad,
			behavior: 'smooth',
		})
		return
	}
	if (tabRect.right > viewRect.right - pad) {
		viewport.scrollBy({
			left: tabRect.right - viewRect.right + pad,
			behavior: 'smooth',
		})
	}
}

const onViewportWheel = (event: WheelEvent) => {
	if (!isOverflow.value) return
	const delta =
		Math.abs(event.deltaX) > Math.abs(event.deltaY)
			? event.deltaX
			: event.deltaY
	if (!delta) return
	// 竖滑也改成横移，否则滚轮落在页签上没反应
	event.preventDefault()
	viewportRef.value?.scrollBy({ left: delta })
}

const bindOverflowObserver = () => {
	overflowObserver?.disconnect()
	overflowObserver = undefined
	if (!alive) {
		return
	}
	const viewport = viewportRef.value
	if (!viewport || typeof ResizeObserver === 'undefined') return
	overflowObserver = new ResizeObserver(() => {
		syncScrollState()
	})
	overflowObserver.observe(viewport)
	const nav = viewport.querySelector('.saco-tabs__nav')
	if (nav instanceof HTMLElement) overflowObserver.observe(nav)
}

watch(
	() => [routerStore.active, routerStore.tabs.length] as const,
	() => {
		nextTick(() => {
			if (!alive) {
				return
			}
			bindOverflowObserver()
			syncScrollState()
			scrollActiveIntoView()
		})
	},
)

const getTabItem = (target: EventTarget | null) => {
	if (!(target instanceof Element)) return
	const itemEl = target.closest('.saco-tabs__item')
	if (!(itemEl instanceof HTMLElement)) return
	const path = itemEl.dataset.name
	if (!path) return
	return routerStore.tabs.find((item) => item.path === path)
}

const clearLongPress = () => {
	if (!longPressTimer) return
	window.clearTimeout(longPressTimer)
	longPressTimer = 0
}

const unbindPressWatch = () => {
	if (!pressListening) return
	pressListening = false
	window.removeEventListener('pointermove', onPressMove)
	window.removeEventListener('pointerup', onPressEnd)
	window.removeEventListener('pointercancel', onPressCancel)
}

const closeTabMenu = () => {
	// 先作废排队中的打开，再关。只看 menuOpen 的话，拖拽发生在 nextTick 之前，菜单仍会弹出
	menuTicket += 1
	menuOpen = false
	menuRef.value?.handleClose()
}

const openTabMenuAt = (
	clientX: number,
	clientY: number,
	target: EventTarget | null,
) => {
	const tab = getTabItem(target)
	if (!tab) return false
	contextTab.value = tab
	menuStyle.value = {
		left: `${clientX}px`,
		top: `${clientY}px`,
	}
	const ticket = (menuTicket += 1)
	menuRef.value?.handleClose()
	nextTick(() => {
		if (!alive || ticket !== menuTicket) return
		menuRef.value?.handleOpen()
		menuOpen = true
	})
	return true
}

const openTabMenu = (e: MouseEvent) => {
	// 不拦的话手机长按仍会出系统「复制」，盖住这个菜单
	if (!openTabMenuAt(e.clientX, e.clientY, e.target)) return
	e.preventDefault()
}

const onPressMove = (e: PointerEvent) => {
	const moved = Math.hypot(e.clientX - pressX, e.clientY - pressY)
	if (moved < PRESS_MOVE_PX) return
	// 还没到时间就动了：这是拖，不要再弹出菜单
	clearLongPress()
	closeTabMenu()
}

const onPressEnd = () => {
	clearLongPress()
	unbindPressWatch()
}

const onPressCancel = () => {
	const pending = longPressTimer !== 0
	clearLongPress()
	// 系统复制框会把这次按住取消掉。按够长才改出页签菜单，滚动打断的不算
	if (pending && Date.now() - pressAt >= LONG_PRESS_MS) {
		openTabMenuAt(pressX, pressY, pressTarget)
	}
	unbindPressWatch()
}

const onTabsPointerDown = (e: PointerEvent) => {
	// 鼠标右键交给 contextmenu，再计时会和右键菜单抢一次
	if (e.pointerType === 'mouse') return
	if (!getTabItem(e.target)) return
	clearLongPress()
	pressAt = Date.now()
	pressX = e.clientX
	pressY = e.clientY
	pressTarget = e.target
	if (!pressListening) {
		pressListening = true
		window.addEventListener('pointermove', onPressMove)
		window.addEventListener('pointerup', onPressEnd)
		window.addEventListener('pointercancel', onPressCancel)
	}
	longPressTimer = window.setTimeout(() => {
		longPressTimer = 0
		openTabMenuAt(pressX, pressY, pressTarget)
	}, LONG_PRESS_MS)
}

const showCloseOther = computed(() => {
	return (
		(contextTab.value?.path === routerStore.homePath &&
			routerStore.tabs.length > 1) ||
		(contextTab.value?.path !== routerStore.homePath &&
			routerStore.tabs.length > 2)
	)
})

const onCommand = (command: unknown) => {
	const path = contextTab.value?.path
	if (!path) return
	if (command === 'closeOther') {
		routerStore.closeOtherCache(path)
		return
	}
	if (command === 'close') {
		routerStore.delCache(path)
		return
	}
	if (command !== 'refresh') return
	router.replace(path).then(() => {
		SacoMessage.success(t('router_refresh_successful'))
	})
}

onMounted(() => {
	nextTick(() => {
		if (!alive) {
			return
		}
		bindOverflowObserver()
		syncScrollState()
		// 非 passive 才能 preventDefault，模板 @wheel 默认 passive 拦不住
		viewportRef.value?.addEventListener('wheel', onViewportWheel, {
			passive: false,
		})
	})
})

onBeforeUnmount(() => {
	alive = false
	clearLongPress()
	unbindPressWatch()
	overflowObserver?.disconnect()
	overflowObserver = undefined
	viewportRef.value?.removeEventListener('wheel', onViewportWheel)
})
</script>
<style scoped lang="scss">
.layout-tabs {
	display: flex;
	flex: 1;
	align-items: center;

	// 不写会跟着页签内容撑开中间栏，永远测不出溢出
	min-width: 0;

	// 内凹圆角伸出 item，根上不能 hidden，裁切交给 viewport
	overflow: visible;
	user-select: none;

	// 这两个都不继承。只写在根上，手机长按页签文字仍能选中并弹出「复制」
	-webkit-touch-callout: none;

	:deep(.saco-tabs__item),
	:deep(.saco-tabs__item *) {
		-webkit-touch-callout: none;
		user-select: none;
	}

	// 内凹半径，跟顶圆角接近才像 Chrome
	$tab-curve: 12px;

	// 缝至少等于耳宽，滑动底在 item 下层时耳才不会被邻项挡住
	$tab-gap: $tab-curve;
	$tab-radius: 10px;

	// 页签文字底填充；箭头上移一半才跟视觉中线齐
	$tab-item-pad-bottom: calc(var(--common-gap) / 2);

	// 溢出边缘淡出宽度；用 mask 糊边，避免蒙层盒子切掉谷歌页签圆角
	$tab-fade-width: 80px;

	.layout-tabs__prev,
	.layout-tabs__next {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		padding: 0;
		line-height: 1;
		cursor: pointer;
		background-color: transparent;
		border: none;
		border-radius: 4px;
		transform: translateY(calc(#{$tab-item-pad-bottom} * -0.5));

		.layout-tabs__arrow {
			font-size: var(--svg-size);
			color: var(--black-color-1);

			// 点到图标也算点按钮
			pointer-events: none;
		}

		&:not(:disabled) {
			// &:hover {
			background-color: var(--white-color);

			// }
		}

		&:disabled {
			cursor: not-allowed;

			.layout-tabs__arrow {
				color: var(--grey-color-5);
			}
		}

		// 还能往这边滚才呼吸；留白底，主色闪太抢所以不加
		&.is-twinkle {
			color: var(--black-color);

			.layout-tabs__arrow {
				color: inherit;
			}

			animation: var(--twinkle-animation);
		}
	}

	.layout-tabs__scroll {
		position: relative;
		flex: 1;
		min-width: 0;

		.layout-tabs__viewport {
			// hidden 才能 scrollLeft；蒙层盒子会切圆角，改 mask 淡出
			overflow: hidden;

			&.is-fade-left {
				mask-image: linear-gradient(
					to right,
					transparent,
					var(--black-color) $tab-fade-width
				);
			}

			&.is-fade-right {
				mask-image: linear-gradient(
					to left,
					transparent,
					var(--black-color) $tab-fade-width
				);
			}

			&.is-fade-left.is-fade-right {
				mask-image: linear-gradient(
					to right,
					transparent,
					var(--black-color) $tab-fade-width,
					var(--black-color) calc(100% - #{$tab-fade-width}),
					transparent
				);
			}
		}
	}

	:deep(.saco-tabs) {
		// 跟着页签 Intrinsic 宽，viewport 才能 scrollWidth > clientWidth
		width: max-content;
		overflow: visible;

		// 布局页签只画 label，pane 内容在 LayoutMain
		.saco-tabs__content {
			display: none;
		}

		.saco-tabs__header {
			width: max-content;
			margin-bottom: 0;
			overflow: visible;
			border-bottom: none;

			.saco-tabs__nav {
				// 默认 flex:1 会缩进视口，item 被压窄就溢不出来
				flex: none;
				column-gap: $tab-gap;
				width: max-content;

				// 首尾 ::before/::after 各伸出一截，要留空位
				padding: 0 $tab-curve;
				overflow: visible;
			}

			// 外形画在滑动条上，item 只留文字；条必须在文字下面
			.saco-tabs__active-bar {
				z-index: 0;
				background-color: var(--layout-header-tabs-bg-color);
				border-radius: $tab-radius $tab-radius 0 0;

				&::before,
				&::after {
					position: absolute;
					bottom: 0;
					width: $tab-curve;
					height: $tab-curve;
					pointer-events: none;
					content: '';

					// 透明圆切掉外上角，剩下页签色就是内凹衔接
				}

				&::before {
					left: -$tab-curve;
					background: radial-gradient(
						circle at 0 0,
						transparent $tab-curve,
						var(--layout-header-tabs-bg-color)
							calc(#{$tab-curve} + 0.5px)
					);
				}

				&::after {
					right: -$tab-curve;
					background: radial-gradient(
						circle at 100% 0,
						transparent $tab-curve,
						var(--layout-header-tabs-bg-color)
							calc(#{$tab-curve} + 0.5px)
					);
				}
			}

			.saco-tabs__item {
				position: relative;
				z-index: 1;
				flex-shrink: 0;
				gap: calc(var(--common-gap) * 1.2);
				padding: 0 calc(var(--common-gap) * 1.6) $tab-item-pad-bottom
					calc(var(--common-gap) * 2.1);
				font-size: var(--font-size);
				font-weight: normal;
				color: var(--black-color);
				background: transparent;
				border-bottom: none;

				&.is-drag-from {
					visibility: hidden;
				}

				&.is-active {
					color: var(--black-color);
				}

				.layout-tabs__close {
					font-size: calc(var(--svg-size) - 6px);
				}
			}
		}

		// 拖当前签时滑动底一起磨砂，否则耳朵还是实心白
		&.is-drag-active .saco-tabs__active-bar {
			background-color: color-mix(
				in srgb,
				var(--layout-header-tabs-bg-color) 38%,
				transparent
			);
			backdrop-filter: blur(20px) saturate(140%);
		}

		// is-sorting 在根上；写进 header 对不上，划过仍会换色
		&:not(.is-sorting) .saco-tabs__item {
			&:not(.is-active):hover {
				color: var(--main-color);
			}

			.layout-tabs__close:hover {
				color: var(--danger-color) !important;
			}
		}
	}

	.right-menu {
		position: fixed;
		z-index: 20;
		width: 0;
		height: 0;
		overflow: hidden;
		pointer-events: none;
	}
}

// @keyframes tabs-twinkle {
// 	50% {
// 		opacity: 0.3;
// 	}
// }
</style>
<style lang="scss">
.saco-tabs__sort-ghost.saco-tabs__item:not(:has(.agent-tab)) {
	// 克隆挂 body，.layout-tabs 里的字重/颜色/间距够不着
	// 落回组件 font-weight:500 和激活主色，字会显得变大变蓝
	// 排除 .agent-tab：审核卡片幽灵自己要 18px，不能被这里的正文字号盖掉
	// --tabs-header-height 写在 .saco-tabs 上，挂出去后 line-height: var() 失效变成 normal
	--tabs-header-height: 2.5rem;

	gap: calc(var(--common-gap) * 1.2);
	padding: 0 calc(var(--common-gap) * 1.6) calc(var(--common-gap) / 2)
		calc(var(--common-gap) * 2.1);
	font-size: var(--font-size);
	font-weight: normal;
	line-height: var(--tabs-header-height);
	color: var(--black-color);

	// 审核页 .saco-tabs__sort-ghost 是全局的，white-space:normal 会把顶栏标题折成两行
	white-space: nowrap;
	background-color: color-mix(
		in srgb,
		var(--layout-header-tabs-bg-color) 38%,
		transparent
	);
	border-radius: 10px 10px 0 0;

	.layout-tabs__close {
		// 页签里把关钮收到比正文小一档；挂到 body 后会回到 1em，整行被撑大
		font-size: calc(var(--svg-size) - 6px);
	}

	&.is-active {
		// 比组件 .saco-tabs__item.is-active 多一个类，激活签才不会变主色
		color: var(--black-color);
	}
}

.right-menu-popper {
	.popper-content {
		width: 130px !important;
	}

	.saco-dropdown-item {
		font-size: var(--font-size) !important;

		// &:hover {
		// 	color: var(--white-color) !important;
		// 	background-color: var(--primary-color) !important;
		// }
	}
}
</style>
