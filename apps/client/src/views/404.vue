<template>
	<div class="not-found">
		<div class="container">
			<h1>{{ t('not_found') }}</h1>
			<SacoButton type="primary" @click="toHome">
				{{ t('back_home') }}
			</SacoButton>
		</div>
	</div>
</template>
<script lang="ts" setup name="NotFound">
const { t } = useI18n()
const router = useRouter()
const toHome = () => {
	router.push('/')
}
</script>
<style scoped lang="scss">
.not-found {
	display: flex;
	align-items: center;
	justify-content: center;

	.container {
		display: flex;
		flex-direction: column;
		gap: calc(var(--common-gap) * 2);
		align-items: center;
	}
}
</style>
