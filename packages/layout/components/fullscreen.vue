<template>
	<SacoSvg
		class="layout-header__tool"
		:name="isFullscreen ? 'unfull-screen' : 'full-screen'"
		@click="toggleFullscreen"
	/>
</template>
<script lang="ts" setup name="LayoutFullscreen">
import { SacoSvg } from '@saco/ui/es/components/svg'
import { useWebFullscreen } from '../utils/webFullscreen'
const { isFullscreen, toggleFullscreen } = useWebFullscreen()
</script>
