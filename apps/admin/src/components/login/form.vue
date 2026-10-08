<template>
	<SacoForm
		ref="formRef"
		:model="formModel"
		:rules="formRules"
		label-width="0"
		class="login-form"
		:disabled="loading"
		:style="{
			'--login-type-sum': 3,
		}"
	>
		<SacoTabs v-model="activeTab" :before-leave="beforeLeave">
			<SacoTabPane :label="t('login_email_type')" name="email">
				<SacoFormItem prop="email">
					<SacoInput
						v-model.trim="formModel.email"
						:placeholder="$t('email')"
						:clearable="false"
						:maxlength="AUTH_EMAIL_MAX_LENGTH"
						@keydown.enter="handleLogin"
					/>
				</SacoFormItem>
				<SacoFormItem prop="captcha">
					<SacoInput
						v-model.trim="formModel.captcha"
						:placeholder="$t('captcha')"
						:clearable="false"
						@keydown.enter="handleLogin"
					>
						<template #suffix>
							<span
								class="send-btn"
								@mousedown.prevent.stop
								@click.stop="sendCaptcha"
							>
								<SacoText
									:disabled="captchaLoading"
									:type="captchaLoading ? 'info' : 'primary'"
								>
									{{
										captchaLoading
											? t('sending')
											: remaining
												? `${remaining}s`
												: t('send_captcha')
									}}
								</SacoText>
							</span>
						</template>
					</SacoInput>
				</SacoFormItem>
			</SacoTabPane>
			<SacoTabPane :label="t('login_account_type')" name="account" />
			<SacoTabPane :label="t('login_phone_type')" name="phone" />
		</SacoTabs>
		<SacoButton type="primary" :loading="loading" @click="handleLogin">
			{{ t('login') }}
		</SacoButton>
	</SacoForm>
</template>
<script lang="ts" setup name="LoginForm">
import { replaceToHome } from '#/axios'

import type { Language } from '#/i18n'
import { useCountDown } from '#/utils/timing'
import { getDeviceId, getDeviceType } from '#/utils/device'
import { useSettingStore } from '#/store'
const { t, locale } = useI18n()
const settingStore = useSettingStore()
// 表单引用
const formRef = ref<FormExpose | null>(null)
// 表单模型
const formModel = reactive({
	email: '',
	captcha: '',
})
// 表单校验
const formRules = computed<FormRules>(() => ({
	email: [
		{
			required: true,
			message: t('validate_please_enter_any', [t('email')]),
			validator: (value) => {
				if (
					!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
						value,
					)
				) {
					return t('validate_any_incorrect_format', [t('email')])
				}

				return true
			},
			trigger: ['blur'],
		},
	],
	captcha: [
		{
			required: true,
			message: t('validate_please_enter_any', [t('captcha')]),
			validator: (value) => {
				if (value.length != 6) {
					return t('validate_any_length', [t('captcha'), 6])
				}
				return true
			},
			trigger: ['blur'],
		},
	],
}))
// 监听语言切换，清空表单校验
watch(locale, () => {
	nextTick(() => {
		formRef.value?.clearValidate()
	})
})
// 登录方式
const activeTab = ref<TabPaneName>('email')
// 切换登录方式前校验
const beforeLeave = (name: TabPaneName) => {
	if (name === 'account') {
		SacoMessageBox({
			title: t('message'),
			message: t('login_account_not_open_message'),
			confirmButtonText: t('confirm'),
		})
		return false
	}
	if (name === 'phone') {
		SacoMessageBox({
			title: t('message'),
			message: t('login_phone_not_open_message'),
			confirmButtonText: t('confirm'),
		})
		return false
	}
	return true
}
// 验证码状态
const captchaLoading = ref(false)
// 验证码倒计时
const { remaining, running, start } = useCountDown(120)
// 发送验证码
const sendCaptcha = (e: MouseEvent) => {
	e.preventDefault()
	if (captchaLoading.value || running.value) return
	formRef.value?.validateField('email', (valid) => {
		if (!valid) return
		captchaLoading.value = true
		authSendLoginCode({
			email: formModel.email,
			language: locale.value as Language,
		})
			.then(() => {
				SacoMessage.success(t('send_captcha_success_message'))
				start()
			})
			.finally(() => {
				captchaLoading.value = false
			})
	})
}
// 登录
const loading = ref(false)
// 进页就并行取。写在请求参数里会先等类型、再等标识，验证码都填完了点击还要再等这两段
const deviceTypePromise = getDeviceType()
const deviceCodePromise = getDeviceId()
const handleLogin = () => {
	formRef.value?.validate((valid) => {
		if (!valid || loading.value) return
		loading.value = true
		Promise.all([deviceTypePromise, deviceCodePromise])
			.then(([deviceType, deviceCode]) => {
				return authLoginByMail({
					email: formModel.email,
					language: locale.value as Language,
					code: formModel.captcha,
					deviceType,
					deviceCode,
				})
			})
			.then(() => {
				settingStore.setMenuCollapsed(false)
				replaceToHome()
			})
			.catch(() => {
				loading.value = false
			})
	})
}
</script>
<style scoped lang="scss">
.login-form {
	// top: 341px;

	width: 567px;
	height: 467px;
	padding: calc(var(--common-gap) * 7) calc(var(--common-gap) * 6.5) 0
		calc(var(--common-gap) * 5.8);
	border-radius: 30px;
	box-shadow: 0 0 6px 0 var(--sqt-color-primary);
	backdrop-filter: blur(8px);

	:deep(.sqt-tabs) {
		margin-bottom: calc(var(--common-gap) * 0.7);

		@include tabs-scroll-border(
			$item-size: var(--login-type-sum),
			$item-height: 50px,
			$item-font-size: 18px,
			$active-border-width: 5px,
			$active-border-radius: 5px
		);

		.sqt-tabs__item {
			padding: 0 8px;
		}

		.sqt-tabs__content {
			padding-top: calc(var(--common-gap) * 5);

			.sqt-form-item {
				.sqt-input {
					height: 50px;

					input {
						min-width: 0;
					}

					.suffix {
						z-index: 1;
						flex-shrink: 0;
					}

					.send-btn {
						cursor: pointer;
						user-select: none;
					}
				}
			}
		}
	}

	:deep(.sqt-button) {
		width: 100%;
		height: 50px;
		font-size: 18px;
		border-radius: 8px;
	}
}
</style>
<style scoped lang="scss">
@include phone-landscape {
	.login-form {
		width: 500px;
		height: 340px;
		padding: calc(var(--common-gap) * 3) calc(var(--common-gap) * 3) 0
			calc(var(--common-gap) * 2.5);

		:deep(.sqt-tabs) {
			.sqt-tabs__item {
				height: 44px;
			}

			.sqt-tabs__content {
				padding-top: calc(var(--common-gap) * 2);

				.sqt-form-item {
					.sqt-input {
						height: 44px;
					}
				}
			}
		}

		:deep(.sqt-button) {
			height: 44px;
		}
	}
}
</style>
