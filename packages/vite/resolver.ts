/// <reference types="node" />
/**
 * 业务侧按需自动导入
 *
 * ```ts
 * import { SacoCommonResolver, sacoCommonAutoImports, sacoCommonScssAdditionalData } from '#/vite/resolver'
 * UnpluginAutoImportVite({
 *   imports: sacoCommonAutoImports('vue', 'vue-router', 'vue-i18n')
 * })
 * UnpluginVueComponentsVite({
 *   resolvers: [SacoUiResolver(), SacoCommonResolver()]
 * })
 * css.preprocessorOptions.scss.additionalData = sacoCommonScssAdditionalData()
 * ```
 */

import fs from 'node:fs'
import { dirname, join, relative } from 'node:path'
/** 命令式 API 跟 UI resolver 同一条子路径；业务 vite 不用再抄 Message 名单 */
import { sacoUiAutoImports } from '@saco/ui/resolver'

export const PACKAGE_NAME = '#'
export const PREFIX = 'Common'

export type ScssAdditionalData =
	string | ((source: string, filename: string) => string)

/**
 * `#` 不能写进 package.json imports（目标在包外，Node 会判 Invalid package target）。
 * 从业务 cwd 往上找仓库里的主题入口。
 */
function themeGlobalFile(): string {
	let dir = process.cwd()
	for (let i = 0; i < 8; i++) {
		const file = join(dir, 'packages', 'style', 'theme', 'global.scss')
		if (fs.existsSync(file)) return file
		const parent = dirname(dir)
		if (parent === dir) break
		dir = parent
	}
	throw new Error('找不到 packages/style/theme/global.scss')
}

/**
 * 当前文件到 `style/theme/global.scss` 的 `@use`。
 * 不能写 `D:/` 绝对路径：Sass 把盘符当成 URL scheme，sourcemap 会变成
 * 「样式目录/d:/...」，Vite 报 points to missing source files。
 * 路径按传入的 filename 算，不要写死成相对本文件。
 */
function themeGlobalUse(filename: string): string {
	const globalFile = themeGlobalFile()
	const from = dirname(filename.split('?')[0])
	let rel = relative(from, globalFile).replaceAll('\\', '/')
	// 跨盘符时 relative 退回绝对路径，再被当成 d: 协议。前面加 / 才是文件路径
	if (/^[A-Za-z]:\//.test(rel)) rel = `/${rel}`
	else if (!rel.startsWith('.')) rel = `./${rel}`
	return `@use "${rel}" as *;`
}

/**
 * Vite `scss.additionalData`：本包覆盖 `@saco/ui` 的 prelude 在前。
 * 始终返回函数。不要返回字符串，否则 SacoUiPlugin 会把 `@forward` 内联进
 * theme-chalk，`./function.scss` 会解析到 UI 包里。
 */
export function sacoCommonScssAdditionalData(
	extra?: ScssAdditionalData,
): (source: string, filename: string) => string {
	const extraFn =
		typeof extra === 'function'
			? extra
			: typeof extra === 'string' && extra.trim()
				? (source: string, _filename: string) => `${extra}\n${source}`
				: undefined
	return (source: string, filename: string) => {
		const id = filename.split('?')[0].replaceAll('\\', '/')
		if (id.includes('/style/theme/') || id.includes('/style/mixins/')) {
			return extraFn ? extraFn(source, filename) : source
		}
		const prelude = themeGlobalUse(filename)
		const next = extraFn ? extraFn(source, filename) : source
		if (next.includes(prelude)) return next
		return `${prelude}\n${next}`
	}
}

const COMPONENTS: Record<string, string> = {
	DynamicInput: 'dynamic/input',
	DynamicSelect: 'dynamic/select',
	DynamicRadio: 'dynamic/radio',
	DynamicUploadSingle: 'dynamic/upload/single',
	DynamicUploadMultiple: 'dynamic/upload/multiple',
	DynamicUploadImage: 'dynamic/upload/image',
	DynamicP: 'dynamic/p',
	CommonImagePreview: 'components/image-preview/index.vue',
	CommonPagination: 'components/pagination/index.vue',
	CommonDropdownMenu: 'components/dropdown-menu/index.vue',
	CommonRemarkInput: 'components/remark-input/index.vue',
	CommonPhoneInput: 'components/phone-input/index.vue',
	CommonTeleportNav: 'components/teleport/nav.vue',
	CommonTeleportFooter: 'components/teleport/footer.vue',
	CommonTeleportDialog: 'components/teleport/dialog.vue',
	CommonDynamicPreview: 'components/dynamic-preview/index.vue',
	CommonMarkdown: 'components/markdown/index.vue',
	CommonLoading: 'components/loading/index.vue',
	CommonRotateScreen: 'components/rotate-screen/index.vue',
	/** 壳是 index.vue 的默认导出，不要再指到 install.ts */
	CommonLayout: 'layout/index.vue',
}

export type ComponentResolveResult =
	| string
	| {
			name?: string
			from: string
			sideEffects?: string | string[]
	  }
	| undefined

export interface ComponentResolverObject {
	type: 'component' | 'directive'
	resolve: (
		name: string,
	) => ComponentResolveResult | Promise<ComponentResolveResult>
}

export interface SacoCommonResolverOptions {
	/** 覆盖包名，默认 `@saco/common` */
	packageName?: string
}

/** unplugin-vue-components：模板里写 `<DynamicInput />` 即按需引入 */
export function SacoCommonResolver(
	options: SacoCommonResolverOptions = {},
): ComponentResolverObject {
	const packageName = options.packageName ?? PACKAGE_NAME
	return {
		type: 'component',
		resolve: (name: string): ComponentResolveResult => {
			const dir = COMPONENTS[name]
			if (!dir) return undefined
			const from = `${packageName}/${dir}`
			// .vue 是默认导出；再写 name 会生成具名导入，SFC 上没有这个导出
			if (dir.endsWith('.vue')) return { from }
			// 源码直出：动态表单在 dynamic/<kebab>，共用组件在 components/<kebab>，壳在 layout
			return {
				name,
				from,
			}
		},
	}
}

/** 业务额外项：preset 名、值 Record、或 `{ type: true }` 的类型导入 */
export type SacoCommonAutoImportExtra =
	| string
	| Record<string, string[]>
	| { from: string; imports: string[]; type?: boolean }

/**
 * `UnpluginAutoImportVite({ imports })`：本包子路径在前，后面接业务 preset。
 * 整份交给选项，不要再 `...` 摊开。
 * 泛型保住 `'vue'` 这类字面量，返回值才能赋给 unplugin 的 PresetName 联合。
 * 纯类型必须 `{ type: true }`：Record 只能挂运行时名字，interface 写进 Record 会打成值导入。
 * 类型走各自子路径并标 type: true，不要收成一个总入口再当值导入。
 */
export function sacoCommonAutoImports<T extends SacoCommonAutoImportExtra>(
	...extra: T[]
): Array<
	| Record<string, string[]>
	| { from: string; imports: string[]; type: true }
	| T
> {
	return [
		// [0] SacoMessage / SacoMessageBox 子路径；[1] 主包公开 type（FormExpose），type:true 不拉整箱
		...sacoUiAutoImports(),
		{
			[`${PACKAGE_NAME}/dynamic`]: ['asyncRegister'],
			[`${PACKAGE_NAME}/layout/utils/webTab`]: ['useWebTab'],
			[`${PACKAGE_NAME}/layout/utils/webFullscreen`]: ['useWebFullscreen'],
			[`${PACKAGE_NAME}/utils/broadcast`]: [
				'useWebChannel',
				'useSameChannel',
			],
			[`${PACKAGE_NAME}/utils/file`]: [
				'fileDetection',
				'fileToBase64',
				'aTagDownload',
				'numberToSizeUnit',
			],
			[`${PACKAGE_NAME}/utils/timing`]: ['useCountDown'],
			[`${PACKAGE_NAME}/utils/proportion`]: ['useProportion'],
			[`${PACKAGE_NAME}/utils/search`]: ['useSearchFormTable'],
			[`${PACKAGE_NAME}/utils/table-selection`]: ['useTableSelection'],
			[`${PACKAGE_NAME}/utils/router`]: ['getRouterParams'],
			[`${PACKAGE_NAME}/utils/data`]: ['useOptionMap'],
			[`${PACKAGE_NAME}/utils/tree`]: ['flatToTree', 'treeToFlat'],
			// 模板 {{ leachFormatter(x) }} / 列 :formatter，漏了 _ctx 上是 undefined
			[`${PACKAGE_NAME}/utils/formatter`]: [
				'LEACH_VALUE',
				'getFormatterValue',
				'createFormatter',
				'leachFormatter',
				'hmdhmsFormatter',
				'ymdFormatter',
				'reviewDurationFormatter',
				'compactNumberFormatter',
				'phoneFormatter',
			],
			[`${PACKAGE_NAME}/utils/phone`]: [
				'isValidPhone',
				'parsePhone',
				'composePhone',
				'compactPhone',
				'getDefaultPhoneCountryCode',
			],
			// 模板 @row-dblclick，漏了 _ctx 上是 undefined
			[`${PACKAGE_NAME}/utils/message`]: [
				'noTransferDblClick',
				'deleteBox',
				'confirmBox',
				'updateVersionBox',
			],
			[`${PACKAGE_NAME}/i18n`]: [
				'useI18nLanguage',
				'initI18n',
				'i18nCookie',
				'languagePrefix',
				'languageList',
				'loadLocale',
				'parsePathLanguage',
				'replacePathLanguage',
				'setI18nLocale',
				'isSupportedLanguage',
				'getNavigationLocaleName',
			],
			[`${PACKAGE_NAME}/theme`]: ['useTheme'],
			[`${PACKAGE_NAME}/axios`]: [
				'request',
				'downloadFile',
				'saveAuthStorage',
				'clearAuthStorage',
				'replaceToLogin',
				'replaceToHome',
				'ACCESS_TOKEN_KEY',
				'REFRESH_TOKEN_KEY',
				'EXPIRES_TIME_KEY',
				'REFRESH_TOKEN_URL',
			],
			[`${PACKAGE_NAME}/pinia`]: [
				'createStore',
				'defineStore',
				'storeToRefs',
				'acceptHMRUpdate',
				'getActivePinia',
				'setActivePinia',
				'mapActions',
				'mapGetters',
				'mapState',
				'mapStores',
				'mapWritableState',
				'setMapStoreSuffix',
			],
			[`${PACKAGE_NAME}/router`]: ['createAppRouter'],
			[`${PACKAGE_NAME}/store`]: [
				'useRouterStore',
				'mutateRoute',
				'setDocumentTitle',
				'useComponentStore',
				'useUserStore',
				'useSettingStore',
			],
		},
		{
			from: `${PACKAGE_NAME}/axios`,
			imports: ['RefreshTokenResponse'],
			type: true,
		},
		{
			from: `${PACKAGE_NAME}/utils/search`,
			imports: ['SearchParams', 'SearchResponse', 'SearchRowLogo'],
			type: true,
		},
		{
			from: `${PACKAGE_NAME}/utils/table-selection`,
			imports: ['UseTableSelectionReturn'],
			type: true,
		},
		{
			from: `${PACKAGE_NAME}/utils/tree`,
			imports: ['FlatTreeNode'],
			type: true,
		},
		...extra,
	]
}

export default SacoCommonResolver
