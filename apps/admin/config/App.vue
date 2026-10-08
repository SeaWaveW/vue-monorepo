<template>
	<SacoConfigProvide v-bind="configProvideBind">
		<CommonRotateScreen />
		<RouterView />
	</SacoConfigProvide>
</template>
<script lang="ts" setup name="App">
import type { ConfigProvideProps } from '@saco/ui'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import CommonRotateScreen from '#/components/rotate-screen/index.vue'
import CommonLoading from '#/components/loading/index.vue'

const { t } = useI18n()
const settingStore = useSettingStore()
const userStore = useUserStore()
const { isDark } = useTheme()
/** persist 水合后套 rem 根；登录页没有设置按钮，不能等 LayoutSetting */
settingStore.setFontSize(settingStore.fontSize)
const configProvideBind = computed<ConfigProvideProps>(() => {
	return {
		locale: {
			/** 周几别称（索引 0 = 日） */
			weekDays: [
				t('sunday'),
				t('monday'),
				t('tuesday'),
				t('wednesday'),
				t('thursday'),
				t('friday'),
				t('saturday'),
			],
			filterPlaceholder: t('keyword_search_placeholder'),
			noData: t('no_data'),
			noMatch: t('no_matching_data'),
		},
		/** 加载组件 */
		loading: {
			// computed 返回值被收集时别把 SFC 做成响应式
			spinner: markRaw(CommonLoading),
		},
		/** 权限指令 */
		powers: userStore.apiPaths,
		input: {
			/** 线叉；空串 = 不要清空图标 */
			clearIcon: 'close',
			/** 未写 maxlength 的输入框跟这项；按库表改 */
			maxlength: 255,
		},
		textarea: {
			/** 未写 maxLength 的文本域跟这项；按库表改 */
			maxlength: 500,
		},
		table: {
			align: 'center',
			border: true,
			emptyIcon: 'arcoDesign-empty',
		},
		datePicker: {
			/** 空串 = 不要默认日历 */
			prefixIcon: '',
			suffixIcon: 'md-date_range',
		},
		dialog: {
			closeIcon: 'close',
		},
		messageBox: {
			/** danger / error 用线叉，不要圆空心叉 */
			errorIcon: 'close',
		},
		tooltip: {
			arrow: true,
			placement: 'bottom-start',
			effect: isDark.value ? 'dark' : 'light',
		},
	}
})

if (import.meta.env.DEV) {
	// 开发不服 PWA：卸掉可能残留的 SW，也不 register
	window.addEventListener('load', () => {
		navigator.serviceWorker?.getRegistrations().then((regs) => {
			for (const reg of regs) void reg.unregister()
		})
	})
} else {
	const { needRefresh, updateServiceWorker } = useRegisterSW({
		// 等 window load：immediate 会在首屏/接口还在飞时装 SW，precache 再抢带宽
		immediate: false,
	})
	watch(needRefresh, (newVal) => {
		if (newVal) {
			updateVersionBox().then(() => {
				updateServiceWorker()
			})
		}
	})
}
</script>
