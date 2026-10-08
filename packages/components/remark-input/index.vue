<template>
	<div class="remark-input">
		<SacoPopper
			v-model="row.isEdit"
			trigger="manual"
			placement="bottom-start"
			:show-arrow="false"
			append-to-body
			:fit-reference-width="false"
			popper-class="remark-input-popper"
			:delay="0"
		>
			<template #reference>
				<SacoSvg
					v-power="apiPath"
					class="remark-input__edit"
					name="antOutline-edit"
					:title="t('modify')"
					@click="handleOpen"
					@dblclick.stop
				/>
			</template>
			<div class="remark-input__panel" @keydown.esc="handleCancel">
				<SacoTextarea
					v-model="draftRemark"
					class="remark-input__field"
					:disabled="row.editLoading"
					:rows="4"
					:placeholder="placeholder"
					:max-length="maxlength"
					resize="both"
					auto-focus
				/>
				<div class="remark-input__actions">
					<SacoButton
						:disabled="row.editLoading"
						@click="handleCancel"
					>
						{{ t('close') }}
					</SacoButton>
					<SacoButton
						v-power="apiPath"
						type="primary"
						:loading="row.editLoading"
						@click="handleSave"
					>
						{{ t('save') }}
					</SacoButton>
				</div>
			</div>
		</SacoPopper>
		<label class="remark-input__text">
			<span class="remark-input__value">
				{{ leachFormatter(fieldValue) }}
			</span>
		</label>
	</div>
</template>
<script
	lang="ts"
	setup
	name="CommonRemarkInput"
	generic="D extends SearchRowLogo<AnyObj>"
>
import { computed, ref } from 'vue'
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { SacoPopper } from '@saco/ui/es/components/popper'
import { SacoSvg } from '@saco/ui/es/components/svg'
import { SacoTextarea } from '@saco/ui/es/components/textarea'
import { SacoButton } from '@saco/ui/es/components/button'
import { vPower } from '@saco/ui/es/components/power'
import { leachFormatter } from '../../utils/formatter'
import type { SearchRowLogo } from '../../utils/search'

const { t } = useI18n()
const props = defineProps({
	handleSave: {
		type: Function as PropType<(row: D) => void>,
		required: true,
	},
	apiPath: {
		type: String,
		required: true,
	},
	/** 字段最长字符数，与对应资源 swagger maxLength 一致 */
	maxlength: {
		type: Number,
		required: true,
	},
	placeholder: {
		type: String,
		default: '',
	},
	/** 要改的行字段；默认 remark，未达预期反馈传 unmetExpectationFeedback */
	field: {
		type: String,
		default: 'remark',
	},
})
const placeholder = computed(() => props.placeholder || t('remark'))
// 表格 slot 解构出的 row 是常量，父级不能 v-model:row；这里只就地改字段，单向 :row 即可
const row = defineModel<D>('row', {
	required: true,
})
const readField = () => {
	const data: AnyObj = row.value
	const value = data[props.field]
	if (typeof value === 'string') {
		return value
	}
	return ''
}
const fieldValue = computed(() => readField())
const draftRemark = ref('')
// 点图标是父级改 isEdit，Popper 不会 emit update:model-value；必须先写入草稿再打开，否则 textarea 挂载时是空的
const handleOpen = () => {
	draftRemark.value = readField()
	row.value.isEdit = true
}
const handleCancel = () => {
	row.value.isEdit = false
}
const handleSave = () => {
	const data: AnyObj = row.value
	data[props.field] = draftRemark.value
	props.handleSave(row.value)
}
</script>
<style scoped lang="scss" src="./style.scss" />
<style lang="scss">
.remark-input-popper {
	.popper-content {
		background-color: var(--white-color-1);
		box-shadow: 0 0 6px 0 var(--grey-color-5);
	}
}
</style>
