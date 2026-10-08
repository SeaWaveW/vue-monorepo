<template>
	<SacoFormItem
		class="configure-proportion"
		prop="proportion"
		:label="t('element_width')"
	>
		<SacoTabs v-model="(proportion as TabPaneName)">
			<SacoTabPane
				v-for="item in proportionList"
				:key="item.value"
				:label="item.label"
				:name="item.value"
			/>
		</SacoTabs>
	</SacoFormItem>
</template>
<script lang="ts" setup name="configureProportion">
import type { ProportionItem } from '#/utils/proportion'

defineProps({
	proportionList: {
		type: Array as PropType<ProportionItem[]>,
		default: () => [],
	},
})
const proportion = defineModel<number | undefined>('proportion')
const { t } = useI18n()
</script>
<style scoped lang="scss">
.configure-proportion {
	:deep(.sqt-tabs) {
		@include tabs-scroll-border(
			$item-size: var(--proportion-sum),
			$item-height: 38px,
			$item-font-size: var(--font-size),
			$active-border-width: 5px,
			$active-border-radius: 5px
		);

		.sqt-tabs__item {
			padding: 0;
		}
	}
}
</style>
