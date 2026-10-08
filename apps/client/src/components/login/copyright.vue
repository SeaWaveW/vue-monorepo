<template>
	<div class="login-copyright">
		<SacoText>© {{ year }} GZST. All rights reserved.</SacoText>
		<a
			class="login-copyright__beian"
			href="https://beian.miit.gov.cn/"
			target="_blank"
			rel="noopener noreferrer"
		>
			<img :src="emblem" alt="copyright" />
			<SacoText>粤ICP备17043442号-1</SacoText>
		</a>
	</div>
</template>
<script lang="ts" setup name="LoginCopyright">
import emblem from '#/assets/img/national_emblem.png'
const year = new Date().getFullYear()
</script>
<style scoped lang="scss">
.login-copyright {
	display: flex;
	gap: calc(var(--common-gap) * 1.5);
	align-items: center;
	justify-content: center;
	color: var(--black-color);

	.login-copyright__beian {
		display: flex;
		gap: calc(var(--common-gap) / 2);
		align-items: center;
		color: inherit;
		color: var(--black-color);
		text-decoration: none;
		cursor: pointer;

		$size: 21px;

		img {
			width: $size;
			height: $size;
		}
	}
}
</style>
