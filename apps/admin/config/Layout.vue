<template>
	<CommonLayout :favorite="favorite" />
</template>
<script lang="ts" setup name="AppLayout">
import CommonLayout from '#/layout/index.vue'
import type { LayoutFavoriteApi } from '#/layout/types'

const favorite: LayoutFavoriteApi = {
	create: adminFavoriteNavigationCreate,
	delete: adminFavoriteNavigationDelete,
	sort: adminFavoriteNavigationSort,
	list: adminFavoriteNavigationList,
}
</script>
