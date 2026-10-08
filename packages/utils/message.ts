import { h } from 'vue'
import { SacoMessage } from '@saco/ui/es/components/message'
import {
	SacoMessageBox,
	type MessageBoxData,
	type MessageBoxInstance,
	type MessageBoxOptions,
} from '@saco/ui/es/components/message-box'
import {
	i18n,
	replacePathLanguage,
	type Language,
	type LocaleKey,
} from '../i18n'
import { pinia } from '../pinia'
import { resolveCacheTitle, useRouterStore } from '../store'

/**
 * 表格行双击但本页没有详情 / 跳转时的提示。
 * 文案 `no_transfer_message`。走 i18n 单例，不是组合式，列表 / 弹窗都能直接绑 `@row-dblclick`。
 */
export const noTransferDblClick = () => {
	SacoMessage({
		type: 'info',
		message: i18n.global.t('no_transfer_message'),
		customClass: 'no-transfer-message',
	})
}

/**
 * deleteBox 入参。params 跟 api 第一参走（现在是 `id: number`），不要再包 `{ id }`。
 */
export interface DeleteBoxOptions<A extends (params: any) => Promise<any>> {
	/** 原样交给 api */
	params: Parameters<A>[0]
	/** 删除接口本身，不要包 `() => api(id)` */
	api: A
	/**
	 * 详情页删除时传入修改页地址。
	 * 修改签在缓存里才换 `edit_detail_confirm_delete_message` 并关该签；没开过仍是 `delete_message`。
	 * 列表删除不要传。
	 */
	editPath?: string
}

/**
 * t() 会转义插值里的标签，颜色必须走 vnode。
 * 占位符换成带 close-name 的节点，对应 `.detail-edit-message-box .close-name`。
 */
const renderEditDeleteMessage = (closeName: string) => {
	const closeToken = '__CLOSE_NAME__'
	return () =>
		h(
			'span',
			i18n.global
				.t('edit_detail_confirm_delete_message', [closeToken])
				.split(closeToken)
				.flatMap((part, index, parts) =>
					index < parts.length - 1
						? [part, h('span', { class: 'close-name' }, closeName)]
						: [part],
				),
		)
}

/**
 * 请求进行中锁住确认框：防连点、禁取消 / 叉 / 遮罩 / Esc。
 * 漏了请求未完成就能关，会丢结果或重复删。
 */
const setDeleteBoxLocked = (instance: MessageBoxInstance, locked: boolean) => {
	instance.confirmButtonLoading = locked
	instance.cancelButtonDisabled = locked
	instance.showClose = !locked
	instance.closeOnClickModal = !locked
	instance.closeOnPressEscape = !locked
}

/**
 * 删除确认。弹窗 + 锁 + 成功 toast；`.then` 只在删成功后走。
 * 传了 editPath 且修改签在缓存：文案 `edit_detail_confirm_delete_message`，成功后 delCache 该签。
 * 类名固定 `detail-edit-message-box`。
 * 取消 / 失败不 resolve、不 reject，页面不用空 catch。走 i18n 单例，不是组合式。
 */
export const deleteBox = <A extends (params: any) => Promise<any>>(
	options: DeleteBoxOptions<A>,
): Promise<void> => {
	const { t } = i18n.global
	const routerStore = useRouterStore(pinia)
	const realEditPath = options.editPath
		? replacePathLanguage(
				options.editPath,
				i18n.global.locale.value as Language,
			)
		: ''
	const editIndex = routerStore.getCacheIndex(realEditPath)
	const isEditCache = editIndex !== -1
	return new Promise((resolve) => {
		SacoMessageBox({
			title: t('delete'),
			message: isEditCache
				? renderEditDeleteMessage(
						resolveCacheTitle(routerStore.routes[editIndex].meta),
					)
				: t('delete_message'),
			customClass: 'detail-edit-message-box',
			confirmButtonText: isEditCache ? t('continue') : t('confirm'),
			confirmButtonType: 'danger',
			showCancelButton: true,
			cancelButtonText: t('cancel'),
			beforeClose: (action, instance, done) => {
				// 情况1：确认请求还在飞，忽略重复点
				if (instance.confirmButtonLoading) return
				// 情况2：确认 — 锁住再打 api
				if (action === 'confirm') {
					setDeleteBoxLocked(instance, true)
					options
						.api(options.params)
						.then(() => {
							done()
							if (isEditCache) {
								routerStore.delCache(
									routerStore.routes[editIndex].path,
								)
							}
							SacoMessage.success(t('delete_successfully'))
							resolve()
						})
						.finally(() => {
							setDeleteBoxLocked(instance, false)
						})
					return
				}
				// 情况3：取消 / 关 — 关框，不走 then
				done()
			},
		})
	})
}

/** 插值颜色，对应 `.confirm-message-box .confirm-name.is-{type}` */
export type ConfirmBoxNameType = 'primary' | 'warning' | 'danger'

/**
 * 正文 `{n}` 一项。type 决定颜色，漏了就是普通文本。
 */
export interface ConfirmBoxName {
	/** 插到 `{n}` 的展示 */
	value?: string
	/** 主色 / 警告色 / 危险色 */
	type?: ConfirmBoxNameType
}

/**
 * confirmBox 入参。打接口时 params 跟 api 第一参走，不要再包 `{ id }`。
 * 只弹确认（页签满员）可以不传 api。
 */
export interface ConfirmBoxOptions<
	A extends (params: any) => Promise<any> = (params: any) => Promise<any>,
> {
	/** 标题 i18n key */
	title: LocaleKey
	/** 正文 i18n key，`{0}` `{1}` … 对 names 下标 */
	message: LocaleKey
	/** 按占位符顺序；要变色就带 type */
	names?: ConfirmBoxName[]
	/** 确认钮类型，默认 `primary` */
	confirmButtonType?: 'primary' | 'danger' | 'warning'
	/** 确认钮文案 i18n key，默认 `confirm` */
	confirmButtonText?: LocaleKey
	/** 开「不再提示」勾选 */
	showRemember?: boolean
	/** 勾选文案 i18n key，开 showRemember 时传 */
	rememberText?: LocaleKey
	/** 叠在 `confirm-message-box` 后面，有额外皮肤才传 */
	customClass?: string
	/** 原样交给 api；不打接口不要传 */
	params?: Parameters<A>[0]
	/** 确认后打的接口；不打不要传 */
	api?: A
	/** 成功 toast 的 i18n key；打接口时由调用方传入 */
	success?: LocaleKey
}

/**
 * 已发布 `@saco/ui` 的选项还可能没有 remember 两键，交叉在本地，字面量才不挡 vue-tsc。
 */
interface ConfirmMessageBoxOptions extends MessageBoxOptions {
	/** 底栏左侧「不再提示」 */
	showRemember?: boolean
	/** 勾选文案 */
	rememberText?: string
}

/**
 * 确认 resolve 才带 remember。已发布 `MessageBoxData` 没有此字段时解构会红。
 */
interface ConfirmMessageBoxData extends MessageBoxData {
	/** 确认时是否勾上「不再提示」 */
	remember?: boolean
}

/**
 * t() 会转义插值里的标签，颜色必须走 vnode。
 * 占位符换成 confirm-name + is-{type}，对应 `.confirm-message-box`。
 */
const renderConfirmMessage = (message: LocaleKey, names: ConfirmBoxName[]) => {
	const tokens = names.map((_, index) => `__CONFIRM_NAME_${index}__`)
	return () =>
		h(
			'span',
			i18n.global
				.t(message, tokens)
				.split(new RegExp(`(${tokens.join('|')})`))
				.map((part) => {
					const index = tokens.indexOf(part)
					if (index === -1) return part
					const item = names[index]
					return h(
						'span',
						{
							class: item.type
								? `confirm-name is-${item.type}`
								: 'confirm-name',
						},
						item.value,
					)
				}),
		)
}

/**
 * 通用确认。标题 / 正文 / 钮文案走 i18n key；`names` 按 `{n}` 着色。
 * 类名固定带 `confirm-message-box`，再拼传入的 customClass。
 * 传了 api：锁请求、成功 toast（`success`）、`.then` 只在接口成功后走，取消不 reject。
 * 没传 api：确认 resolve `{ remember }`，取消 reject（页签满员 catch 拦路由）。
 * 走 i18n 单例，不是组合式。
 */
export const confirmBox = <
	A extends (params: any) => Promise<any> = (params: any) => Promise<any>,
>(
	options: ConfirmBoxOptions<A>,
): Promise<{ remember?: boolean }> => {
	const { t } = i18n.global
	const names = options.names ?? []
	const boxOptions: ConfirmMessageBoxOptions = {
		title: t(options.title),
		message: names.length
			? renderConfirmMessage(options.message, names)
			: t(options.message),
		customClass: ['confirm-message-box', options.customClass]
			.filter(Boolean)
			.join(' '),
		confirmButtonText: t(options.confirmButtonText ?? 'confirm'),
		confirmButtonType: options.confirmButtonType ?? 'primary',
		showCancelButton: true,
		cancelButtonText: t('cancel'),
		showRemember: options.showRemember,
		rememberText: options.rememberText
			? t(options.rememberText)
			: undefined,
	}
	const api = options.api
	// 情况1：只确认 — 取消要 reject，路由守卫才能拦
	if (!api) {
		return SacoMessageBox(boxOptions).then(
			(data: ConfirmMessageBoxData) => ({
				remember: !!data.remember,
			}),
		)
	}
	return new Promise((resolve) => {
		SacoMessageBox({
			...boxOptions,
			beforeClose: (action, instance, done) => {
				// 情况1：确认请求还在飞，忽略重复点
				if (instance.confirmButtonLoading) return
				// 情况2：确认 — 锁住再打 api
				if (action === 'confirm') {
					setDeleteBoxLocked(instance, true)
					api(options.params)
						.then(() => {
							done()
							if (options.success) {
								SacoMessage.success(t(options.success))
							}
							resolve({})
						})
						.finally(() => {
							setDeleteBoxLocked(instance, false)
						})
					return
				}
				// 情况3：取消 / 关 — 关框，不走 then
				done()
			},
		})
	})
}

/** 已经有一层发版提示。后面的调用不能再挂 `.then`，否则会刷两次 */
let versionBoxOpen = false

/**
 * 发版提示。文案 `update_version_title` / `update_version_message` / `update_version_confirm`。
 * 不能关、不能取消。确认后怎么刷新由第一次调用方在 `.then` 里做。
 * PWA 和路由可能同时发现新版本，第二下不再弹、也不再刷新。
 */
export const updateVersionBox = (): Promise<MessageBoxData> => {
	if (versionBoxOpen) {
		return new Promise<MessageBoxData>(() => {
			// 弹窗还在，这次的 then 停在这里
		})
	}
	versionBoxOpen = true
	const { t } = i18n.global
	return SacoMessageBox({
		title: t('update_version_title'),
		message: t('update_version_message'),
		confirmButtonText: t('update_version_confirm'),
		closeOnClickModal: false,
		closeOnPressEscape: false,
		showClose: false,
		showCancelButton: false,
		customClass: 'pwa-message-box',
	}).finally(() => {
		versionBoxOpen = false
	})
}
