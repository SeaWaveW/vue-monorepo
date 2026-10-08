<template>
	<div class="layout-menu-tree">
		<div class="tools-box">
			<img :src="logo" alt="logo" />
			<SacoSvg
				v-if="userStore.accessibleMenu.length"
				class="layout-menu-tree__toggle"
				:class="{ 'is-collapsed': settingStore.isMenuCollapsed }"
				:name="
					settingStore.isMenuCollapsed
						? 'iconPark-expand-left'
						: 'iconPark-expand-right'
				"
				@click="
					settingStore.setMenuCollapsed(!settingStore.menuCollapsed)
				"
			/>
		</div>
		<div class="tree-scroll">
			<div class="tree-box">
				<div class="tree-item" @click="openTab('/home')">
					<label>{{ t('home_title') }}</label>
				</div>
				<div class="tree-line" />
			</div>
			<div
				v-for="item in collectList"
				:key="item.id"
				class="tree-box"
				:class="{
					'is-drag-enter': enterItem?.id === item.id,
					'is-drag-over': dragItem?.id === item.id,
				}"
				@dragenter="handleDragEnter($event, item)"
				@dragover="handleDragOver"
				@drop="handleDrop"
			>
				<div class="tree-item" @click="handleClick(item)">
					<label>{{ item[getNavigationLocaleName(locale)] }}</label>
					<SacoSvg
						class="layout-menu-tree__drag"
						name="iconPark-drag"
						draggable="true"
						@click.stop
						@dragstart="handleDragStart($event, item)"
						@dragend="handleDragEnd"
					/>
				</div>
				<!-- 缝算在本项热区里，最后一项不占 8px -->
				<div class="tree-line" />
			</div>
		</div>
	</div>
</template>
<script lang="ts" setup name="LayoutMenuTree">
import { computed, onUnmounted, ref, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { SacoSvg } from '@saco/ui/es/components/svg'
import { useUserStore, useSettingStore } from '../../store'
import { getNavigationLocaleName } from '../../i18n/navigation-locale'
import { useLayoutMenu } from '../utils/menuContext'
import type { LayoutMenuRecord, OpenTab } from '../types'

const props = defineProps({
	openTab: {
		type: Function as PropType<OpenTab>,
		required: true,
	},
})
const userStore = useUserStore()
const settingStore = useSettingStore()
const { t, locale } = useI18n()
const { logo, favorite } = useLayoutMenu()
const collectList = computed({
	get: (): LayoutMenuRecord[] => {
		return userStore.collectMenu as LayoutMenuRecord[]
	},
	set: (menu: LayoutMenuRecord[]) => {
		userStore.setCollectMenu(menu)
	},
})
const dragItem = ref<LayoutMenuRecord | null>(null)
const enterItem = ref<LayoutMenuRecord | null>(null)
const sortLoading = ref(false)
/** 只从图标起拖，松手后 click 会冒到行上，有过拖拽就不要开页 */
const hasDragged = ref(false)
/** 自绘预览：原生 setDragImage 会被浏览器压成半透明，看起来像没拖 */
let dragGhost: HTMLElement | null = null
let ghostOffsetX = 0
let ghostOffsetY = 0
/** 1×1 透明图，卸页时必须跟幽灵一起摘，否则会留在 body */
let blankEl: HTMLCanvasElement | null = null
let blankRaf = 0
let hasDraggedRaf = 0

const moveDragGhost = (event: DragEvent) => {
	if (!dragGhost) return
	dragGhost.style.left = `${event.clientX - ghostOffsetX}px`
	dragGhost.style.top = `${event.clientY - ghostOffsetY}px`
}

const clearBlank = () => {
	if (blankRaf) {
		cancelAnimationFrame(blankRaf)
		blankRaf = 0
	}
	blankEl?.remove()
	blankEl = null
}

const clearDragGhost = () => {
	clearBlank()
	document.removeEventListener('dragover', moveDragGhost)
	dragGhost?.remove()
	dragGhost = null
}

const handleClick = (item: LayoutMenuRecord) => {
	if (hasDragged.value || sortLoading.value) return
	props.openTab(item.pagePath ?? '')
}

const handleDragStart = (event: DragEvent, item: LayoutMenuRecord) => {
	if (sortLoading.value) {
		event.preventDefault()
		return
	}
	hasDragged.value = true
	dragItem.value = item
	enterItem.value = item
	// Firefox 不写 setData 时后续 dragover / drop 不会进
	event.dataTransfer?.setData('text/plain', String(item.id))
	if (event.dataTransfer) {
		event.dataTransfer.effectAllowed = 'move'
		const row = (event.currentTarget as HTMLElement | null)?.closest(
			'.tree-item',
		)
		if (row instanceof HTMLElement) {
			clearDragGhost()
			const rect = row.getBoundingClientRect()
			ghostOffsetX = event.clientX - rect.left
			ghostOffsetY = event.clientY - rect.top
			// 1×1 透明图顶掉浏览器自带的半透明残影
			const blank = document.createElement('canvas')
			blank.width = 1
			blank.height = 1
			blank.style.cssText = 'position:fixed;left:0;top:0;opacity:0'
			document.body.appendChild(blank)
			blankEl = blank
			event.dataTransfer.setDragImage(blank, 0, 0)
			blankRaf = requestAnimationFrame(() => {
				blankRaf = 0
				blankEl?.remove()
				blankEl = null
			})
			const ghost = row.cloneNode(true) as HTMLElement
			// 挂 body，吃不到 scoped，样式必须写在行内
			ghost.style.cssText = [
				'position:fixed',
				'z-index:4000',
				'display:flex',
				'align-items:center',
				'justify-content:space-between',
				`width:${rect.width}px`,
				`height:${rect.height}px`,
				'padding:0 calc(var(--common-gap) * 1.6)',
				'pointer-events:none',
				'border-radius:8px',
				'outline:1px solid var(--primary-color)',
				'box-shadow:0 8px 24px var(--grey-color-8)',
				'font-size:var(--font-size)',
				'color:var(--black-color)',
				'backdrop-filter: blur(3px)',
				// 必须加，不然影响幽灵图
				'user-select: auto',
			].join(';')
			const label = ghost.querySelector('label')
			if (label instanceof HTMLElement) {
				label.style.flex = '1'
				label.style.overflowX = 'hidden'
				label.style.overflowY = 'clip'
				label.style.lineHeight = '1em'
				label.style.marginBottom = '0.2em'
				label.style.whiteSpace = 'nowrap'
				label.style.textOverflow = 'ellipsis'
			}
			document.body.appendChild(ghost)
			dragGhost = ghost
			moveDragGhost(event)
			document.addEventListener('dragover', moveDragGhost)
		}
	}
}

const handleDragOver = (event: DragEvent) => {
	event.preventDefault()
	if (event.dataTransfer) {
		event.dataTransfer.dropEffect = 'move'
	}
}

const handleDragEnter = (event: DragEvent, item: LayoutMenuRecord) => {
	event.preventDefault()
	if (!dragItem.value) return
	// 含拖回自身：enter 回到起点则松手不算换位
	enterItem.value = item
}

const handleDrop = (event: DragEvent) => {
	// 不 preventDefault 时部分浏览器会把 drop 当打开链接
	event.preventDefault()
}

/** 用接口顺序盖收藏树；PC / tablet 不会互踢，对面可能刚改过 */
const refreshCollectMenu = () => {
	return favorite.list().then((res) => {
		userStore.setCollectMenu(res.data || [])
	})
}

const handleDragEnd = () => {
	clearDragGhost()
	const from = dragItem.value
	const to = enterItem.value
	dragItem.value = null
	enterItem.value = null
	// click 在 dragend 之后，下一帧再清，避免松手误开页
	if (hasDraggedRaf) {
		cancelAnimationFrame(hasDraggedRaf)
	}
	hasDraggedRaf = requestAnimationFrame(() => {
		hasDraggedRaf = 0
		hasDragged.value = false
	})
	// 没进过其它项、或又拖回自己：下标没变，不打排序
	if (!from || !to || from.id === to.id || sortLoading.value) return
	const list = collectList.value.slice()
	const fromIndex = list.findIndex((row) => row.id === from.id)
	const toIndex = list.findIndex((row) => row.id === to.id)
	if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return
	const [moved] = list.splice(fromIndex, 1)
	list.splice(toIndex, 0, moved)
	collectList.value = list
	sortLoading.value = true
	favorite
		.sort({
			navigationIds: list.map((row) => row.id),
		})
		.then(
			() => refreshCollectMenu(),
			() => refreshCollectMenu(),
		)
		.finally(() => {
			sortLoading.value = false
		})
}

onUnmounted(() => {
	if (hasDraggedRaf) {
		cancelAnimationFrame(hasDraggedRaf)
		hasDraggedRaf = 0
	}
	clearDragGhost()
})
</script>
<style scoped lang="scss">
.layout-menu-tree {
	$item-gap: calc(var(--common-gap) * 0.8);

	--tree-item-width: 240px;

	display: flex;
	flex-shrink: 0;
	flex-direction: column;
	align-self: stretch;
	min-width: calc(var(--tree-item-width) + var(--aside-gap) * 2);
	height: 100%;
	min-height: 0;
	padding: 0 var(--aside-gap) var(--asize-y-gap);
	overflow: hidden;

	.tools-box {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: var(--layout-header-height);
		padding: 0 calc(var(--common-gap) * 1.6);

		img {
			width: auto;
			height: 72px;
			margin-top: calc(var(--common-gap) * -0.5);
			margin-left: calc(var(--common-gap) * -1.6);
			object-fit: contain;
		}

		.layout-menu-tree__toggle {
			font-size: 24px;
			cursor: pointer;

			&.is-collapsed {
				color: var(--black-color);
			}
		}
	}

	.tree-scroll {
		flex: 1 1 0;
		min-height: 0;
		overflow-x: hidden;

		@include overflow-y-hover;
	}

	.tree-box {
		display: flex;
		flex-shrink: 0;
		flex-direction: column;
		width: var(--tree-item-width);

		.tree-line {
			flex-shrink: 0;
			height: $item-gap;
		}

		&:last-child .tree-line {
			display: none;
		}

		&.is-drag-over .tree-item {
			.layout-menu-tree__drag {
				cursor: grabbing;
			}
		}

		&.is-drag-enter:not(.is-drag-over) .tree-item {
			background-color: var(--main-color-8);
		}
	}

	.tree-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 45px;
		padding: 0 calc(var(--common-gap) * 1.6);
		cursor: pointer;
		border-radius: 8px;

		label {
			@include line-clamp(1);

			flex: 1;
			font-size: var(--font-size);
			color: var(--black-color);
			cursor: pointer;
		}

		.layout-menu-tree__drag {
			font-size: var(--font-size);
			color: var(--grey-color-8);
			cursor: grab;
		}

		&:hover {
			background-color: var(--white-color);
		}
	}
}
</style>
