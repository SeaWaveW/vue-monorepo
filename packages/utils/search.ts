import { SacoMessage } from '@saco/ui/es/components/message'
import type { FormExpose } from '@saco/ui'
import {
	computed,
	nextTick,
	reactive,
	shallowRef,
	ref,
	type ComputedRef,
	type Ref,
	type ShallowRef,
} from 'vue'
import { i18n } from '../i18n'

export const DEFAULT_PAGE_SIZE = 20

/** 分页查询入参：业务筛选字段用泛型交叉，不要在业务 Params 里再写 pageNum / pageSize */
export type SearchParams<T = Record<string, any>> = {
	/** 页码，从 1 开始 */
	pageNum?: number
	/** 每页记录数 */
	pageSize?: number
} & T

/** 分页列表响应；行类型用泛型，业务 `SearchResponse<IpListItem>` */
export interface SearchResponse<T = any> {
	records: T[]
	total: number
	pageNum: number
	pageSize: number
}

/**
 * 从 api 的 Promise 结果取出行类型。
 * axios 声明可能包在 AxiosResponse.data 里，拦截器也可能直接给出 SearchResponse。
 */
type SearchRow<A extends (...args: any) => any> =
	Awaited<ReturnType<A>> extends SearchResponse<infer I>
		? I
		: Awaited<ReturnType<A>> extends { data: SearchResponse<infer I> }
			? I
			: never

/**
 * 接口行 + 列表本地状态。
 * 用交叉而不是映射拷贝：映射在 O 为 never 时会变成全键 never。
 */
export type SearchRowLogo<O> = O & {
	/** 是否编辑中 */
	isEdit: boolean
	/** 编辑加载状态 */
	editLoading: boolean
	/** 是否删除中 */
	isDel: boolean
	/** 删除加载状态 */
	delLoading: boolean
	/** 原始行数据 */
	oldRow?: SearchRowLogo<O>
}

/**
 * useSearchFormTable 返回值。
 * dataList 用 `ShallowRef<D[]>`：外层浅层避免 UnwrapRef 把行字段推成 any；
 * 写入时每行包 reactive，业务改 isEdit 等字段仍能驱动视图，不必 triggerRef。
 */
export interface SearchFormTableReturn<D> {
	loading: ComputedRef<boolean>
	searchLoading: Ref<boolean>
	refreshLoading: Ref<boolean>
	dataList: ShallowRef<D[]>
	pageInfo: Omit<SearchResponse, 'records'>
	search: () => void
	reset: () => void
	refresh: () => void
}

/**
 * 搜索表 + 分页列表。
 * P 是查询参数；D 从 api 的 Promise 推断，不改接口写法。
 * D 写 extends 即可：没传入时会落成约束本身，函数体里才能用 isEdit。
 * 须在 setup 调一次（内部有 ref / reactive）。
 */
export const useSearchFormTable = <
	P extends AnyObj,
	A extends (
		params: P & Pick<SearchResponse, 'pageNum' | 'pageSize'>,
	) => Promise<any>,
	D extends SearchRowLogo<SearchRow<A>>,
>(
	formRef: Ref<FormExpose | null>,
	model: P,
	api: A,
): SearchFormTableReturn<D> => {
	/** 加载状态 */
	const searchLoading = ref(false)
	const resetLoading = ref(false)
	const refreshLoading = ref(false)
	const loading = computed(
		() => searchLoading.value || resetLoading.value || refreshLoading.value,
	)
	/** 分页数据，字段和 SearchResponse 对齐 */
	const pageInfo = reactive<Omit<SearchResponse, 'records'>>({
		/** 当前页 */
		pageNum: 1,
		/** 每页条数 */
		pageSize: DEFAULT_PAGE_SIZE,
		/** 总条数 */
		total: 0,
	})

	/** 记录本次请求分页参数（刷新用，避免改了 pageInfo 还没提交） */
	const currentPageInfo = reactive<Omit<SearchResponse, 'records' | 'total'>>(
		{
			pageNum: 1,
			pageSize: DEFAULT_PAGE_SIZE,
		},
	)
	/**
	 * 列表数据。
	 * 外层 shallowRef 保 D 不被 UnwrapRef；行用 reactive，改 isEdit 才能通知视图
	 */
	const dataList = shallowRef<D[]>([])
	/** 实际查询方法 */
	const actualSearch = (pageNum: number, pageSize: number) => {
		const oldPageSize = currentPageInfo.pageSize
		currentPageInfo.pageNum = pageNum
		currentPageInfo.pageSize = pageSize
		return new Promise((resolve, reject) => {
			api({
				...model,
				pageNum,
				pageSize,
			})
				.then(({ data }: { data: SearchResponse<D> }) => {
					if (oldPageSize !== currentPageInfo.pageSize) {
						SacoMessage.success(i18n.global.t('switch_successfully'))
					}

					pageInfo.total = data.total
					pageInfo.pageSize = data.pageSize
					pageInfo.pageNum = data.pageNum
					dataList.value = data.records.map((item) => {
						// 每行独立 reactive：shallow 数组下改字段仍能触发模板
						return reactive({
							...item,
							isEdit: false,
							editLoading: false,
							isDel: false,
							delLoading: false,
						}) as D
					})
					resolve(data)
				})
				.catch(reject)
		})
	}

	/** 查询方法 */
	const search = () => {
		if (loading.value) return
		formRef.value?.validate((valid) => {
			if (!valid) return
			searchLoading.value = true
			actualSearch(pageInfo.pageNum, pageInfo.pageSize).finally(() => {
				searchLoading.value = false
			})
		})
	}
	/** 重置方法 */
	const reset = () => {
		if (loading.value) return
		pageInfo.pageNum = 1
		pageInfo.total = 0
		dataList.value = [] as D[]
		formRef.value?.resetFields()
		nextTick(() => {
			formRef.value?.validate((valid) => {
				if (!valid) return
				resetLoading.value = true
				actualSearch(pageInfo.pageNum, pageInfo.pageSize).finally(
					() => {
						resetLoading.value = false
					},
				)
			})
		})
	}
	/** 当前刷新（用上次成功请求的页码 / 条数） */
	const refresh = () => {
		if (loading.value) return
		refreshLoading.value = true
		actualSearch(currentPageInfo.pageNum, currentPageInfo.pageSize).finally(
			() => {
				refreshLoading.value = false
			},
		)
	}
	return {
		loading,
		searchLoading,
		refreshLoading,
		dataList,
		pageInfo,
		search,
		reset,
		refresh,
	}
}
