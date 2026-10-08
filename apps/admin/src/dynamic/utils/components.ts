import type { ComponentMaps } from '#/dynamic'

/**
 * 获取组件映射（computed：语言变化时自动重算）
 * @returns 组件映射
 */
export const useComponentMap = () => {
	const { t, locale } = useI18n()
	return computed((): Partial<ComponentMaps> => {
		// 显式依赖 locale，保证切语言后材料区预览与拖入默认值跟着变
		void locale.value
		return {
			DynamicInput: {
				name: 'DynamicInput',
				title: t('component_title'),
				description: '',
				type: 'input',
				proportion: 1,
				id: t('component_title_value'),
				props: {
					// placeholder: t('validate_please_enter'),
					clearable: true,
					minlength: 0,
					maxlength: 100,
				},
				modelBind: {
					modelValue: 'value',
				},
				modelKey: 'modelValue',
				defaultModel: {
					value: '',
				},
			},
			DynamicSelect: {
				name: 'DynamicSelect',
				title: t('component_title'),
				description: '',
				type: 'select',
				proportion: 1,
				id: t('component_title_value'),
				props: {
					data: [
						{
							label: t('default_select_item_label'),
							value: t('default_select_item_value'),
						},
					],
					// placeholder: t('validate_please_select'),
					fieldLabel: 'label',
					fieldValue: 'value',
					clearable: true,
					filterable: true,
					filterPlaceholder: t('keyword_search_placeholder'),
					noDataText: t('no_data'),
					noMatchText: t('no_matching_data'),
				},
				modelBind: {
					modelLabel: 'label',
					modelValue: 'value',
				},
				modelKey: 'modelValue',
				defaultModel: {
					label: '',
					value: '',
				},
			},
			DynamicUploadSingle: {
				name: 'DynamicUploadSingle',
				title: t('component_title'),
				description: '',
				type: 'upload',
				proportion: 1,
				id: t('component_title_value'),
				props: {
					accept: ['.pdf', '.doc', '.docx'],
					disabled: false,
					drag: true,
					paste: true,
					size: 500,
				},
				modelKey: 'fileUrl',
				modelBind: {
					fileName: 'name',
					fileUrl: 'url',
				},
				defaultModel: {
					name: '',
					url: '',
				},
			},
			DynamicUploadMultiple: {
				name: 'DynamicUploadMultiple',
				title: '',
				description: '',
				type: 'upload',
				proportion: 1,
				id: '',
				props: {
					accept: ['.pdf', '.doc', '.docx'],
					disabled: false,
					drag: true,
					paste: true,
					size: 500,
					folder: true,
					multiple: true,
				},
			},
			DynamicUploadImage: {
				name: 'DynamicUploadImage',
				title: t('component_title'),
				description: '',
				type: 'upload',
				proportion: 1,
				id: t('component_title_value'),
				props: {
					accept: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
					disabled: false,
					drag: true,
					paste: true,
					size: 5,
					radius: 8,
				},
				modelKey: 'fileUrl',
				modelBind: {
					fileName: 'name',
					fileUrl: 'url',
				},
				defaultModel: {
					name: '',
					url: '',
				},
			},
		} satisfies Partial<ComponentMaps>
	})
}
