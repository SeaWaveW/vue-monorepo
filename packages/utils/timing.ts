import { onUnmounted, ref, type Ref } from 'vue'

export interface CountdownReturn {
	/** 剩余秒数（整数，切后台回来按真实经过时间校正） */
	remaining: Ref<number>
	/** 是否正在倒计时 */
	running: Ref<boolean>
	/** 开始；不传则用创建时的 `time` */
	start: (duration?: number) => void
	/** 取消当前 rAF，停在当前剩余秒 */
	stop: () => void
}

/**
 * 用 requestAnimationFrame 做秒级倒计时
 * @param time 时长（秒）。须在 setup 里调用一次，组件卸载会自动 stop
 * @returns remaining / running / start / stop
 */
export const useCountDown = (time: number): CountdownReturn => {
	const remaining = ref(0)
	const running = ref(false)
	let rafId = 0
	let endAt = 0
	let lastSeconds = -1

	const clearRaf = () => {
		if (!rafId) return
		cancelAnimationFrame(rafId)
		rafId = 0
	}

	const tick = (now: number) => {
		const seconds = Math.max(0, Math.ceil((endAt - now) / 1000))
		if (seconds !== lastSeconds) {
			lastSeconds = seconds
			remaining.value = seconds
		}
		if (seconds <= 0) {
			running.value = false
			rafId = 0
			return
		}
		rafId = requestAnimationFrame(tick)
	}

	const stop = () => {
		clearRaf()
		running.value = false
	}

	const start = (duration = time) => {
		clearRaf()
		const seconds = Math.max(0, Math.ceil(duration))
		remaining.value = seconds
		lastSeconds = seconds
		if (seconds <= 0) {
			running.value = false
			return
		}
		running.value = true
		endAt = performance.now() + seconds * 1000
		rafId = requestAnimationFrame(tick)
	}

	onUnmounted(stop)

	return { remaining, running, start, stop }
}
