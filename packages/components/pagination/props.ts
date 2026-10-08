import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { PaginationProps } from './types'
import { DEFAULT_PAGE_SIZE } from '../../utils/search'

/**
 * CommonPagination runtime props。
 * 跟 SacoPagination 对齐；业务列表页常用 currentPage / pageSize / total / layout。
 */
export const paginationProps = {
	pageSize: {
		type: Number as PropType<PaginationProps['pageSize']>,
		default: undefined,
	},
	defaultPageSize: {
		type: Number as PropType<PaginationProps['defaultPageSize']>,
		default: undefined,
	},
	total: {
		type: Number as PropType<PaginationProps['total']>,
		default: undefined,
	},
	pageCount: {
		type: Number as PropType<PaginationProps['pageCount']>,
		default: undefined,
	},
	pagerCount: {
		type: Number as PropType<PaginationProps['pagerCount']>,
		default: 7,
	},
	currentPage: {
		type: Number as PropType<PaginationProps['currentPage']>,
		default: undefined,
	},
	defaultCurrentPage: {
		type: Number as PropType<PaginationProps['defaultCurrentPage']>,
		default: undefined,
	},
	layout: {
		// string（EP）或数组；有文案的项可挂 formatter 做 i18n
		// 默认 layout 放 index.vue：要闭包 pageSize 算「共 N 页」，props 静态 default 拿不到双绑
		type: [String, Array] as PropType<PaginationProps['layout']>,
		default: undefined,
	},
	pageSizes: {
		type: Array as PropType<PaginationProps['pageSizes']>,
		default: () => [DEFAULT_PAGE_SIZE, 50, 100, 200, 500],
	},
	popperClass: {
		type: String as PropType<PaginationProps['popperClass']>,
		default: '',
	},
	prevText: {
		type: String as PropType<PaginationProps['prevText']>,
		default: '',
	},
	prevIcon: {
		type: String as PropType<PaginationProps['prevIcon']>,
		default: 'arrow-left',
	},
	nextText: {
		type: String as PropType<PaginationProps['nextText']>,
		default: '',
	},
	nextIcon: {
		type: String as PropType<PaginationProps['nextIcon']>,
		default: 'arrow-right',
	},
	size: {
		type: String as PropType<PaginationProps['size']>,
		default: undefined,
	},
	small: {
		type: Boolean as PropType<PaginationProps['small']>,
		default: false,
	},
	background: {
		type: Boolean as PropType<PaginationProps['background']>,
		default: false,
	},
	disabled: {
		type: Boolean as PropType<PaginationProps['disabled']>,
		default: false,
	},
	hideOnSinglePage: {
		type: Boolean as PropType<PaginationProps['hideOnSinglePage']>,
		default: false,
	},
} satisfies ComponentObjectPropsOptions<PaginationProps>
