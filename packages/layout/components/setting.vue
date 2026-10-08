<template>
	<SacoDropdown
		trigger="click"
		placement="bottom"
		popper-class="dropdown-menu-popper"
		@command="handleCommand"
	>
		<SacoSvg class="layout-header__tool" name="antOutline-setting" />
		<template #dropdown>
			<SacoDropdownMenu>
				<SacoDropdownItem
					v-for="item in settingList"
					:key="item.command"
					:command="item.command"
					:class="item.command"
				>
					{{ item.label }}
				</SacoDropdownItem>
			</SacoDropdownMenu>
		</template>
	</SacoDropdown>
</template>
<script lang="ts" setup name="LayoutSetting">
import { SacoDropdown } from '@saco/ui/es/components/dropdown'
import { SacoDropdownMenu } from '@saco/ui/es/components/dropdown-menu'
import { SacoDropdownItem } from '@saco/ui/es/components/dropdown-item'
import { SacoSvg } from '@saco/ui/es/components/svg'
import { SacoTabs } from '@saco/ui/es/components/tabs'
import { SacoTabPane } from '@saco/ui/es/components/tab-pane'
import { SacoMessageBox } from '@saco/ui/es/components/message-box'
import { SacoMessage } from '@saco/ui/es/components/message'
import { computed, h, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { request } from '../../axios'
import { useRouterStore, useSettingStore } from '../../store'
import { i18nLocales, type Language } from '../../i18n'

const { t, locale } = useI18n()
const routerStore = useRouterStore()
const settingStore = useSettingStore()
type SettingCommand = 'theme' | 'font' | 'language'
interface SettingItem {
	label: string
	command: SettingCommand
}
interface FontSizeItem {
	label: string
	/** 设计稿宽度下的根字号（px）；档位只在这列，store 不白名单 */
	command: number
}

const settingList = computed<SettingItem[]>(() => {
	return [
		{ label: t('theme_settings'), command: 'theme' },
		{ label: t('font_size'), command: 'font' },
		{ label: t('language_switch'), command: 'language' },
	]
})

const fontSizeList = computed<FontSizeItem[]>(() => {
	return [
		{ label: t('font_standard'), command: 14 },
		{ label: t('font_larger'), command: 16 },
		{ label: t('font_maximum'), command: 18 },
	]
})

/** 联合写在这里，@command 双变能挂上；command === 会出三项补全 */
const handleCommand = (command: SettingCommand) => {
	if (command === 'theme') {
		SacoMessageBox({
			title: t('message'),
			message: t('coming_soon_message'),
		})
		return
	}
	if (command === 'font') {
		const fontSize = ref(settingStore.fontSize)
		SacoMessageBox({
			title: t('font_size'),
			confirmButtonText: t('confirm'),
			showCancelButton: true,
			cancelButtonText: t('cancel'),
			customClass: 'font-size-message-box',
			// 函数每次渲染重跑，才能吃到 fontSize 的最新值
			message: () =>
				h(
					SacoTabs,
					{
						modelValue: fontSize.value,
						style: {
							// 列数跟档位走，scss 里写死格子数后面加档会对不齐
							'--font-size-tab-count': String(
								fontSizeList.value.length,
							),
						},
						'onUpdate:modelValue': (name: string | number) => {
							const next = Number(name)
							// Tabs 的 name 是 number | string；有限正数才写回
							if (Number.isFinite(next) && next > 0) {
								fontSize.value = next
							}
						},
					},
					{
						default: () =>
							fontSizeList.value.map((item) =>
								h(SacoTabPane, {
									key: item.command,
									name: item.command,
									label: item.label,
								}),
							),
					},
				),
			beforeClose: (action, _instance, done) => {
				if (action === 'confirm') {
					settingStore.setFontSize(fontSize.value)
				}
				done()
			},
		})
		return
	}
	if (command === 'language') {
		const selectLanguage = ref(locale.value as Language)
		const switchLoading = ref(false)
		SacoMessageBox({
			title: t('language_switch'),
			confirmButtonText: t('confirm'),
			showCancelButton: true,
			cancelButtonText: t('cancel'),
			customClass: 'language-message-box',
			// 函数每次渲染重跑，才能吃到 fontSize 的最新值
			message: () =>
				h(
					SacoTabs,
					{
						modelValue: selectLanguage.value,
						style: {
							// 列数跟档位走，scss 里写死格子数后面加档会对不齐
							'--language-tab-count': String(i18nLocales.length),
						},
						'onUpdate:modelValue': (name: string | number) => {
							selectLanguage.value = name as Language
						},
						disabled: switchLoading.value,
					},
					{
						default: () =>
							i18nLocales.map((item) =>
								h(SacoTabPane, {
									key: item.code,
									name: item.code,
									label: item.desc,
								}),
							),
					},
				),
			beforeClose: (action, instance, done) => {
				if (action === 'confirm') {
					if (instance.confirmButtonLoading) return
					instance.confirmButtonLoading = true
					instance.cancelButtonDisabled = true
					instance.showClose = false
					instance.closeOnClickModal = false
					instance.closeOnPressEscape = false
					switchLoading.value = true
					request
						.post('/auth/change-language', {
							language: selectLanguage.value,
						})
						.then(async () => {
							done()
							await routerStore.switchLanguageCache(
								selectLanguage.value,
							)
							SacoMessage.success(t('switch_successfully'))
						})
						.finally(() => {
							instance.confirmButtonLoading = false
							instance.cancelButtonDisabled = false
							instance.showClose = true
							instance.closeOnClickModal = true
							instance.closeOnPressEscape = true
							switchLoading.value = false
						})
					return
				}
				done()
			},
		})
		return
	}
}
</script>
<style lang="scss">
.font-size-message-box {
	.saco-message-box__message {
		width: 100%;

		.saco-tabs {
			width: 100%;

			@include tabs-scroll-border(
				$item-size: var(--font-size-tab-count),
				$item-height: 40px,
				$item-font-size: var(--font-size),
				$active-border-width: 4px,
				$active-border-radius: 5px
			);
		}
	}
}

.language-message-box {
	.saco-message-box__message {
		width: 100%;

		.saco-tabs {
			width: 100%;

			@include tabs-scroll-border(
				$item-size: var(--language-tab-count),
				$item-height: 40px,
				$item-font-size: var(--font-size),
				$active-border-width: 5px,
				$active-border-radius: 5px
			);
		}
	}
}
</style>
