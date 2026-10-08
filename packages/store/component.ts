import type { SvgName } from '@saco/ui'
import { createStore } from '../pinia'
import type { LocaleKey } from '../i18n/locales/types'
import type { ComponentName } from '../dynamic'

/** 物料区叶子：包装组件名 + 图标 + 是否可拖入 */
export interface MaterialChild {
	name: ComponentName
	icon: SvgName | string
	usable: boolean
}

/** 物料区分组 */
export interface MaterialItem {
	title: LocaleKey
	tips?: LocaleKey
	children?: MaterialChild[]
}

/**
 * 动态表单物料清单。从 `@saco/common/store` 取，与 `useRouterStore` 同一 pinia。
 * 不持久化：清单跟权限走，刷新后由业务再写。
 */
export const useComponentStore = createStore('component', {
	state: () => {
		return {
			components: [
				{
					title: 'dynamic_form_type_layout_title',
					children: [
						{
							name: 'DynamicP',
							icon: 'fa5-align-center-fas',
							usable: false,
						},
						{
							name: 'DynamicTips' as ComponentName,
							icon: 'riLine-information-line',
							usable: false,
						},
					],
				},
				{
					title: 'dynamic_form_type_form_title',
					children: [
						{
							name: 'DynamicInput',
							icon: 'md-title',
							usable: true,
						},
						{
							name: 'DynamicTextarea' as ComponentName,
							icon: 'iconPark-stretching',
							usable: false,
						},
						{
							name: 'DynamicNumber' as ComponentName,
							icon: 'md-functions',
							usable: false,
						},
						{
							name: 'DynamicSelect',
							icon: 'fa5-chevron-down-fas',
							usable: false,
						},
						{
							name: 'DynamicRadio' as ComponentName,
							icon: 'md-radio_button_checked',
							usable: false,
						},
						{
							name: 'DynamicCheckbox' as ComponentName,
							icon: 'iconPark-full-selection',
							usable: false,
						},
						{
							name: 'DynamicDatePicker' as ComponentName,
							icon: 'md-date_range',
							usable: false,
						},
						{
							name: 'DynamicDateTimer' as ComponentName,
							icon: 'fa5-clock-far',
							usable: false,
						},
					],
				},
				{
					title: 'dynamic_form_type_high_title',
					children: [
						{
							name: 'DynamicEditor' as ComponentName,
							icon: 'fa5-code-fas',
							usable: false,
						},
						{
							name: 'DynamicSignature' as ComponentName,
							icon: 'if-pen-alt-1',
							usable: false,
						},
						{
							name: 'DynamicUploadSingle',
							icon: 'riLine-file-word-line',
							usable: true,
						},
						{
							name: 'DynamicUploadMultiple',
							icon: 'riLine-file-word-2-line',
							usable: false,
						},
						// {
						// 	name: 'DynamicUploadImage',
						// 	icon: 'iconPark-pic',
						// 	usable: true,
						// },
						{
							name: 'DynamicUploadImageMultiple' as ComponentName,
							icon: 'md-filter',
							usable: false,
						},
						{
							name: 'DynamicTable' as ComponentName,
							icon: 'antOutline-table',
							usable: false,
						},
					],
				},
				{
					title: 'dynamic_form_type_data_title',
					children: [
						{
							name: 'DynamicBaseData' as ComponentName,
							icon: 'iconPark-waterfalls-h',
							usable: false,
						},
					],
				},
			] as MaterialItem[],
			notTitles: [
				'DynamicUploadSingle',
				'DynamicUploadMultiple',
				'DynamicUploadImage',
			] as ComponentName[],
		}
	},
	getters: {
		/** 扁平化后的可用组件（按权限） */
		usableComponents(): MaterialChild[] {
			return this.components.flatMap((item) =>
				(item.children ?? []).filter((child) => child.usable),
			)
		},
	},
})
