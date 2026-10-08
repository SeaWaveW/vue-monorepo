export {}

declare global {
	interface ImportMetaEnv {
		readonly VITE_APP_TITLE: string
		readonly VITE_APP_API: string
		readonly VITE_CONSOLE: boolean
		readonly VITE_ALI_OSS_UPLOAD_URL: string
		/** 打包插件写入，和站点根 version.json 的 data 是同一串 */
		readonly VITE_APP_BUILD_VERSION?: string
	}
}
