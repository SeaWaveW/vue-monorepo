/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

import 'vue'

declare module 'vue' {
	interface HTMLAttributes {
		[key: `data-${string}`]: string | number | boolean | undefined
	}
	interface InputHTMLAttributes {
		webkitdirectory?: boolean | string
	}
}
