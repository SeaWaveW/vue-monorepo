/**
 * 编辑器里的 Prettier 进程会缓存已经 import 过的配置和插件。
 * package.json 的 prettier 字段比本文件先被找到，命中的是改打印机之前的那份模块，
 * Ctrl+S 就会把 calc 从 var() 内部折行。字段已去掉，只留这个文件。
 * 插件路径加查询串，当前窗口才会重新读磁盘上的打印机。
 */
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)

const cssCalc = await import(
	`${pathToFileURL(require.resolve('@saco/web-lint/prettier-plugin-css-calc')).href}?calc=1`
)
const vueAsParens = await import(
	pathToFileURL(
		require.resolve('@saco/web-lint/prettier-plugin-vue-as-parens'),
	).href
)
const base = await import(
	`${pathToFileURL(require.resolve('@saco/web-lint/prettier')).href}?calc=1`
)

const { plugins: _plugins, ...options } = base.default

export default {
	...options,
	plugins: [vueAsParens, cssCalc],
}
