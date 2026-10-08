import { defineConfig, ConfigEnv, UserConfig, loadEnv } from 'vite'
import path from 'path'
import fs from 'node:fs'
import VitejsPluginVue from '@vitejs/plugin-vue'
import {
	createViteOutputs,
	sacoCommonOptimizeDeps,
	sacoCommonResolve,
	sacoCommonViteEnv,
} from '../../packages/vite/index.ts'
import { createHtmlPlugin as VitePluginHtml } from 'vite-plugin-html'
import VitePluginVueSetupExtend from 'vite-plugin-vue-setup-extend'
import VitejsPluginVueJsx from '@vitejs/plugin-vue-jsx'
import UnpluginAutoImportVite from 'unplugin-auto-import/vite'
import UnpluginVueComponentsVite from 'unplugin-vue-components/vite'
import { SacoUiResolver, SacoUiPlugin } from '@saco/ui/resolver'
import {
	SacoCommonResolver,
	sacoCommonAutoImports,
	sacoCommonScssAdditionalData,
} from '../../packages/vite/resolver.ts'
import { visualizer as RoullupPluginVisualizer } from 'rollup-plugin-visualizer'
import ViteCompression2 from 'vite-plugin-compression2'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { VitePWA } from 'vite-plugin-pwa'
import { vitePlugin } from '@saco/rem-plugin/plugin'
import vitePluginConsole from 'vite-plugin-console'
import { commonAliasPlugin } from '../../packages/vite/alias.ts'

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
	const env = loadEnv(mode, process.cwd())
	const {
		assetsFileOutput,
		chunkFileNamesOutput,
		codeSplittingOutput,
		pwaGlobIgnores,
		modulePreloadResolveDependencies,
		buildVersionPlugin,
	} = createViteOutputs({
		root: import.meta.dirname,
	})
	const pwaOptions = readPwaPluginOptions(env.VITE_APP_API)

	return {
		envPrefix: ['VITE_'],
		resolve: sacoCommonResolve({
			// 勿把 .d.ts 放前面，否则目录解析会吃到声明文件当运行时模块
			extensions: ['.mjs', '.js', '.ts', '.tsx', '.vue', '.json'],
			alias: {
				'@': path.resolve(import.meta.dirname, './src'),
			},
		}),
		css: {
			devSourcemap: mode !== 'production',
			preprocessorOptions: {
				scss: {
					additionalData: sacoCommonScssAdditionalData(),
				},
			},
		},
		server: {
			port: 9999,
			host: true,
			allowedHosts: true,
			strictPort: true,
			open: false,
			cors: true,
			ws: {
				clientPort: 9999,
			},
			// SW 在 /pwa/sw.js，要管整站必须放宽 max scope（生产响应头同样要带 Service-Worker-Allowed: /）
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Service-Worker-Allowed': '/',
			},
			fs: {
				allow: [
					path.resolve(import.meta.dirname, '../..'),
					// 本地 link 的包在仓库外；不放行的话 /@fs 读不到 saco-ui 里的 svg
					path.resolve(import.meta.dirname, '../../../saco-ui'),
				],
			},
			proxy: {
				[env.VITE_APP_API]: {
					target: 'https://dev-review-admin.gzst-test.com',
					changeOrigin: true,
					// 测试域接口本身带 /api；rewrite 剥掉后会打到 /auth/* → 405
					// 若本地后端无 /api 前缀，再打开下面 rewrite
					// rewrite: (requestPath) =>
					// 	requestPath.replace(new RegExp('^\\' + env.VITE_APP_API), ''),
				},
			},
		},
		preview: {
			headers: {
				'Service-Worker-Allowed': '/',
			},
		},
		optimizeDeps: sacoCommonOptimizeDeps({
			include: [
				'dayjs',
				'qs',
				'echarts/core',
				'echarts/charts',
				'echarts/components',
				'echarts/renderers',
			],
		}),
		build: {
			// 图标是按需 import()；预加载会把全站扫到的小块在进壳时全拉
			modulePreload: {
				resolveDependencies: modulePreloadResolveDependencies,
			},
			// Vite 8 / Rolldown 默认 oxc 压缩，比 terser 快一个数量级
			minify: true,
			reportCompressedSize: false,
			rollupOptions: {
				input: {
					index: path.resolve(
						import.meta.dirname,
						'public/index.html',
					),
				},
				output: {
					chunkFileNames: chunkFileNamesOutput,
					entryFileNames: 'static/js/[name]-[hash].js',
					assetFileNames: (file) =>
						assetsFileOutput(file.name as string),
					codeSplitting: codeSplittingOutput,
				},
			},
			sourcemap: mode !== 'production',
			chunkSizeWarningLimit: 1500,
		},
		plugins: [
			commonAliasPlugin(),
			// 打包写 version.json，并和页面里的版本号用同一串
			buildVersionPlugin,
			// 须靠前：把 common axios baseURL 内联成 /api，避免 link 包 env 读空 → 405
			sacoCommonViteEnv(env),
			vitePlugin({
				designWidth: 1920,
				rootValue: 16,
				minRoot: 10,
				maxRoot: 16,
			}),
			VitejsPluginVue({
				script: {
					defineModel: true,
					propsDestructure: true,
				},
			}),
			// vite-plugin-html 在 Windows 上把 `/` 重写成盘符路径，开发时直接回 index
			{
				name: 'admin-index-html',
				configureServer(server) {
					server.middlewares.use(async (req, res, next) => {
						const pathname = req.url?.split('?')[0]
						if (pathname !== '/' && pathname !== '/index.html') {
							next()
							return
						}
						const file = path.resolve(
							import.meta.dirname,
							'public/index.html',
						)
						const raw = fs.readFileSync(file, 'utf8')
						const html = await server.transformIndexHtml(
							pathname || '/',
							raw,
						)
						res.statusCode = 200
						res.setHeader(
							'Content-Type',
							'text/html; charset=utf-8',
						)
						res.end(html)
					})
				},
			},
			VitePluginHtml({
				minify: true,
				entry: '/config/main.ts',
				template: 'public/index.html',
				inject: {
					data: {
						title: env.VITE_APP_TITLE,
						pwaColor: pwaOptions.pwaColor,
						blackColor: pwaOptions.blackColor,
					},
				},
			}),
			VitePluginVueSetupExtend({}),
			VitejsPluginVueJsx(),
			UnpluginAutoImportVite({
				imports: sacoCommonAutoImports('vue', 'vue-router', 'vue-i18n'),
				dts: path.resolve(
					import.meta.dirname,
					'./.types/auto-imports.d.ts',
				),
				vueTemplate: true,
				dirs: [
					// 两端共用的 auth / oss。不扫这里，登录和权限函数不会自动导入
					path.resolve(import.meta.dirname, '../../packages/api'),
					path.resolve(import.meta.dirname, '../../packages/api/length/**'),
					'src/api',
					'src/api/types/**',
					'src/api/paths/**',
					'src/api/length/**',
					'src/api/enum/**',
					'src/utils',
				],
				dirsScanOptions: {
					fileFilter: (file: string) =>
						!/[\\/]api[\\/]types[\\/]index\.d\.ts$/.test(file),
				},
			}),
			SacoUiPlugin({
				// 图标 Extra 和 v-loading / v-power 写在这一份。不传会落到应用根目录的 saco-ui.d.ts
				dts: path.resolve(import.meta.dirname, './.types/saco-ui.d.ts'),
				// 图标都在 packages/assets，两端不再各放一份 src/assets/svg
				svgDirs: [
					path.resolve(
						import.meta.dirname,
						'../../packages/assets/svg',
					),
					// 国旗在子目录；插件只扫一层，不单独配就没有 cn / us
					path.resolve(
						import.meta.dirname,
						'../../packages/assets/svg/country',
					),
				],
			}),
			UnpluginVueComponentsVite({
				dts: path.resolve(
					import.meta.dirname,
					'./.types/auto-components.d.ts',
				),
				syncMode: 'append',
				resolvers: [
					SacoUiResolver({ importStyle: 'sass' }),
					SacoCommonResolver(),
				],
				dirs: [],
			}),
			ViteImageOptimizer({
				test: /\.(jpe?g|png|gif|webp|avif)$/i,
				png: {
					quality: 75,
					compressionLevel: 9,
					palette: true,
				},
				jpeg: { quality: 75, mozjpeg: true },
				jpg: { quality: 75, mozjpeg: true },
				// webp: { quality: 75 },
			}),
			ViteCompression2({
				algorithms: ['gzip'],
				exclude: [
					/(visualizer|index).html$/,
					/favicon.svg$/,
					/sw\.js$/,
					/sw-bust\.js$/,
					/workbox-.*\.js$/,
					/manifest\.webmanifest$/,
				],
			}),
			RoullupPluginVisualizer({
				filename: 'visualizer.html',
				emitFile: true,
				gzipSize: true,
				open: false,
			}),
			VitePWA({
				registerType: 'prompt',
				injectRegister: false,
				filename: 'pwa/sw.js',
				manifestFilename: 'pwa/manifest.webmanifest',
				includeAssets: ['favicon.svg'],
				manifest: {
					name: env.VITE_APP_TITLE,
					short_name: env.VITE_APP_TITLE,
					theme_color: pwaOptions.pwaColor,
					background_color: pwaOptions.whiteColor,
					display: 'standalone',
					start_url: '/',
					scope: '/',
					lang: 'zh-CN',
					icons: [
						{
							src: '/pwa/192x192.png',
							sizes: '192x192',
							type: 'image/png',
							purpose: 'any',
						},
						{
							src: '/pwa/512x512.png',
							sizes: '512x512',
							type: 'image/png',
							purpose: 'any',
						},
						{
							src: '/pwa/pwa-512x512.png',
							sizes: '512x512',
							type: 'image/png',
							purpose: 'maskable',
						},
					],
				},
				workbox: {
					cleanupOutdatedCaches: true,
					// 只预缓存壳：index.html 变了就是新版；带 hash 的块走 HTTP，不进 SW
					globPatterns: [
						'index.html',
						'favicon.svg',
						'pwa/*.webmanifest',
						'pwa/192x192.png',
					],
					globIgnores: [...pwaGlobIgnores, '**/pwa/sw-bust.js'],
					// SW 在 /pwa/，相对路径会解析成 /pwa/static/...，必须改成站点根路径
					modifyURLPrefix: {
						'': '/',
					},
					navigateFallback: '/index.html',
					navigateFallbackDenylist:
						pwaOptions.navigateFallbackDenylist,
					runtimeCaching: [
						{
							urlPattern: pwaOptions.apiNetworkOnly,
							handler: 'NetworkOnly',
						},
						{
							urlPattern: /\.woff2$/i,
							handler: 'CacheFirst',
							options: {
								cacheName: 'fonts-woff2',
								expiration: {
									maxEntries: 8,
									maxAgeSeconds: 60 * 60 * 24 * 365,
								},
								cacheableResponse: { statuses: [200] },
							},
						},
					],
				},
				devOptions: {
					enabled: false,
				},
			}),
			vitePluginConsole(),
		],
		// 手机局域网调试：部分浏览器带 Origin 却丢掉 ?token=，HMR 升级会被拒
		legacy: {
			skipWebSocketTokenCheck: true,
		},
	}
})

/** PWA：色板来自 `light.json`，接口前缀转义后给 workbox */
function readPwaPluginOptions(api: string) {
	const apiPrefix = api.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	// import attributes 的 with 会被类型服务当成严格模式里的 with 语句
	const lightJson = JSON.parse(
		fs.readFileSync(
			path.resolve(import.meta.dirname, '../../packages/theme/module/light.json'),
			'utf8',
		),
	) as typeof import('../../packages/theme/module/light.json')
	return {
		...lightJson,
		navigateFallbackDenylist: [
			new RegExp(`^${apiPrefix}`),
			/^\/static\//,
			/^\/pwa\//,
			// 带后缀的是资源，不要回 index.html（否则模块脚本报 MIME text/html）
			/\.[a-zA-Z0-9]+(\?|$)/,
		],
		apiNetworkOnly: new RegExp(`${apiPrefix}(?:/|\\?|$)`),
	}
}
