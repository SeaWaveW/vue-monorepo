/// <reference types="node" />
/**
 * 业务 Vite 拆包 / 资源命名。必须传入业务工程 root，CJS 产物不能用 import.meta.dirname。
 *
 * ```ts
 * import {
 *   createViteOutputs,
 *   sacoCommonOptimizeDeps,
 *   sacoCommonResolve,
 *   sacoCommonViteEnv,
 * } from '#/vite'
 * const { assetsFileOutput, chunkFileNamesOutput, codeSplittingOutput, pwaGlobIgnores,
 *   modulePreloadResolveDependencies, buildVersionPlugin } =
 *   createViteOutputs({ root: import.meta.dirname })
 * // plugins: [buildVersionPlugin, sacoCommonViteEnv(env), ...]
 * // resolve: sacoCommonResolve({ alias: { '@': ... } })
 * // optimizeDeps: sacoCommonOptimizeDeps()
 * ```
 */
import { createRequire } from 'node:module'
import path from 'node:path'
import fs from 'node:fs'
import type { Connect, Plugin, UserConfig } from 'vite'

const imgReg =
	/(webp|bpm|pcx|tif|gif|jpe?g|tga|exif|fpx|svg|psd|cdr|pcd|dxf|ufo|eps|ai|png|hdri|raw|wmf|flic|emf|ico)$/

/** 图片进 static/img，其余按扩展名 */
export const assetsFileOutput = (fileName: string) => {
	const extname = path.extname(fileName)
	const isImg = imgReg.test(extname)
	return isImg
		? 'static/img/[name]-[hash].[ext]'
		: 'static/[ext]/[name]-[hash].[ext]'
}

export interface ViteChunkInfo {
	name?: string
	facadeModuleId?: string | null
	moduleIds?: readonly string[]
}

export interface CreateViteOutputsOptions {
	/** 业务工程根目录（一般 `import.meta.dirname`） */
	root: string
	/** 语言包目录；默认业务 `common/i18n/locales` → `src/i18n/locales` → 本包 locales */
	localeDir?: string
	/** 业务 package.json；拆包还会再读已安装的 `@saco/common` 及其 `@saco/*` 下一层 */
	packageJson?: string
}

/**
 * 不要预构建这些包。`include` 挡不住 Vite 自动扫；
 * exclude `@saco/common` 却不 exclude vue / vue-router，会打出 HASH 第二份，inject 对不上。
 * 子路径是独立入口，只写 `@saco/common` 不够。
 * `/components` `/layout` 含 Vue 拆出的 scoped css 文件名，预构建会改成磁盘上不存在的绝对路径。
 */
export const sacoCommonOptimizeDepsExclude = [
	'@saco/ui',
	'vue',
	'vue-router',
	'pinia',
	'@saco/pinia',
	'vue-i18n',
]

/**
 * 本包被 exclude 后 Vite 扫不到源码里的 CJS。
 * `pkg > dep` 强迫预构建；漏了会裸送 `qs/lib/index.js`，浏览器报没有 default。
 */
const sacoCommonCjsInclude = [
	'qs',
	'dayjs',
	'dayjs/esm',
	'@saco/ui > dayjs',
	'@saco/ui > dayjs/esm',
]

/**
 * 拼业务 `optimizeDeps`。业务只传额外 `include`；
 * exclude 与本包 CJS（qs / dayjs）由本包装上。include 里若误写了要排除的包，会剔掉。
 */
export function sacoCommonOptimizeDeps(
	input: UserConfig['optimizeDeps'] = {},
): NonNullable<UserConfig['optimizeDeps']> {
	const exclude = [
		...new Set([...sacoCommonOptimizeDepsExclude, ...(input.exclude ?? [])]),
	]
	const excludeSet = new Set(exclude)
	const include = [
		...new Set([...sacoCommonCjsInclude, ...(input.include ?? [])]),
	].filter((id) => !excludeSet.has(id))
	return {
		...input,
		include,
		exclude,
		// Vite 8 预构建 CJS 常只有具名导出，补 default 给旧的 `import qs from 'qs'`
		needsInterop: [
			...new Set([
				'qs',
				'dayjs',
				'@saco/ui > dayjs',
				...(input.needsInterop ?? []),
			]),
		],
	}
}

/** link 的 common 和业务各有一份 node_modules，必须收成业务工程那一份；@saco/ui 不收会打两份组件 scss */
export const sacoCommonResolveDedupe = [
	'vue',
	'vue-router',
	'vue-i18n',
	'pinia',
	'@saco/ui',
	// 否则 link 时 formatter 和业务可能各解析一份 dayjs / qs，预构建对不上
	'dayjs',
	'qs',
]

/**
 * 业务根往往没有 dayjs（pnpm 不提升、common 又是 link），裸 `dayjs/esm` 会解析失败，
 * Vite 8 再回落到 package.json main → dayjs.min.js（UMD 无 ESM default）。
 */
function resolveDayjsEsmFile() {
	const appRequire = createRequire(path.join(process.cwd(), 'package.json'))
	const tryEsm = (req: ReturnType<typeof createRequire>) => {
		try {
			return req.resolve('dayjs/esm/index.js')
		} catch {
			return undefined
		}
	}
	const fromApp = tryEsm(appRequire)
	if (fromApp) return fromApp
	try {
		const json = appRequire.resolve('@saco/ui/package.json')
		const fromPkg = tryEsm(createRequire(json))
		if (fromPkg) return fromPkg
	} catch {
		/* 应用没装 @saco/ui 时跳过 */
	}
	// 公共包的 dayjs 不走应用 dependencies，从仓库里的 package.json 解析
	let dir = process.cwd()
	for (let i = 0; i < 8; i++) {
		for (const pack of ['utils', 'axios', 'vite']) {
			const json = path.join(dir, 'packages', pack, 'package.json')
			if (!fs.existsSync(json)) continue
			const fromPkg = tryEsm(createRequire(json))
			if (fromPkg) return fromPkg
		}
		const parent = path.dirname(dir)
		if (parent === dir) break
		dir = parent
	}
	return 'dayjs/esm/index.js'
}

/** 只改裸 `dayjs` 和已被解析到的 min.js，不要用字符串 find 当前缀，否则会误伤 `dayjs/plugin/*` */
function createDayjsEsmAliases() {
	const esm = resolveDayjsEsmFile()
	return [
		{ find: /^dayjs$/, replacement: esm },
		// Vite 已按 main 解到 dayjs.min.js 时，裸 specifier alias 拦不住
		{ find: /[/\\]dayjs[/\\]dayjs\.min\.js$/, replacement: esm },
	]
}

/**
 * 拼业务 `resolve`。dedupe 由本包装上，否则 `useRouter()` inject 对不上。
 * 裸 `dayjs` 指到 ESM 绝对路径，避免 Vite 8 把 `import dayjs from 'dayjs'` 打到 dayjs.min.js。
 */
export function sacoCommonResolve(
	input: UserConfig['resolve'] = {},
): NonNullable<UserConfig['resolve']> {
	const inputAlias = input.alias
	const dayjsEsmAlias = createDayjsEsmAliases()
	const alias = Array.isArray(inputAlias)
		? [...dayjsEsmAlias, ...inputAlias]
		: [
				...dayjsEsmAlias,
				...Object.entries(inputAlias ?? {}).map(
					([find, replacement]) => ({
						find,
						replacement: String(replacement),
					}),
				),
			]
	return {
		...input,
		alias,
		dedupe: [
			...new Set([...sacoCommonResolveDedupe, ...(input.dedupe ?? [])]),
		],
	}
}

/**
 * 把 `@saco/common` axios 的 `baseURL: import.meta.env.VITE_APP_API` 内联成业务 env 字符串。
 * link / 预构建后 Vite 常只注入 `import.meta.env = {…}` 而不替换属性读取，赋值在 ESM 里可能无效 → baseURL 空 → 请求无 `/api` → 405。
 * 须在业务 `plugins` 靠前位置：`sacoCommonViteEnv(loadEnv(...))`。
 */
export function sacoCommonViteEnv(env: Record<string, string>): Plugin {
	const api = env.VITE_APP_API
	const from = 'import.meta.env.VITE_APP_API'
	const needle = `baseURL: ${from}`
	const token = '__SQT_KEEP_IMPORT_META_ENV_VITE_APP_API__'
	// alias 拦不住时（UI 已解到 min.js），enforce pre 再挡一次
	const dayjsEsm = resolveDayjsEsmFile()
	return {
		name: 'saco-common:inline-vite-app-api',
		enforce: 'pre',
		resolveId(id) {
			if (id === 'dayjs') return dayjsEsm
			if (/[/\\]dayjs[/\\]dayjs\.min\.js$/.test(id)) return dayjsEsm
		},
		transform(code, id) {
			if (typeof api !== 'string' || !api) return
			const posix = id.replaceAll('\\', '/').split('?')[0]
			const fromCommon =
				posix.includes('/packages/axios/') ||
				posix.includes('/axios/http.')
			if (!fromCommon) return
			if (
				!code.includes(needle) &&
				!code.includes(token) &&
				!code.includes('baseURL: void 0') &&
				!code.includes('baseURL: undefined')
			) {
				return
			}
			const lit = JSON.stringify(api)
			let next = code
			next = next.replaceAll(token, lit)
			next = next.replaceAll(needle, `baseURL: ${lit}`)
			next = next.replaceAll('baseURL: void 0', `baseURL: ${lit}`)
			next = next.replaceAll('baseURL: undefined', `baseURL: ${lit}`)
			if (next === code) return
			return { code: next, map: null }
		},
	}
}

function resolveLocaleDir(root: string, localeDir?: string) {
	if (localeDir) return localeDir
	const fromApp = path.join(root, 'common/i18n/locales')
	if (fs.existsSync(fromApp)) return fromApp
	const fromSrc = path.join(root, 'src/i18n/locales')
	if (fs.existsSync(fromSrc)) return fromSrc
	// 语言包在 packages/i18n/locales，应用不声明这个包
	let dir = root
	for (let i = 0; i < 8; i++) {
		const fromPackages = path.join(dir, 'packages', 'i18n', 'locales')
		if (fs.existsSync(fromPackages)) return fromPackages
		const parent = path.dirname(dir)
		if (parent === dir) break
		dir = parent
	}
	return fromApp
}

function readDependencyNames(packageJson: string) {
	const raw = JSON.parse(fs.readFileSync(packageJson, 'utf-8')) as {
		dependencies?: Record<string, string>
	}
	// @types 只给 TS，拆出来没有运行时 chunk
	return Object.keys(raw.dependencies || {}).filter(
		(name) => !name.startsWith('@types/'),
	)
}

function resolveInstalledPackageJson(
	require: ReturnType<typeof createRequire>,
	name: string,
): string | undefined {
	try {
		return require.resolve(`${name}/package.json`)
	} catch {
		return undefined
	}
}

/**
 * vue 生态单例。伴生包若带上这些，拆 pinia / echarts 会把 vue 卷走，
 * `includeDependenciesRecursively: false` 就是为防这个。
 */
const isSplitSingleton = (name: string) =>
	name === 'vue' ||
	name === 'vue-router' ||
	name === 'vue-i18n' ||
	name === 'pinia' ||
	name.startsWith('@vue/') ||
	name.startsWith('@intlify/')

/**
 * 首屏壳：SW 可以 precache。其余按需大包（ali-oss / echarts / pinyin-pro）
 * 进 globIgnores，否则 generateSW 会在安装时把 1MB+ 全拉下来。
 */
const isPwaShellPackage = (name: string) =>
	isSplitSingleton(name) ||
	name === 'axios' ||
	name === 'dayjs' ||
	name === 'qs' ||
	name === 'workbox-window' ||
	name.startsWith('@saco/') ||
	name.startsWith('@capacitor/')

interface SplitDepGroup {
	/** 直依包名，也是 chunk 名来源 */
	name: string
	/** 本 chunk 要吃掉的包：直依 + 它的伴生包（zrender 跟 echarts） */
	match: string[]
}

/**
 * 拆包名单：业务直依 + 仓库里各公共包的 npm 依赖 + `@saco/*` 再下一层。
 * 公共源码用 `#` 引入，应用 package.json 不再声明这些包。
 * 只读 package.json，不要写死 ali-oss / qs。
 * 每个直依再读一层自己的 dependencies，并进同一 chunk；
 * 已有独立组的（dayjs）和 vue 单例不并，避免 pinia 吞 vue、saco-ui 吞 dayjs。
 * 漏这一步则 zrender 进 vendor，没开首页的页面也会下载图表渲染器。
 */
function workspacePackageJsons(start: string): string[] {
	let dir = path.resolve(start)
	for (let i = 0; i < 8; i++) {
		if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
			const files: string[] = []
			const rootPkg = path.join(dir, 'package.json')
			// 公共目录不再是 npm 包，npm 依赖写在仓库根
			if (fs.existsSync(rootPkg)) files.push(rootPkg)
			const packagesDir = path.join(dir, 'packages')
			if (fs.existsSync(packagesDir)) {
				for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
					if (!entry.isDirectory()) continue
					const file = path.join(packagesDir, entry.name, 'package.json')
					if (fs.existsSync(file)) files.push(file)
				}
			}
			return files
		}
		const parent = path.dirname(dir)
		if (parent === dir) break
		dir = parent
	}
	return []
}

function collectSplitDepGroups(businessPackageJson: string): SplitDepGroup[] {
	const appRequire = createRequire(path.join(process.cwd(), 'package.json'))
	const names = new Set(readDependencyNames(businessPackageJson))
	const resolvers = [appRequire]
	for (const json of workspacePackageJsons(process.cwd())) {
		resolvers.push(createRequire(json))
		for (const dep of readDependencyNames(json)) names.add(dep)
	}
	for (const name of [...names]) {
		if (!name.startsWith('@saco/')) continue
		let json: string | undefined
		for (const req of resolvers) {
			json = resolveInstalledPackageJson(req, name)
			if (json) break
		}
		if (!json) continue
		for (const dep of readDependencyNames(json)) names.add(dep)
	}
	const list = [...names].filter((name) => !name.startsWith('@types/'))
	const owned = new Set(list)
	return list.map((name) => {
		const companions: string[] = []
		let json: string | undefined
		for (const req of resolvers) {
			json = resolveInstalledPackageJson(req, name)
			if (json) break
		}
		if (json) {
			for (const dep of readDependencyNames(json)) {
				if (owned.has(dep) || isSplitSingleton(dep)) continue
				companions.push(dep)
			}
		}
		return { name, match: [name, ...companions] }
	})
}

/** 从模块 id 解析真实包名（取最后一个 node_modules 段，兼容 pnpm） */
const resolvePackageName = (id: string) => {
	const normalizedId = id.replace(/\\/g, '/')
	const segments = normalizedId.split('/node_modules/')
	const pkgPath = segments[segments.length - 1] || ''
	return pkgPath.startsWith('@')
		? pkgPath.split('/').slice(0, 2).join('/')
		: pkgPath.split('/')[0]
}

/** @scope/name → scope-name */
const toChunkName = (dep: string) => dep.replace(/^@/, '').replace(/\//g, '-')

/**
 * 直接依赖匹配；少数生态伴生包归到对应直依（避免散进 vendor）
 * - vue → @vue/*
 * - vue-i18n → @intlify/*、intlify
 */
const isLocaleJson = (id: string) =>
	/\/i18n\/locales\/[^/]+\.json/.test(id.replace(/\\/g, '/'))

const isThemeJson = (id: string) =>
	/\/theme\/module\/[^/]+\.json/.test(id.replace(/\\/g, '/'))

const isLazyJson = (id: string) => isLocaleJson(id) || isThemeJson(id)

/** svg ?raw 不能跟宿主包并 chunk，否则布局图标会打进 saco-common */
const isSvgAsset = (id: string) => {
	const n = id.replace(/\\/g, '/').split('?')[0]
	return n.endsWith('.svg')
}

/**
 * 按来源分目录，避免 `assets` 和散落文件看不出是谁的。
 * UI 内置 → `ui/`，国旗 → `country/`，common / 业务一层 svg → `common/`。
 */
const svgChunkRel = (id: string) => {
	const n = id.replace(/\\/g, '/')
	const ui = n.match(/\/components\/svg\/assets\/([^/]+)\.svg(?:\?|$)/)
	// 情况1：UI 包 assets，源码夹名叫 assets，产物改叫 ui 才能和国旗分开
	if (ui) return `ui/${ui[1]}`
	const rel = n.match(/\/svg\/(.+?)\.svg(?:\?|$)/)?.[1]
	if (!rel) return undefined
	// 情况2：已有子目录（country）原样用
	if (rel.includes('/')) return rel
	// 情况3：svg 根上一层，不进 country / ui，单独 common
	return `common/${rel}`
}

/**
 * plugin-vue 给 scoped SFC 的 `_export_sfc`。虚拟模块不在 `node_modules/vue` 里。
 * 不单独拆的话会跟入口 App / PwaReload 进 `index`，`@saco/common` 再回引 → 循环依赖，
 * 启动时 helper 还是 undefined，线上报 `R is not a function`。
 */
const isVueExportHelper = (id: string) =>
	id.replace(/\\/g, '/').includes('plugin-vue:export-helper')

const matchDependencyPackage = (id: string, dep: string) => {
	if (isSvgAsset(id)) return false
	// 跟 vue 走，避免 helper 落进入口后被 saco-common 回引
	if (dep === 'vue' && isVueExportHelper(id)) return true
	const pkg = resolvePackageName(id)
	if (isLazyJson(id)) return false
	if (pkg === dep) return true
	if (dep === 'vue' && pkg.startsWith('@vue/')) return true
	if (dep === 'vue-i18n') {
		const n = id.replace(/\\/g, '/')
		return pkg.startsWith('@intlify/') || n.includes('/intlify/')
	}
	return false
}

/** 业务 package.json 的 version；读不到时仍用时间戳，保证每次打包不一样 */
const readPackageVersion = (packageJsonPath: string) => {
	try {
		const pkg: { version?: string } = JSON.parse(
			fs.readFileSync(packageJsonPath, 'utf8'),
		)
		return pkg.version || '0.0.0'
	} catch {
		return '0.0.0'
	}
}

/**
 * 版本号 = 包版本 + 打包时刻。
 * 两端 package.json 长期停在 1.0.0，只拿它的话发版后旧页对得上，提示不会出现。
 */
const createBuildVersion = (packageJsonPath: string) => {
	const now = new Date()
	const pad = (n: number) => String(n).padStart(2, '0')
	const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
	return `${readPackageVersion(packageJsonPath)}.${stamp}`
}

/**
 * 写出站点根上的 version.json（`{ data: 版本号 }`），并把同一串 define 进 `import.meta.env.VITE_APP_BUILD_VERSION`。
 * 开发用中间件回这份，避免没文件或号不一致，本地一切路由就弹更新。
 */
const createBuildVersionPlugin = (version: string): Plugin => {
	const body = JSON.stringify({ data: version })
	return {
		name: 'saco-build-version',
		config() {
			return {
				define: {
					'import.meta.env.VITE_APP_BUILD_VERSION':
						JSON.stringify(version),
				},
			}
		},
		configureServer(server) {
			server.middlewares.use(createVersionMiddleware(server.config.base, body))
		},
		// preview 也拦这一下，避免浏览器缓存 dist 里的旧 json
		configurePreviewServer(server) {
			server.middlewares.use(createVersionMiddleware(server.config.base, body))
		},
		generateBundle() {
			this.emitFile({
				type: 'asset',
				fileName: 'version.json',
				source: body,
			})
		},
	}
}

/** 只应答 version.json。base 不是 / 时路径要带前缀，否则开发对不上页面里的请求 */
const createVersionMiddleware = (
	base: string,
	body: string,
): Connect.NextHandleFunction => {
	const prefix = base.replace(/\/$/, '')
	const pathname = `${prefix}/version.json`
	return (req, res, next) => {
		if (req.url?.split('?')[0] !== pathname) {
			next()
			return
		}
		res.setHeader('Content-Type', 'application/json; charset=utf-8')
		// 这个文件就是用来发现新包的，缓存住就一直对得上旧号
		res.setHeader('Cache-Control', 'no-store')
		res.end(body)
	}
}

/**
 * 按业务 root 生成 Vite 8 / Rolldown 的资源命名和 codeSplitting。
 * includeDependenciesRecursively: false —— 否则拆 pinia 会把 vue 卷进 pinia chunk。
 */
export function createViteOutputs(options: CreateViteOutputsOptions) {
	const root = options.root
	const localeDir = resolveLocaleDir(root, options.localeDir)
	const packageJson = options.packageJson ?? path.join(root, 'package.json')
	const packageGroups = collectSplitDepGroups(packageJson)

	let intlifyLocaleOrder: string[] | null = null
	const getIntlifyLocaleOrder = () => {
		if (!intlifyLocaleOrder) {
			intlifyLocaleOrder = fs
				.readdirSync(localeDir)
				.filter((name) => name.endsWith('.json'))
				.map((name) => name.replace(/\.json$/i, ''))
				.sort()
		}
		return intlifyLocaleOrder
	}

	const chunkFileNamesOutput = (chunkInfo: ViteChunkInfo) => {
		const name = chunkInfo.name || ''
		const moduleIds = [
			chunkInfo.facadeModuleId,
			...(chunkInfo.moduleIds ?? []),
		]
			.filter(Boolean)
			.map((id) => String(id).replace(/\\/g, '/'))

		for (const id of moduleIds) {
			const fromLocale = id.match(
				/\/i18n\/locales\/([^/]+)\.json(?:\.(?:mjs|cjs))?(?:\?|$)/,
			)
			if (fromLocale) return `static/locale/${fromLocale[1]}-[hash].js`

			const fromTheme = id.match(
				/\/theme\/module\/([^/]+)\.json(?:\.(?:mjs|cjs))?(?:\?|$)/,
			)
			if (fromTheme) return `static/theme/${fromTheme[1]}-[hash].js`

			const fromVirtual = id.match(/virtual:intlify-i18n-(\d+)/)
			if (fromVirtual) {
				const lang = getIntlifyLocaleOrder()[Number(fromVirtual[1])]
				if (lang) return `static/locale/${lang}-[hash].js`
			}

			const fromSvg = svgChunkRel(id)
			if (fromSvg) return `static/svg/${fromSvg}-[hash].js`
		}

		const fromName = name.match(/intlify-i18n-(\d+)/i)
		if (fromName) {
			const lang = getIntlifyLocaleOrder()[Number(fromName[1])]
			if (lang) return `static/locale/${lang}-[hash].js`
		}

		if (name.startsWith('locale-')) {
			return `static/locale/${name.slice(7)}-[hash].js`
		}

		if (name.startsWith('theme-')) {
			return `static/theme/${name.slice(6)}-[hash].js`
		}

		if (name.startsWith('i18n-')) {
			return `static/locale/${name.slice(5)}-[hash].js`
		}

		return 'static/js/[name]-[hash].js'
	}

	const codeSplittingOutput = {
		includeDependenciesRecursively: false,
		groups: [
			{
				// 必须先于 vue / vendor：虚拟 id 不含 node_modules，不拆就会进入口
				name: 'vue-export-helper',
				test: isVueExportHelper,
			},
			{
				name: (id: string) => {
					const m = id
						.replace(/\\/g, '/')
						.match(/\/i18n\/locales\/([^/.]+)\.json/)
					return m ? `locale-${m[1]}` : 'locale'
				},
				test: isLocaleJson,
			},
			{
				name: (id: string) => {
					const m = id
						.replace(/\\/g, '/')
						.match(/\/theme\/module\/([^/.]+)\.json/)
					return m ? `theme-${m[1]}` : 'theme'
				},
				test: isThemeJson,
			},
			...packageGroups.map((group) => ({
				name: toChunkName(group.name),
				// 伴生包装进直依：zrender → echarts，oss 的 stream → ali-oss
				test: (id: string) =>
					group.match.some((pkg) => matchDependencyPackage(id, pkg)),
			})),
			{
				name: 'vendor',
				test: (id: string) =>
					id.replace(/\\/g, '/').includes('/node_modules/') &&
					!isLazyJson(id) &&
					!isSvgAsset(id),
			},
		],
	}

	// 同一次 vite 进程只生成一串：打进页面的和 version.json 必须一样，否则本地一切页就提示更新
	const buildVersion = createBuildVersion(packageJson)
	const buildVersionPlugin = createBuildVersionPlugin(buildVersion)

	const pwaGlobIgnores = [
		'**/visualizer.html',
		// 切页要读到服务器上的新号；进 precache 后旧页永远对得上自己
		'**/version.json',
		'**/*.gz',
		'**/*.{ttf,woff,woff2}',
		'**/pwa/sw.js',
		'**/pwa/workbox-*.js',
		// 路由块 / 图 / 语言包不进 precache，否则 SW 一装就把整站再拉一遍
		'**/static/js/**',
		'**/static/img/**',
		'**/static/svg/**',
		'**/static/locale/**',
		'**/static/theme/**',
		// 按需大包不进 generateSW precache，首访否则把 ali-oss / echarts 全拉下来
		...packageGroups
			.filter((group) => !isPwaShellPackage(group.name))
			.map((group) => `**/${toChunkName(group.name)}-*.js`),
	]

	/**
	 * 图标是 `() => import()`，不该进 modulepreload。
	 * 漏了会把全站扫到的 svg 块在进壳时全拉，冷启动白屏几十秒。
	 */
	const modulePreloadResolveDependencies = (
		_filename: string,
		deps: string[],
	) => deps.filter((dep) => !/[/\\]static[/\\]svg[/\\]/.test(dep))

	return {
		localeDir,
		assetsFileOutput,
		getIntlifyLocaleOrder,
		chunkFileNamesOutput,
		codeSplittingOutput,
		pwaGlobIgnores,
		modulePreloadResolveDependencies,
		buildVersionPlugin,
	}
}
