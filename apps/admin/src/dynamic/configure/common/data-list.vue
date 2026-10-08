<template>
	<div class="configure-data-list configure-item">
		<div class="item-title">
			<label class="before-required">{{ t('data_setting') }}</label>
			<SacoButton @click="handleAdd">{{ t('addition') }}</SacoButton>
		</div>
		<div v-for="(item, index) in data" :key="index" class="data-item">
			<div class="prefix-box">
				<div class="move">
					<div v-if="index > 0" class="up">
						<SacoSvg
							class="data-list__up"
							name="arrow-up"
							:title="t('go_up')"
							@click="handleUp(index)"
						/>
					</div>
					<div v-if="index !== data.length - 1" class="down">
						<SacoSvg
							class="data-list__down"
							name="arrow-down"
							:title="t('go_down')"
							@click="handleDown(index)"
						/>
					</div>
				</div>
				<div class="seq">{{ index + 1 }}</div>
			</div>
			<div class="value-box">
				<SacoFormItem
					:prop="`props.data.${index}.label`"
					:rules="rules(index, 'label')"
				>
					<SacoInput
						:clearable="false"
						:placeholder="t('select_name')"
						:model-value="(item.label as string)"
						@update:model-value="updateLabel(index, $event)"
						@blur="validateKey('label')"
					/>
				</SacoFormItem>
				<SacoFormItem
					:prop="`props.data.${index}.value`"
					:rules="rules(index, 'value')"
				>
					<SacoInput
						:clearable="false"
						:placeholder="t('select_value')"
						:model-value="(item.value as string)"
						@update:model-value="updateValue(index, $event)"
						@blur="validateKey('value')"
					/>
				</SacoFormItem>
			</div>

			<div class="suffix-box">
				<SacoSvg
					v-if="index !== 0"
					name="close"
					:title="t('delete')"
					class="icon close"
					@click="handleDel(index)"
				/>
			</div>
		</div>
		<div v-if="!data.length" class="data-item">
			{{ t('no_data') }}
		</div>
	</div>
</template>
<script lang="ts" setup name="configureDataList">
import type {
	ComponentDataItem,
	ComponentModelKey,
	ComponentModelBind,
	ComponentDefaultModel,
} from '#/dynamic'
import { useConfigureForm } from '../utils'

const { t } = useI18n()

const data = defineModel<ComponentDataItem[]>('data', { default: () => [] })
const defaultModel = defineModel<ComponentDefaultModel>('defaultModel', {
	default: () => ({}),
})
const props = withDefaults(
	defineProps<{
		modelKey?: ComponentModelKey
		modelBind?: ComponentModelBind
	}>(),
	{
		modelKey: '',
		modelBind: () => ({}),
	},
)
const formRef = useConfigureForm()
// 表单校验规则
const rules = (index: number, type: 'label' | 'value'): RulesItem[] => {
	const mapTxt = type === 'label' ? t('select_name') : t('select_value')
	return [
		{
			required: true,
			message: t('validate_please_enter_any', [mapTxt]),
			trigger: ['change', 'blur'],
			validator: (value) => {
				const isRepeat = data.value.some(
					(item, i) => i !== index && item[type] === value,
				)
				if (isRepeat) return t('validate_any_non_repetition', [mapTxt])
				return true
			},
		},
	]
}
/** 同列全部重校（改一项后清掉其它项的「重复」残留） */
const revalidateColumn = (key: 'label' | 'value') => {
	data.value.forEach((_, index) => {
		formRef?.validateField(`props.data.${index}.${key}`)
	})
}
/** 默认选中若不在选项列表中则清空（只按 value 判断，label 仅展示） */
const clearDefaultIfMissing = () => {
	const defaultKey = props.modelBind[props.modelKey]
	const defaultValue = defaultModel.value?.[defaultKey]
	if (!defaultValue) return
	const isExist = data.value.some((item) => item.value === defaultValue)
	if (!isExist) {
		const newDefaultModel = Object.keys(defaultModel.value || {}).reduce(
			(acc, key) => {
				acc[key] = ''
				return acc
			},
			{} as ComponentDefaultModel,
		)
		defaultModel.value = newDefaultModel
	}
}
// 校验键值：并同步清理失效的默认选中
const validateKey = (key: 'label' | 'value') => {
	revalidateColumn(key)
	clearDefaultIfMissing()
}
// 更新选项名称
const updateLabel = (index: number, value: string | number) => {
	const list = [...data.value]
	list[index] = { ...list[index], label: String(value) }
	data.value = list
	nextTick(() => revalidateColumn('label'))
}
// 更新选项值
const updateValue = (index: number, value: string | number) => {
	const list = [...data.value]
	list[index] = { ...list[index], value: String(value) }
	data.value = list
	nextTick(() => revalidateColumn('value'))
}
// 上一一项
const handleUp = (index: number) => {
	if (index === 0) return
	const list = [...data.value]
	;[list[index], list[index - 1]] = [list[index - 1], list[index]]
	data.value = list
}
// 下移一项
const handleDown = (index: number) => {
	if (index === data.value.length - 1) return
	const list = [...data.value]
	;[list[index], list[index + 1]] = [list[index + 1], list[index]]
	data.value = list
}

// 添加一项
const handleAdd = () => {
	const list = [...data.value]
	list.push({ label: '', value: '' })
	data.value = list
}

// 删除一项
const handleDel = (index: number) => {
	const list = [...data.value]
	list.splice(index, 1)
	data.value = list
	clearDefaultIfMissing()
	nextTick(() => revalidateColumn('label'))
	nextTick(() => revalidateColumn('value'))
}
</script>
<style scoped lang="scss">
.configure-data-list {
	.item-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: calc(var(--common-gap) * 0.6);
		font-size: calc(var(--font-size) - 2px);
	}

	.data-item {
		display: flex;
		gap: var(--common-gap);
		align-items: center;
		margin-bottom: calc(var(--common-gap) * 1.8);

		$icon-size: calc(var(--font-size) - 2px);

		.prefix-box {
			display: flex;
			gap: var(--common-gap);
			align-items: center;

			.move {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;

				// 始终占两格高，避免增删项抖动；仅一个箭头时居中
				height: calc(#{$icon-size} * 2);
				user-select: none;

				.up,
				.down {
					display: flex;
					align-items: center;
					justify-content: center;
					line-height: 1;
				}

				.data-list__up,
				.data-list__down {
					height: $icon-size;
					font-size: $icon-size;
					cursor: pointer;
				}

				.data-list__up {
					color: var(--success-color);
				}

				.data-list__down {
					color: var(--danger-color);
				}
			}

			.seq {
				$color: #{alpha-color(var(--black-color), 65%)};

				display: flex;
				align-items: center;
				justify-content: center;
				width: var(--font-size);
				height: var(--font-size);
				font-size: calc(var(--font-size) - 4px);
				color: $color;
				text-align: center;
				user-select: none;
				background-color: var(--white-color);
				border-radius: 50%;
				box-shadow: 0 0 0 1px $color;
			}
		}

		.value-box {
			display: flex;
			flex: 1;
			gap: var(--common-gap);
			min-width: 0;

			.saco-form-item {
				flex: 1;
				min-width: 0;
				padding: 0;
				margin-bottom: 0;
			}
		}

		.suffix-box {
			width: $icon-size;

			.close {
				font-size: $icon-size;
				color: var(--info-color);
				cursor: pointer;

				&:hover {
					color: var(--danger-color);
				}
			}
		}
	}
}
</style>
