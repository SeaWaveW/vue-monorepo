<template>
	<SacoPopper
		v-model="visible"
		trigger="click"
		placement="bottom"
		append-to-body
		:fit-reference-width="false"
		popper-class="avatar-popper"
	>
		<template #reference>
			<img
				class="layout-avatar"
				:src="avatarSrc"
				:alt="userStore.userName"
				@error="onAvatarError"
			/>
		</template>
		<div class="avatar-wrapper">
			<div class="avatar-img">
				<CommonImagePreview
					:src="avatarSrc"
					:alt="userStore.userName"
					radius="20px"
				/>
			</div>
			<SacoForm
				class="avatar-info"
				label-position="right"
				label-suffix="："
			>
				<SacoFormItem :label="t('username')" prop="userName">
					{{ leachFormatter(userStore.userName) }}
				</SacoFormItem>
				<SacoFormItem :label="t('mobile_phone_number')" prop="phone">
					{{ phoneFormatter(userStore.phone) }}
				</SacoFormItem>
				<SacoFormItem :label="t('email_address')" prop="email">
					{{ leachFormatter(userStore.email) }}
				</SacoFormItem>
				<SacoButton
					class="avatar-info__logout"
					type="primary"
					@click="handleLogout"
				>
					{{ t('log_out') }}
				</SacoButton>
			</SacoForm>
		</div>
	</SacoPopper>
</template>
<script lang="ts" setup name="LayoutAvatar">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { SacoPopper } from '@saco/ui/es/components/popper'
import { SacoForm } from '@saco/ui/es/components/form'
import { SacoFormItem } from '@saco/ui/es/components/form-item'
import { SacoButton } from '@saco/ui/es/components/button'
import { SacoLoading } from '@saco/ui/es/components/loading'
import { useUserStore } from '../../store'
import { leachFormatter, phoneFormatter } from '../../utils/formatter'
import { clearAuthStorage, replaceToLogin, request } from '../../axios'
import defaultAvatar from '../../assets/img/avatar.png'
import CommonImagePreview from '../../components/image-preview/index.vue'

const { t } = useI18n()
const userStore = useUserStore()
/** hover 显隐跟 Popper v-model 同步，不点开 */
const visible = ref(false)
/** 远程头像挂了回落默认图；换 url 时清掉，避免一直停在默认图 */
const avatarFailed = ref(false)

/** 没配 / 加载失败用本地默认图，空 src 会出裂图 */
const avatarSrc = computed(() => {
	if (avatarFailed.value || !userStore.avatarUrl) return defaultAvatar
	return userStore.avatarUrl
})

watch(
	() => userStore.avatarUrl,
	() => {
		avatarFailed.value = false
	},
)

const onAvatarError = () => {
	avatarFailed.value = true
}

/** 全屏 loading 挂 body；directive.mounted 没有 close */
const handleLogout = () => {
	const loading = SacoLoading.service({
		fullscreen: true,
		lock: true,
	})
	request
		.post('/auth/logout')
		.then(() => {
			clearAuthStorage()
			replaceToLogin()
		})
		.finally(() => {
			loading.close()
		})
}
</script>
<style scoped lang="scss">
.layout-avatar {
	$size: 38px;

	display: block;
	width: $size;
	height: $size;
	cursor: pointer;
	object-fit: cover;
	border-radius: 50%;
}
</style>
<style lang="scss">
/** append-to-body，不能 scoped，套进 .layout-avatar 会丢 */
.avatar-popper {
	.avatar-wrapper {
		display: flex;
		gap: 20px;
		align-items: center;

		.avatar-img {
			width: 200px;
			padding-left: 30px;
		}

		.avatar-info {
			display: grid;

			// 列宽跟最长 label 走，换语言不用再估 label-width
			grid-template-columns: max-content minmax(80px, 1fr);
			align-items: center;
			width: max-content;
			min-width: 240px;
			padding: calc(var(--common-gap) * 1.2) calc(var(--common-gap) * 1.6);

			.saco-form-item {
				display: contents;
				margin-bottom: 0;
			}

			.saco-form-item__label,
			.saco-form-item__content {
				// Popper 内容默认 user-select:none，资料要能拖选复制
				cursor: text;
				user-select: text;
			}

			.saco-form-item__label {
				justify-content: flex-end;
				text-align: right;
			}

			.saco-form-item__content {
				display: flex;
				align-items: center;
				word-break: normal;
			}

			.avatar-info__logout {
				grid-column: 1 / -1;
				width: 100%;
				margin: calc(var(--common-gap) * 2) 0
					calc(var(--common-gap) * 0.8);
			}
		}
	}
}
</style>
