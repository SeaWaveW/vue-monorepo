<template>
	<Teleport to="body">
		<SacoOverlay
			v-if="visible"
			overlay-class="rotate"
			mask
			:z-index="10000"
		>
			<div class="rotate__panel">
				<SacoSvg class="rotate__icon" name="rotate-screen" />
				<div class="rotate__copy">
					<p class="rotate__title">{{ t('place_ratote_screen') }}</p>
					<p class="rotate__text">{{ t('rotate_screen_message') }}</p>
				</div>
			</div>
		</SacoOverlay>
	</Teleport>
</template>
<script lang="ts" setup name="CommonRotateScreen">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfigProvide } from '@saco/ui/es/components/config-provide'
import { SacoOverlay } from '@saco/ui/es/components/overlay'
import { SacoSvg } from '@saco/ui/es/components/svg'
// 横屏铺满 visualViewport，并锁住聚焦放大。跟组件走，不靠外面的 install 再引一次
import './viewport-size'

const { t } = useI18n()
/** 和原先竖屏旋转选择器同一条件：非 PC 且竖屏。PC 窗口再窄也不挡 */
const config = useConfigProvide()
/**
 * 不能关掉：点遮罩会把按横屏画的页面露出来。
 * 设备转到横屏后这里卸掉。
 */
const visible = computed(
	() => !config.value.web.isPc && config.value.web.isPortrait,
)
</script>
<style scoped lang="scss">
.rotate {
	display: flex;
	align-items: center;
	justify-content: center;

	// 10px：postcss 只把小写 px 转 rem，模糊要保持 10 设备像素
	backdrop-filter: blur(10px);

	.rotate__panel {
		display: flex;
		flex-direction: column;
		gap: 20px;
		align-items: center;
		max-width: calc(100vw - 24px);
		color: var(--white-color);
		text-align: center;

		.rotate__icon {
			// 64px：手机上 1rem 被压到约 9px，72px 会缩成小图标
			font-size: 128px;
		}

		.rotate__copy {
			display: flex;
			flex-direction: column;
			gap: 10px;
			align-items: center;
			max-width: 100%;

			.rotate__title {
				margin: 0;
				font-size: 34px;
				font-weight: var(--font-bold);
				line-height: 1.3;
				white-space: nowrap;
			}

			.rotate__text {
				margin: 0;
				font-size: 30px;
				line-height: 1.3;
				white-space: nowrap;
			}
		}
	}
}
</style>
