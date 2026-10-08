<template>
	<div
		class="expand-search"
		:class="{ 'is-expand': modelValue, 'is-twinkle': isTwinkle }"
		@click="toggleValue"
	>
		{{ modelValue ? t('collapse_search') : t('expand_search') }}
		<SacoSvg class="expand-search__icon" name="ze-arrow-down" />
	</div>
</template>
<script lang="ts" setup name="LayoutSearch">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { SacoSvg } from '@saco/ui/es/components/svg'
const { t } = useI18n()
const modelValue = defineModel<boolean>('modelValue', {
	default: true,
})
const props = defineProps<{
	twinkle?: boolean
}>()
/** 展开时表单已可见，只在收起后提醒还有筛选 */
const isTwinkle = computed(() => !!props.twinkle && !modelValue.value)
const toggleValue = () => {
	modelValue.value = !modelValue.value
}
</script>
<style scoped lang="scss">
.expand-search {
	display: flex;
	gap: calc(var(--common-gap) / 2);
	align-items: center;
	padding: 0 var(--common-gap);
	font-size: var(--font-size);
	color: var(--black-color);
	cursor: pointer;
	user-select: none;

	.expand-search__icon {
		margin-top: calc(var(--common-gap) * 0.2);
		font-size: var(--svg-size);
		transform: rotate(0);
		transition: transform 0.3s ease-in-out;
	}

	&.is-expand {
		.expand-search__icon {
			transform: rotate(180deg);
		}
	}

	&.is-twinkle {
		animation: var(--twinkle-animation);
	}
}
</style>
