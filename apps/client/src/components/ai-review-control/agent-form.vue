<template>
	<SacoCard v-loading="detailLoading" class="dynamic-form">
		<template #header>
			<div class="card-title">
				<h2>{{ t('control_agent_data') }}</h2>
				<p>{{ t('control_agent_data_tips') }}</p>
			</div>
		</template>
		<SacoForm
			:key="formKeys"
			ref="formRef"
			class="dynamic-form__grid"
			label-position="top"
			:model="formModel"
			:rules="formRules"
			:style="{ '--proportion-columns': proportion }"
		>
			<div
				v-for="(item, index) in components"
				:key="item.uniqueId ?? index"
				class="dynamic-form__item"
				:class="{
					'is-not-title': hideTitle(item),
				}"
				:style="{
					'--proportion-span': Number(item.proportion) || proportion,
				}"
				@click.capture="onGuardBatchLocked(item, $event)"
				@drop.capture="onGuardBatchLocked(item, $event)"
			>
				<SacoFormItem
					:label="hideTitle(item) ? '' : item.title"
					:prop="itemProp(item)"
					:required="hideTitle(item) ? undefined : item.required"
					:show-asterisk="!hideTitle(item)"
				>
					<SacoRender
						:name="item.name!"
						v-bind="vBind(item)"
						v-on="vOn(item)"
					/>
				</SacoFormItem>
			</div>
		</SacoForm>
		<template #footer>
			<slot name="footer" />
		</template>
	</SacoCard>
</template>

<script lang="ts" setup name="AiReviewControlAgentForm">
import type { ComponentItem } from '#/dynamic'
import {
	AI_REVIEW_CONTROL_KEY,
	type AiReviewControlContext,
} from '@/hooks/ai-review-control/context'

const { t } = useI18n()
const { agent, dynamic, data } = inject(
	AI_REVIEW_CONTROL_KEY,
) as AiReviewControlContext

const formKeys = agent.formKeys
const detailLoading = agent.detailLoading
const formModel = dynamic.formModel
const formRules = dynamic.formRules
const components = dynamic.components
const proportion = dynamic.proportion
const hideTitle = dynamic.hideTitle
const itemProp = dynamic.itemProp
const {
	formRef,
	vBind,
	vOn,
	beginSilentWrite,
	endSilentWrite,
	isBatchUploadLocked,
} = data

watch(formKeys, () => {
	endSilentWrite()
})

const onGuardBatchLocked = (item: ComponentItem, e: Event) => {
	if (item.type !== 'upload' || item.uniqueId == null) return
	if (!isBatchUploadLocked(item.uniqueId)) return
	e.preventDefault()
	e.stopPropagation()
	SacoMessage.warning(t('control_file_uploading_no_repeat_message'))
}

defineExpose({
	beginSilentWrite,
	validate: (callback: (valid: boolean) => void) => {
		formRef.value?.validate(callback)
	},
})
</script>

<style scoped lang="scss">
@use '#/style/dynamic-form.scss' as *;

$x-gap: calc(var(--common-gap) * 3);
$y-gap: calc(var(--common-gap) * 1.7);

.dynamic-form {
	flex: 1;
	min-height: 0;

	:deep(.saco-card__header) {
		padding: $x-gap $x-gap 0;
		margin-bottom: 0;
	}

	:deep(.saco-card__body) {
		min-height: 0;
		padding: $y-gap;
		scrollbar-gutter: stable both-edges;
	}

	:deep(.dynamic-form__grid) {
		@include dynamic-form-grid;

		flex: 1;
		width: 100%;
	}

	.dynamic-form__item {
		@include dynamic-form-item-box;
	}

	.dynamic-form__item.is-not-title {
		:deep(.saco-form-item__label) {
			display: none;
		}
	}

	:deep(.saco-card__footer) {
		display: flex;
		flex-direction: column;
		gap: $y-gap;
		padding: $y-gap $y-gap 0;
		border-top: none;
	}
}
</style>
