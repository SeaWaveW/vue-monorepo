<template>
	<div class="common-pagination">
		<span class="common-pagination-total">
			{{ i18n.global.t('pagination_total', [totalCount]) }}
		</span>
		<SacoPagination
			v-model:current-page="currentPage"
			v-model:page-size="pageSize"
			v-bind="bindProps"
			v-on="onEvents"
		>
			<template
				v-for="(slot, name) in slots"
				:key="name"
				#[name]="slotProps"
			>
				<slot :name="slot" v-bind="slotProps" />
			</template>
		</SacoPagination>
	</div>
</template>
<script lang="ts" setup name="CommonPagination">
import { computed, useSlots } from 'vue'
import type { Slots } from 'vue'
import { SacoPagination } from '@saco/ui/es/components/pagination'
import { i18n } from '../../i18n'
import { paginationProps } from './props'
import type { PaginationLayout } from './types'

/** 当前页 / 每页条数：required 才能是 number；默认 defineModel 带 undefined，业务 pageInfo（number）接 v-model 会报错 */
const currentPage = defineModel<number>('currentPage', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })

const props = defineProps(paginationProps)
/**
 * defineProps(外部对象) 不会把字段写进 bindingMetadata；
 * 模板裸写 total → 编译成 _ctx.total，一直是 undefined。
 * 提出 computed 后才是 setup binding，模板 / i18n 才能读到。
 */
const totalCount = computed(() =>
	typeof props.total === 'number' ? props.total : 0,
)
/**
 * 业务事件写死在本地（不要 Omit 再导出的 PaginationEmits：compiler-sfc 解析不了 ./types 再导出）。
 * 也不要带 update:*——那些已由 defineModel 声明，叠进去 vue-tsc dts 会丢掉自定义事件
 */
const emit = defineEmits<{
	sizeChange: [size: number]
	currentChange: [page: number]
	change: [currentPage: number, pageSize: number]
	prevClick: [page: number]
	nextClick: [page: number]
}>()
const slots: Slots = useSlots()

/**
 * 列表底栏默认 layout。必须放 setup：total 要「共 N 页」，N = ceil(total / pageSize)，
 * 跟 canNext 同源；props 静态 default 闭包不到双绑 pageSize。
 * layout 的 total 只能挂一份，留给「共 N 页」；「共 N 条」在外层 span。
 */
const defaultLayout = computed((): PaginationLayout => [
	{
		key: 'sizes',
		formatter: (size: number) => i18n.global.t('pagination_size', [size]),
	},
	{
		key: 'total',
		formatter: (total: number, size?: number) => {
			// 情况1：新版 SacoPagination 运行时传入第二参 pageSize
			// 情况2：旧包只传 total — 回落双绑，避免 Math.ceil(total / undefined) → NaN
			const n =
				typeof size === 'number' && size > 0
					? size
					: (pageSize.value ?? 10)
			return i18n.global.t('pagination_sizes', [
				Math.max(1, Math.ceil(total / n)),
			])
		},
	},
	{
		key: 'jumper',
		formatter: () => ({
			prefix: i18n.global.t('pagination_goto'),
			suffix: i18n.global.t('pagination_classifier'),
		}),
	},
	'prev',
	'next',
])

/** 去掉双绑字段；未传 layout 时用业务默认（含页数文案） */
const bindProps = computed(() => {
	const { currentPage, pageSize, layout, ...rest } = props
	return {
		...rest,
		layout: layout ?? defaultLayout.value,
	}
})

/** 库侧自定义事件原样抛出，方便业务 @change / @size-change */
const onEvents = computed(() => {
	return {
		sizeChange: (size: number) => emit('sizeChange', size),
		currentChange: (page: number) => emit('currentChange', page),
		change: (page: number, size: number) => emit('change', page, size),
		prevClick: (page: number) => emit('prevClick', page),
		nextClick: (page: number) => emit('nextClick', page),
	}
})
</script>
<style lang="scss" src="./style.scss" />
