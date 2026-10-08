import { createMonitor } from '@saco/monitor'

const monitor = createMonitor({
	dsn: 'https://www.baidu.com',
	method: 'post',
	app: 'web',
	env: 'development',
	reportType: 'timer',
	interval: 1000 * 60 * 2, // 两分钟
})

monitor.use({
	type: 'error',
	install: (ctx) => {
		ctx.use({
			transform: (data) => data,
			watch: (dataList) => {
				console.log('[monitor:error]', dataList)
			},
		})
	},
})
monitor.use({
	type: 'http',
	install: (ctx) => {
		ctx.use({
			transform: (data) => data,
			watch: (dataList) => {
				console.log('[monitor:http]', dataList)
			},
		})
	},
})
monitor.start()

export default monitor
