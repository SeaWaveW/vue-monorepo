import { AuthDeviceType } from '../api/enum/auth/device-type'

/** 获取设备唯一标识 */
export const getDeviceId = async () => {
	const Device = await import('@capacitor/device')
	const device = await Device.Device.getId()
	return device.identifier
}

/** 获取设备类型。取值跟登录接口的 AuthDeviceType 一致，不要再写字符串 */
export const getDeviceType = async (): Promise<AuthDeviceType> => {
	const { Device } = await import('@capacitor/device')
	const info = await Device.getInfo()
	const { platform, model = '', operatingSystem } = info

	// ---------- 原生 iOS ----------
	if (platform === 'ios') {
		if (model.toLowerCase().includes('ipad')) return AuthDeviceType.Tablet
		return AuthDeviceType.Mobile
	}

	// ---------- 原生 Android ----------
	if (platform === 'android') {
		// 使用屏幕最小边判断（CSS 像素）
		if (typeof window !== 'undefined') {
			const minSize = Math.min(window.innerWidth, window.innerHeight)
			if (minSize >= 600) return AuthDeviceType.Tablet
		}
		return AuthDeviceType.Mobile
	}

	// ---------- Web 环境（浏览器 / Electron / PWA 等） ----------
	if (platform === 'web') {
		const os = operatingSystem?.toLowerCase()

		// 1. 明确是桌面操作系统 → PC
		if (os === 'mac' || os === 'windows' || os === 'linux') {
			return AuthDeviceType.Pc
		}

		// 2. 如果是 Android / iOS 移动浏览器，或 unknown，则用屏幕尺寸兜底
		if (typeof window !== 'undefined') {
			const minSize = Math.min(window.innerWidth, window.innerHeight)
			if (minSize >= 768) return AuthDeviceType.Pc // 大屏（如桌面宽屏）
			if (minSize >= 600) return AuthDeviceType.Tablet
			return AuthDeviceType.Mobile
		}

		// 3. SSR 或无 window 环境（如 Node）
		return AuthDeviceType.Pc
	}

	// fallback
	return AuthDeviceType.Mobile
}
