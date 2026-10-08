<template>
	<Teleport to=".layout-footer" defer :disabled="disabled">
		<slot />
	</Teleport>
</template>
<script lang="ts" setup name="CommonTeleportFooter">
import { onActivated, onDeactivated, ref } from 'vue'

const disabled = ref(false)

onActivated(() => {
	disabled.value = false
})
onDeactivated(() => {
	disabled.value = true
})
</script>
