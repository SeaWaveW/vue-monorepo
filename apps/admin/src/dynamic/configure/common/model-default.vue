<template>
	<div class="configure-model-default">
		<SacoFormItem :label="t('data_source')" prop="id" :rules="rules.id">
			<SacoInput
				v-model="id"
				:placeholder="
					t('validate_please_enter_any', [t('data_source')])
				"
				:clearable="false"
			/>
		</SacoFormItem>
		<SacoFormItem
			v-for="(_, key) in modelBind"
			:key="key"
			:label="t(key)"
			:prop="`modelBind.${key}`"
			:rules="rules[key]"
		>
			<SacoInput
				:model-value="modelBind?.[key]"
				:placeholder="t('validate_please_enter_any', [t(key)])"
				:clearable="false"
				@update:model-value="updateModelBind(key, $event)"
			/>
		</SacoFormItem>
	</div>
</template>
<script lang="ts" setup name="configureModelDefault">
import type { PropType } from 'vue'
import type { ComponentItem } from '#/dynamic'
const id = defineModel<string>('id', { default: '' })
const modelBind = defineModel<ComponentItem['modelBind']>('modelBind', {
	default: () => ({}),
})
const props = defineProps({
	name: {
		type: String as PropType<ComponentItem['name']>,
		default: '',
	},
})
const { t } = useI18n()
/** 规则集合 */
const rules = computed(() => {
	const rulesMap: Record<string, RulesItem[]> = {
		id: [
			{
				required: true,
				message: t('validate_please_enter_any', [t('data_source')]),
				trigger: 'change',
			},
		],
	}
	Object.keys(modelBind.value || {}).forEach((key) => {
		rulesMap[key] = [
			{
				required: true,
				message: t('validate_please_enter_any', [t(key)]),
				trigger: 'change',
			},
		]
	})
	return rulesMap
})
/** 动态模型绑定 */
const updateModelBind = (key: string, value: string | number) => {
	modelBind.value = { ...modelBind.value, [key]: String(value) }
}
</script>
