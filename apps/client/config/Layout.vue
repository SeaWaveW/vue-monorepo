<template>
	<CommonLayout :favorite="favorite" />
</template>
<script lang="ts" setup name="AppLayout">
import CommonLayout from '#/layout/index.vue'
import type { LayoutFavoriteApi } from '#/layout/types'

const favorite: LayoutFavoriteApi = {
	create: clientFavoriteNavigationCreate,
	delete: clientFavoriteNavigationDelete,
	sort: clientFavoriteNavigationSort,
	list: clientFavoriteNavigationList,
}
</script>
