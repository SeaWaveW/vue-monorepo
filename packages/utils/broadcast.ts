import { onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

type WebChannelName = string
type WebChannelListener = (data: unknown) => void
// 单例缓存（同标签页内复用）
const channelMap = new Map<string, BroadcastChannel>()
// 全局监听器列表（按频道名分组）
const channelListenerMap = new Map<string, Set<WebChannelListener>>()
/**
 * 浏览器页签广播频道
 * @param name 频道名称（请在WebChannelName添加-以便后续工程维护）
 * @returns { on, send }
 */
export const useWebChannel = <T = any>(name: WebChannelName) => {
	// 1. 获取或创建 BroadcastChannel 单例
	let channel = channelMap.get(name)
	if (!channel) {
		channel = new BroadcastChannel(name)
		channelMap.set(name, channel)

		// 初始化监听器集合
		channelListenerMap.set(name, new Set())

		// 绑定全局消息分发（只执行一次）
		channel.onmessage = (e: MessageEvent) => {
			const channelListeners = channelListenerMap.get(name)
			if (channelListeners && channelListeners.size > 0) {
				channelListeners.forEach((fn) => {
					try {
						fn(e.data)
					} catch (error) {
						console.error(
							`[useWebChannel:${name}] 处理消息错误:`,
							error,
						)
					}
				})
			}
		}

		// 可选：错误处理
		channel.onmessageerror = (e: Event) => {
			console.error(`[useWebChannel:${name}] 消息解析错误:`, e)
		}

		console.log(`[${name}] 频道已创建`)
	}

	// 2. 获取当前频道的监听器集合
	const channelListeners = channelListenerMap.get(name)!
	// 3. 记录当前组件添加的监听器（用于卸载时清理）
	const currentListeners = new Set<WebChannelListener>()

	// 4. 组件卸载时清理
	onUnmounted(() => {
		// 移除当前组件添加的所有监听器
		currentListeners.forEach((fn) => {
			channelListeners.delete(fn)
		})
		currentListeners.clear()

		// 如果没有监听器了，关闭并清理频道
		if (!channelListeners.size) {
			const ch = channelMap.get(name)
			if (ch) {
				ch.close()
				channelMap.delete(name)
				channelListenerMap.delete(name)
				console.log(`[${name}] 频道已关闭（无监听器）`)
			}
		}
	})

	return {
		/**
		 * 监听消息
		 * @param fn 回调函数
		 * @returns 取消监听函数
		 */
		on: <K = T>(fn: (data: K) => void) => {
			const wrappedFn = fn as WebChannelListener
			// 防止重复添加
			if (channelListeners.has(wrappedFn)) {
				console.warn(`[${name}] 监听器已存在，跳过添加`)
				return () => {}
			}

			// 添加到全局监听器
			channelListeners.add(wrappedFn)
			// 记录到当前组件
			currentListeners.add(wrappedFn)
			// 返回取消监听函数
			return () => {
				channelListeners.delete(wrappedFn)
				currentListeners.delete(wrappedFn)
			}
		},

		/**
		 * 发送消息到同频道的所有标签页
		 * @param data 消息数据
		 */
		send: <K = T>(data: K) => {
			const ch = channelMap.get(name)
			if (!ch) {
				console.warn(`[${name}] 频道已关闭，无法发送消息`)
				return
			}

			try {
				ch.postMessage(data)
			} catch (error) {
				console.error(`[${name}] 发送消息失败:`, error)
			}
		},
	}
}

type SameChannelName = string
type SameChannelListener = (data: unknown, params?: unknown) => void
// 全局监听器列表（按频道名 -> 路径 -> 监听器集合）
const sessionListenerMap = new Map<
	string,
	Map<string, Set<SameChannelListener>>
>()
/**
 * 相同页签广播频道
 * @param name 频道名称（请在SameChannelName添加-以便后续工程维护）
 * @param params ?选择性传入
 * @returns { on, send }
 */
export const useSameChannel = <T = any, P = any>(
	name: SameChannelName,
	params?: P,
) => {
	const { path } = useRoute()
	// 2. 初始化监听器集合
	const sessionKey = `same_${name}`
	if (!sessionListenerMap.get(sessionKey)) {
		sessionListenerMap.set(sessionKey, new Map())
	}
	// 2. 获取当前频道的监听器集合
	const sessionListeners = sessionListenerMap.get(sessionKey)!
	// 3. 当前路径的监听器集合
	if (!sessionListeners.has(path)) {
		sessionListeners.set(path, new Set())
	}
	const currentPathListeners = sessionListeners.get(path)!
	// 4. 存储当前组件添加的监听器（用于卸载时清理）
	const componentListeners = new Set<SameChannelListener>()

	// 5. 组件卸载时清理
	onUnmounted(() => {
		// 移除当前组件添加的所有监听器
		componentListeners.forEach((fn) => {
			currentPathListeners.delete(fn)
		})
		componentListeners.clear()
		// 如果该路径没有监听器了，删除该路径
		if (!currentPathListeners.size) {
			sessionListeners.delete(path)
		}
		// 如果没有监听器了，关闭并清理频道
		if (!sessionListeners.size) {
			sessionListenerMap.delete(sessionKey)
		}
	})

	return {
		/**
		 * 监听消息
		 * @param fn 回调函数
		 * @returns 取消监听函数
		 */
		on: <K = T>(fn: (data: K, params: P) => void) => {
			const wrappedFn = fn as SameChannelListener
			// 去重检查1：是否已在当前路径的监听器中
			if (currentPathListeners.has(wrappedFn)) {
				console.warn(`[${name}:${path}] 监听器已在全局存在，跳过添加`)
				return () => {}
			}
			// 去重检查2：是否已在当前组件中
			if (componentListeners.has(wrappedFn)) {
				console.warn(
					`[${name}:${path}] 当前组件已添加该监听器，跳过添加`,
				)
				return () => {}
			}
			// 添加到路径监听器
			currentPathListeners.add(wrappedFn)
			// 记录到当前组件
			componentListeners.add(wrappedFn)
			// 返回取消监听函数
			return () => {
				currentPathListeners.delete(wrappedFn)
				componentListeners.delete(wrappedFn)
				// 如果该路径没有监听器了，删除该路径
				if (!currentPathListeners.size) {
					sessionListeners.delete(path)
				}
				// 如果该频道没有任何路径了，删除整个频道
				if (!sessionListeners.size) {
					sessionListenerMap.delete(sessionKey)
				}
			}
		},

		/**
		 * 发送消息到同频道的其它 path（不含自己）
		 * @param data 消息数据
		 */
		send: <K = T>(data: K) => {
			for (const [key, value] of sessionListeners) {
				if (key !== path) {
					value.forEach((fn) => {
						try {
							fn(data, params)
						} catch (error) {
							console.error(
								`[useSameChannel:${name}] 处理消息错误:`,
								error,
							)
						}
					})
				}
			}
		},
	}
}
