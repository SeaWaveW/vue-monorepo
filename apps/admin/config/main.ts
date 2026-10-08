// import '#/monitor'
import { createApp } from 'vue'
import '#/style.scss'
import App from './App.vue'
import router from './router'
import { pinia } from '#/pinia'
import { i18n } from '#/i18n'
import { themePlugin } from '#/theme'
import { asyncRegister } from '#/dynamic'

const app = createApp(App)
app.use(pinia)
app.use(i18n)
app.use(themePlugin)
app.use(router)
app.use(asyncRegister)
app.mount('#app')
