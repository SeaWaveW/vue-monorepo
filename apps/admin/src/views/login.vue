<template>
	<div class="login-page">
		<LoginCanvans />
		<div class="login-container">
			<LoginHeader />
			<div class="form-context">
				<LoginForm />
			</div>
			<LoginCopyright class="copyright-context" />
		</div>
	</div>
</template>
<script lang="ts" setup name="Login">
import LoginCanvans from '@/components/login/canvans.vue'
import LoginHeader from '@/components/login/header.vue'
import LoginForm from '@/components/login/form.vue'
import LoginCopyright from '@/components/login/copyright.vue'
</script>
<style scoped lang="scss">
.login-page {
	position: relative;
	width: 100%;
	height: 100%;

	--gap-size: 60px;

	.login-container {
		position: absolute;
		top: 0;
		right: 85px;
		bottom: 0;
		z-index: 8;
		display: flex;
		flex-direction: column;
		gap: var(--gap-size);
		align-items: center;

		.form-context {
			flex: 1;
		}

		.copyright-context {
			margin-bottom: calc(var(--gap-size) * 0.6666);
		}
	}
}
</style>
<style scoped lang="scss">
// 横屏只收段间距，布局仍是右上标题、中间表单、底部版权
@include phone-landscape {
	.login-page {
		--gap-size: 12px;

		.login-container {
			.copyright-context {
				margin-bottom: 8px;
			}
		}
	}
}
</style>
