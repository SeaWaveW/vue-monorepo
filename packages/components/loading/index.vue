<template>
	<div class="common-loading">
		<SacoSvg class="common-loading__icon" name="loading" />
	</div>
</template>
<script lang="ts" setup name="CommonLoading">
import { SacoSvg } from '@saco/ui/es/components/svg'
</script>
<style scoped lang="scss">
.common-loading {
	// 类名挂在 SacoSvg 根上，不用 :deep(.saco-svg)，前缀改了也不会脱钩
	.common-loading__icon {
		font-size: 44px;
		animation: common-loading-rotate 1.2s linear infinite;
	}

	@at-root {
		@keyframes common-loading-rotate {
			to {
				transform: rotate(360deg);
			}
		}
	}
}
</style>
