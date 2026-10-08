import fs from 'node:fs'
import path from 'node:path'

/**
 * `#/` 能进的公共包。
 * 基础设施（@saco/ui、pinia 等）不在这里，避免和 `#/pinia` 这种业务包装层撞名。
 */
export const COMMON_PACKS = [
	'api',
	'axios',
	'assets',
	'components',
	'dynamic',
	'i18n',
	'layout',
	'monitor',
	'pinia',
	'router',
	'store',
	'style',
	'theme',
	'utils',
	'vite',
] as const

const COMMON_SET = new Set<string>(COMMON_PACKS)

/** 从任意目录往上找仓库根（有 pnpm-workspace.yaml 的那一层） */
export function findRepoRoot(start: string): string {
	let dir = path.resolve(start)
	for (let i = 0; i < 8; i++) {
		if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir
		const parent = path.dirname(dir)
		if (parent === dir) break
		dir = parent
	}
	throw new Error(`找不到 monorepo 根（从 ${start} 往上没有 pnpm-workspace.yaml）`)
}

/**
 * 把 `#/axios`、`#/dynamic/upload/single`、`#/style.scss` 解到 packages 源码。
 * 目录里若有 install.ts，按需入口走它，不能落到同目录的 index.vue。
 */
export function resolveCommonSpecifier(
	spec: string,
	packagesRoot: string,
): string | undefined {
	if (!spec.startsWith('#/')) return undefined
	const rest = spec.slice(2)
	// 旧包的 style.scss / style.css 都是 style/index.scss，不是名为 style.scss 的包
	if (rest === 'style' || rest === 'style.scss' || rest === 'style.css') {
		return path.join(packagesRoot, 'style', 'index.scss')
	}
	const slash = rest.indexOf('/')
	const name = slash === -1 ? rest : rest.slice(0, slash)
	const sub = slash === -1 ? '' : rest.slice(slash + 1)
	if (!COMMON_SET.has(name)) return undefined
	// 源码就在包根。assets 没有入口文件，只接子路径（#/assets/img/...）
	const packRoot = path.join(packagesRoot, name)
	if (!sub) return preferEntry(packRoot)
	const target = path.join(packRoot, sub)
	if (fs.existsSync(target)) {
		if (fs.statSync(target).isDirectory()) return preferEntry(target)
		return target
	}
	const exts = ['.ts', '.tsx', '.vue', '.mjs', '.js', '.json', '.scss', '.css', '.d.ts']
	for (const ext of exts) {
		const file = target + ext
		if (fs.existsSync(file)) return file
	}
	return target
}

/** 目录入口：install.ts 优先于 index.vue，否则按需会把 SFC 当安装入口 */
function preferEntry(dir: string): string {
	const install = path.join(dir, 'install.ts')
	if (fs.existsSync(install)) return install
	for (const name of ['index.ts', 'index.tsx', 'index.mjs', 'index.js', 'index.scss']) {
		const file = path.join(dir, name)
		if (fs.existsSync(file)) return file
	}
	return dir
}

/**
 * 挂进 sacoCommonResolve。`#/` 指公共包。
 * `@` 由各应用自己传（只匹配 `@/`，不会吃掉 `@saco/ui`）。
 * 用进程 cwd 找仓库根：vite 在对应应用目录里启动。
 */
export function commonAliasEntries() {
	const packagesRoot = path.join(findRepoRoot(process.cwd()), 'packages')
	return [
		{
			find: /^#\//,
			replacement: (id: string) =>
				resolveCommonSpecifier(id, packagesRoot) ?? id,
		},
	]
}

/**
 * Vite 8 的 resolve.alias 把函数当成 String.replace 的替换器，`#/` 不能走 alias。
 * JS 用 resolveId；Sass 不走 Vite 解析，在编译前把 `@use '#/...'` 换成绝对路径。
 * 每个应用把这个插件放在 plugins 最前。后续新应用同样加这一条，`@` 仍只指向该应用自己的 src。
 */
export function commonAliasPlugin() {
	const packagesRoot = path.join(findRepoRoot(process.cwd()), 'packages')
	return {
		name: 'saco-common-alias',
		enforce: 'pre' as const,
		resolveId(id: string) {
			if (!id.startsWith('#/')) return null
			return resolveCommonSpecifier(id, packagesRoot) ?? null
		},
		transform(code: string, id: string) {
			if (!code.includes('#/')) return null
			if (!/\.(vue|scss|css)(\?|$)/.test(id)) return null
			let changed = false
			const next = code.replace(
				/(@(?:use|forward|import)\s+(?:url\(\s*)?)(['"])#\/([^'"]+)\2/g,
				(full, lead: string, quote: string, rest: string) => {
					const abs = resolveCommonSpecifier(`#/${rest}`, packagesRoot)
					if (!abs) return full
					changed = true
					// Sass 把 D:/ 当成 URL scheme，盘符前要再加 /
					let file = abs.replaceAll('\\', '/')
					if (/^[A-Za-z]:\//.test(file)) file = `/${file}`
					return `${lead}${quote}${file}${quote}`
				},
			)
			// url('#/...') 里的 # 会被当成片段。改成相对当前文件的路径，Sass 才能把图打进产物
			const from = path.dirname(id.split('?')[0])
			const withUrls = next.replace(
				/url\(\s*(['"])#\/([^'"]+)\1\s*\)/g,
				(full, quote: string, rest: string) => {
					const abs = resolveCommonSpecifier(`#/${rest}`, packagesRoot)
					if (!abs) return full
					changed = true
					let rel = path.relative(from, abs).replaceAll('\\', '/')
					if (!rel.startsWith('.')) rel = `./${rel}`
					return `url(${quote}${rel}${quote})`
				},
			)
			return changed ? withUrls : null
		},
	}
}
