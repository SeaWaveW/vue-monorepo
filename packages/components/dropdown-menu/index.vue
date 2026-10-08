<template>
	<SacoDropdown
		trigger="click"
		popper-class="dropdown-menu-popper"
		:placement="props.placement"
		:disabled="props.disabled"
		@command="handleCommand"
		@visible-change="onVisibleChange"
	>
		<slot />
		<template #dropdown>
			<SacoDropdownMenu>
				<SacoDropdownItem
					v-if="props.filterable"
					disabled
					class="dropdown-menu-search"
				>
					<SacoInput
						class="dropdown-input"
						size="small"
						:model-value="searchLabel"
						:placeholder="t('keyword_search_placeholder')"
						@click.stop
						@mousedown.stop
						@input="onSearchInput"
					/>
				</SacoDropdownItem>
				<SacoDropdownItem
					v-for="item in displayList"
					:key="item[valueKey]"
					:command="item"
					:class="{
						'is-active': item[valueKey] === props.modelValue,
					}"
				>
					{{ item[labelKey] }}
				</SacoDropdownItem>
				<SacoDropdownItem
					v-if="!displayList.length"
					disabled
					class="dropdown-menu-empty"
				>
					{{ t('no_data') }}
				</SacoDropdownItem>
			</SacoDropdownMenu>
		</template>
	</SacoDropdown>
</template>
<script
	lang="ts"
	setup
	generic="D extends AnyObj, K extends keyof D = 'value'"
	name="CommonDropdownMenu"
>
import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { SacoDropdown } from '@saco/ui/es/components/dropdown'
import { SacoDropdownMenu } from '@saco/ui/es/components/dropdown-menu'
import { SacoDropdownItem } from '@saco/ui/es/components/dropdown-item'
import { SacoInput } from '@saco/ui/es/components/input'
import type { DropdownProps } from '@saco/ui'

/**
 * props 写内联字面量：`vite-plugin-vue-setup-extend` 调 compileScript 不带 fs，
 * `defineProps<从 ./types 导入>()` 会报 No fs option provided。
 * 公开形状见 `./types` 的 DropdownMenuProps。
 * placement 跟 `@saco/ui` 的 DropdownProps 走，不要再抄一份方向联合。
 */
const props = withDefaults(
	defineProps<{
		data: D[]
		/** 选中值对应的字段名，须是 D 的 key */
		fieldValue?: K
		/** 展示文案字段名 */
		fieldLabel?: keyof D & string
		filterable?: boolean
		placement?: DropdownProps['placement']
		/** 禁用后不打开菜单、不抛 command */
		disabled?: boolean
		/**
		 * 当前选中值（对应 fieldValue 字段）。
		 * 不用 defineModel：其对 T|undefined 会剥掉 undefined，Partial 详情绑不上。
		 */
		modelValue?: D[K]
	}>(),
	{
		filterable: false,
		placement: 'bottom-start',
		disabled: false,
	},
)
// 未传时按默认键取值，避免 props.fieldValue 为 string 无法索引 D
const valueKey = computed(() => props.fieldValue ?? ('value' as K))
const labelKey = computed(
	() => props.fieldLabel ?? ('label' as keyof D & string),
)
const emit = defineEmits<{
	'update:modelValue': [value: D[K]]
	command: [item: D]
}>()
const { t } = useI18n()
const searchLabel = ref('')
const filterLabel = ref('')
const searchTimer = ref<ReturnType<typeof setTimeout>>()
const displayList = computed(() => {
	if (!props.filterable || !filterLabel.value) return props.data
	return props.data.filter((item) =>
		String(item[labelKey.value] ?? '').includes(filterLabel.value),
	)
})
const onSearchInput = (value: string) => {
	searchLabel.value = value
	clearTimeout(searchTimer.value)
	searchTimer.value = setTimeout(() => {
		filterLabel.value = value
	}, 150)
}
const onVisibleChange = (visible: boolean) => {
	if (visible) return
	clearTimeout(searchTimer.value)
	searchLabel.value = ''
	filterLabel.value = ''
}
const handleCommand = (command: unknown) => {
	if (props.disabled) return
	const item = props.data.find((row) => row === command)
	if (!item) return
	const next = item[valueKey.value]
	// 点当前项不往外抛，避免父级用「已是该值」直接 return
	if (next === props.modelValue) return
	// 先 command 再写 v-model，父级才能用旧值判断是否真的改了
	emit('command', item)
	emit('update:modelValue', next)
}
onUnmounted(() => {
	clearTimeout(searchTimer.value)
})
</script>
