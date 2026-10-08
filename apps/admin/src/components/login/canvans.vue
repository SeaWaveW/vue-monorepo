<template>
	<div class="login-canvas"></div>
</template>
<script lang="ts" setup name="LoginCanvans"></script>
<style scoped lang="scss">
.login-canvas {
	display: block;
	width: 100%;
	height: 100%;
	color: var(--login-card-text-color);
	text-align: center;
	pointer-events: none;
	background-image: url('#/assets/img/admin_login_bg.webp');

	/* 与 canvas cover+左对齐一致：decode 完成前先铺底图，避免 mount 前白屏 */
	background-repeat: no-repeat;
	background-position: left center;
	background-size: cover;
}
</style>
