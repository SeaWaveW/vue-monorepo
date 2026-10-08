<template>
	<SacoDrawer
		v-model="modelValue"
		:show-close="false"
		direction="ltr"
		custom-class="layout-aside"
		modal-class="layout-aside-modal"
	>
		<template #header>
			<Expand v-model="modelValue" />
		</template>
		<div class="menu-container">
			<MenuTree :open-tab="openTab" />
			<MenuList :open-tab="openTab" />
		</div>
	</SacoDrawer>
</template>
<script lang="ts" setup name="LayoutAside">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { SacoDrawer } from '@saco/ui/es/components/drawer'
import { SacoMessageBox } from '@saco/ui/es/components/message-box'
import Expand from '../components/expand.vue'
import MenuTree from '../components/menu-tree.vue'
import MenuList from '../components/menu-list.vue'

const router = useRouter()
const { t } = useI18n()

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false,
	},
})
const emit = defineEmits(['update:modelValue'])
const openTab = (path: string) => {
	emit('update:modelValue', false)
	// 菜单可以先挂 pagePath，页面还没进路由表时 resolve 会落到 404 的 :pathMatch
	const resolved = path ? router.resolve(path) : undefined
	if (
		!resolved?.matched.length ||
		resolved.matched.some((record) => record.path.includes(':pathMatch'))
	) {
		SacoMessageBox({
			title: t('message'),
			message: t('coming_soon_message'),
		})
		return
	}
	router.push(path)
}
const modelValue = computed({
	get: () => props.modelValue,
	set: (value: boolean) => emit('update:modelValue', value),
})
</script>
<style lang="scss" scoped>
:deep(.layout-aside) {
	width: max-content !important;
	max-height: 100%;
	background-color: var(--grey-color--14);
	box-shadow: none;

	.saco-drawer__header {
		position: relative;
		height: 0;
		padding: 0;
		overflow: unset;

		.expand-icon {
			position: absolute;
			top: 0;
			left: 100%;
			background-color: var(--grey-color--14);
			border-radius: 0 0 10px;
		}
	}

	.saco-drawer__body {
		display: flex;
		flex-direction: column;
		min-height: 0;
		padding: 0;
		overflow: hidden;
		user-select: none;
		background-color: var(--grey-color--14);

		.saco-text {
			cursor: pointer;
		}
	}
}

.menu-container {
	display: flex;
	flex: 1 1 0;
	min-height: 0;
	overflow: hidden;

	> * {
		min-height: 0;
	}
}
</style>
