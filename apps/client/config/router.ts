import { createAppRouter } from '#/router'
import AppLayout from './Layout.vue'
import Home from '../src/views/home.vue'

export default createAppRouter({
	appTitle: import.meta.env.VITE_APP_TITLE,
	// 登录成功的跳转不再等这两个分包。懒加载时接口已经回来，人还停在登录页
	layout: AppLayout,
	home: {
		name: 'Home',
		path: '/home',
		component: Home,
	},
	login: {
		name: 'Login',
		path: '/login',
		component: () => import('../src/views/login.vue'),
	},
	notFound: {
		name: 'NotFound',
		path: '/:pathMatch(.*)*',
		component: () => import('../src/views/404.vue'),
	},
	modules: import.meta.glob('@/router/*.ts', { eager: true }),
})
