<template>
	<SacoFormItem
		class="configure-com-title"
		prop="title"
		:rules="rules"
		:label="t('field_name')"
		:class="{ 'not-required': true }"
	>
		<SacoInput v-model="title" :clearable="false" @blur="onTitleBlur" />
	</SacoFormItem>
</template>
<script lang="ts" setup name="configure-com-title">
import type { ComponentItem } from '#/dynamic'
const { t } = useI18n()
const title = defineModel<string>('title')
const props = defineProps({
	component: {
		type: Object as PropType<ComponentItem | null>,
		default: null,
	},
	components: {
		type: Array as PropType<ComponentItem[] | null>,
		default: () => [],
	},
	componentIndex: {
		type: Number,
		default: -1,
	},
})
const rules: RulesItem[] = [
	{
		required: true,
		message: t('validate_please_enter_any', [t('field_name')]),
		trigger: ['change', 'blur'],
		validator: (value) => {
			// 去除两端空格
			const trimValue = (value || '').toString().trim()
			// 判断是否存在重复的组件标题
			const isRepeat = props.components?.some((item, index) => {
				return (
					item.title === trimValue && index !== props.componentIndex
				)
			})
			if (isRepeat) {
				return t('validate_any_non_repetition', [t('field_name')])
			}
			return true
		},
	},
]

/** 失焦去掉两端空格，id 会跟 trim 后的 title 走 */
const onTitleBlur = () => {
	const next = (title.value || '').trim()
	if (title.value === next) return
	title.value = next
}
</script>
