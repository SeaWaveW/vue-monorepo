<template>
	<div class="login-header">
		<div class="project-box">
			<img :src="logo" alt="logo" />
			<span>{{ t('backend_name') }}</span>
		</div>
		<SacoTabs
			v-model="language"
			class="language-box"
			:style="{
				'--language-sum': i18nLocales.length,
			}"
		>
			<SacoTabPane
				v-for="item in i18nLocales"
				:key="item.code"
				:label="item.desc"
				:name="item.code"
			/>
		</SacoTabs>
	</div>
</template>
<script lang="ts" setup name="LoginHeader">
import logo from '#/assets/img/logo.png'
import { i18nLocales, useI18nLanguage } from '#/i18n'
const { t } = useI18n()
const language = useI18nLanguage() as Ref<TabPaneName>
</script>
<style scoped lang="scss">
.login-header {
	display: flex;
	flex-direction: column;
	gap: var(--gap-size);
	align-items: center;
	justify-content: center;

	.project-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;

		img {
			width: 272px;
			height: 152px;
			user-select: none;
			transform: translateY(10%);
		}

		span {
			font-size: 28px;
			font-weight: var(--font-bold);
			color: var(--main-color-2);
			backdrop-filter: blur(1px);
		}
	}

	:deep(.sqt-tabs) {
		width: calc(var(--language-sum) * 145px);

		@include tabs-scroll-border(
			$item-size: var(--language-sum),
			$item-height: 50px,
			$item-font-size: 18px,
			$active-border-width: 5px,
			$active-border-radius: 5px
		);
	}
}
</style>
<style scoped lang="scss">
// 横屏缩小标题和语言切换
@include phone-landscape {
	.login-header {
		.project-box {
			transform: translateY(-10%);

			img {
				width: 240px;
				height: 136px;
			}

			span {
				font-size: 24px;
			}
		}

		:deep(.sqt-tabs) {
			.sqt-tabs__item {
				height: 44px;
			}
		}
	}
}
</style>
