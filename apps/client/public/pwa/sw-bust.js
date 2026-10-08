/** 同步挂在 head：只有应用模块脚本加载失败才卸 SW，不清全站 Cache、不 navigate */
;(function () {
	let bustKey = 'saco-sw-bust'
	let isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname)
	window.addEventListener(
		'error',
		function (e) {
			let el = e.target
			let src = (el && el.src) || ''
			if (!el || el.tagName !== 'SCRIPT') return
			if (!/\/static\//.test(src) && !/\.js(\?|$)/.test(src)) return
			if (isLocal || sessionStorage.getItem(bustKey)) return
			sessionStorage.setItem(bustKey, '1')
			let reload = function () {
				location.reload()
			}
			if (!navigator.serviceWorker) {
				reload()
				return
			}
			navigator.serviceWorker
				.getRegistrations()
				.then(function (regs) {
					return Promise.all(
						regs.map(function (reg) {
							return reg.unregister()
						}),
					)
				})
				.then(reload, reload)
		},
		true,
	)
})()
