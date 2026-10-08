<template>
	<div
		class="layout-menu-item"
		:class="{
			['level-' + props.level]: true,
			'is-collect': isCollect,
			'no-children': noChildren,
			'no-grandson': noGrandson,
			'is-disabled': starLoading,
		}"
	>
		<div class="menu-item-title" @click="handleTitleClick">
			<label>{{ displayName }}</label>
			<SacoSvg
				v-if="noChildren"
				class="layout-menu-item__star"
				name="md-star"
				@click.stop="handleStarClick"
			/>
		</div>
		<div v-if="!noChildren" class="menu-item-content">
			<LayoutMenuItem
				v-for="child in props.data.children"
				:key="child.id"
				:data="child"
				:level="props.level + 1"
				:collect-ids="collectIds"
				:open-tab="props.openTab"
			/>
		</div>
	</div>
</template>
<script lang="ts" setup name="LayoutMenuItem">
import { computed, ref, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { SacoSvg } from '@saco/ui/es/components/svg'
import { SacoMessage } from '@saco/ui/es/components/message'
import { useUserStore } from '../../store'
import { getNavigationLocaleName } from '../../i18n/navigation-locale'
import { useLayoutMenu } from '../utils/menuContext'
import type { LayoutMenuRecord, OpenTab } from '../types'

import LayoutMenuItem from './menu-item.vue'

const props = defineProps({
	level: {
		type: Number,
		default: 0,
	},
	data: {
		type: Object as PropType<LayoutMenuRecord>,
		default: () => ({}),
	},
	collectIds: {
		type: Array as PropType<LayoutMenuRecord['id'][]>,
		default: () => [],
	},
	openTab: {
		type: Function as PropType<OpenTab>,
		required: true,
	},
})
const { t, locale } = useI18n()
const userStore = useUserStore()
const { favorite } = useLayoutMenu()
const displayName = computed(() => {
	return props.data[getNavigationLocaleName(locale.value)]
})
const isCollect = computed(() => {
	return props.collectIds.includes(props.data.id)
})
/** 无子项 */
const noChildren = computed(() => {
	return !props.data.children?.length
})
/** 下代全是叶子才纵向排；任一子项还有 children 则保持横向展开 */
const noGrandson = computed(() => {
	const children = props.data.children
	if (!children?.length) return false
	return children.every((child) => !child.children?.length)
})

const handleTitleClick = () => {
	if (!noChildren.value) return
	props.openTab(props.data.pagePath ?? '')
}

const starLoading = ref(false)
const handleStarClick = () => {
	if (starLoading.value) return
	starLoading.value = true
	if (isCollect.value) {
		favorite
			.delete(props.data.id)
			.then(() => {
				SacoMessage.success(t('unsubscribed_successfully'))
				const collectMenu = userStore.collectMenu.filter((item) => {
					return item.id !== props.data.id
				})
				userStore.setCollectMenu(collectMenu)
			})
			.finally(() => {
				starLoading.value = false
			})
	} else {
		favorite
			.create({
				navigationId: props.data.id,
			})
			.then(() => {
				SacoMessage.success(t('collect_successfully'))
				userStore.setCollectMenu([...userStore.collectMenu, props.data])
			})
			.finally(() => {
				starLoading.value = false
			})
	}
}
</script>
<style scoped lang="scss">
.layout-menu-item {
	display: flex;
	flex-direction: column;
	gap: calc(var(--common-gap) * 0.4) calc(var(--common-gap) * 2.9);

	.menu-item-title {
		display: flex;
		gap: var(--common-gap);
		align-items: center;
		justify-content: space-between;
		width: var(--menu-item-width);
		height: 45px;
		padding: 0 calc(var(--common-gap) * 2);
		border-radius: 8px;

		label {
			@include line-clamp(1);

			flex: 1;
			font-size: var(--font-size);
			color: var(--black-color);
		}

		.layout-menu-item__star {
			font-size: 16px;
			color: var(--grey-color-10);
			cursor: pointer;
		}
	}

	$item-y-gap: calc(var(--common-gap) * 0.4);

	.menu-item-content {
		display: flex;
		gap: $item-y-gap 0;
	}

	&.level-0,
	&.level-1 {
		> .menu-item-title {
			padding: 0;
		}
	}

	&.level-0 {
		> .menu-item-title {
			label {
				font-size: calc(var(--font-size) + 4px);
			}
		}

		> .menu-item-content {
			gap: $item-y-gap calc(var(--common-gap) * 2.9);
		}
	}

	&.level-1 {
		> .menu-item-title {
			label {
				font-size: calc(var(--font-size) + 2px);
			}
		}
	}

	&.no-children {
		> .menu-item-title {
			cursor: pointer;

			label {
				cursor: pointer;
			}

			&:hover {
				background-color: var(--white-color);
			}
		}
	}

	&.is-collect {
		> .menu-item-title {
			.layout-menu-item__star {
				color: var(--main-color-4);
			}
		}
	}

	&.is-disabled {
		> .menu-item-title {
			.layout-menu-item__star {
				cursor: not-allowed;
			}
		}
	}

	&.no-grandson {
		.menu-item-content {
			flex-direction: column;
		}
	}
}
</style>
