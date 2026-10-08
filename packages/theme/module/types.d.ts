export {}

/** 主题色（与 module/light.json、dark.json 对齐） */
export interface ThemeColors {
	/** 主色调 */
	primaryColor: string
	/** 成功色 */
	successColor: string
	/** 警告色 */
	warningColor: string
	/** 危险色 */
	dangerColor: string
	/** 信息色 */
	infoColor: string
	/** 白色（表格高光） */
	whiteColor: string
	/** 黑色 */
	blackColor: string
	/** 文字色 */
	textColor: string
	/** 按钮/tabs标签 */
	mainColor: string
	/** 登录页四功能明细 */
	mainColor1: string
	/** 登录页项目标题 */
	mainColor2: string
	/** 控制台排行进度条 */
	mainColor3: string
	/** 导航已收藏颜色 */
	mainColor4: string
	/** 控制台审核图标 */
	mainColor5: string
	/** 控制台审核图标 */
	mainColor6: string
	/** 登录页表单阴影 */
	mainColor7: string
	/** 查询页主色调按钮 */
	mainColor8: string
	/** 审核任务进行中模糊色 */
	mainColor9: string
	/** 控制台比较文字 */
	greenColor: string
	/** 控制台审核图标 */
	greenColor1: string
	/** 成功提示背景色 */
	greenColor2: string
	/** 控制台审核图标 */
	plupleColor: string
	/** 控制台审核图标 */
	plupleColor1: string
	/** 控制台比较文字 */
	redColor: string
	/** 控制台文字/按钮禁用图标色 */
	redColor1: string
	/** IP管理风险说明 */
	yellowColor: string
	/** 控制台审核图标/下拉/日期组件的图标 */
	yellowColor1: string
	/** 文字组件警告色 */
	yellowColor2: string
	/** 文件夹上传图标色/控制台比较文字/上传组件描述色 */
	greyColor: string
	/** 审核工作台agent描述 */
	greyColor1: string
	/** 输入框字体颜色 */
	greyColor2: string
	/** 下拉/日期组件的图标 */
	greyColor3: string
	greyColor4: string
	/** 分页组件模糊色 */
	greyColor5: string
	/** 审核工作台任务时间 */
	greyColor6: string
	/** 审核工作台进度条未达色/说明图标色/多选组件未选色 */
	greyColor7: string
	/** 导航菜单更多图标 */
	greyColor8: string
	/** 导航抽屉模糊色/边框色 */
	greyColor9: string
	/** 导航未收藏颜色 */
	greyColor10: string
	/** 导航蒙层色/表格边框色 */
	greyColor11: string
	/** layout头部背景/内容区背景 */
	greyColor12: string
	/** 表格单行背景色 */
	greyColor13: string
	/** layout控制台内容背景色/导航抽屉背景色 */
	greyColor14: string
	/** layout工具栏阴影色 */
	greyColor15: string
	/** 动态表单绘画区阴影 */
	greyColor16: string
	/** 下拉框搜索边框色 */
	greyColor17: string
	/** 表格修改笔图标色 */
	greyColor18: string
	/** AI审核控制台中间卡片模糊 */
	greyColor19: string
	/** AI审核控制台中间卡片背景色 */
	greyColor20: string
	/** AI审核控制台文件夹上传背景色 */
	greyColor21: string
	/** layout页面工具栏背景色 */
	whiteColor1: string
	/** 表格表头/双行背景色 */
	whiteColor2: string
	/** 输入框背景色 */
	whiteColor3: string
	/** 主页卡片背景色 */
	whiteColor4: string
	/** 文字颜色 */
	blackColor1: string
	/** 遮罩背景色 */
	blackColor2: string
	/** 桌面栏色 */
	pwaColor: string
}

/** 主题色字段名 */
export type ThemeColorKey = keyof ThemeColors

declare module './light.json' {
	const colors: ThemeColors
	export default colors
}

declare module './dark.json' {
	const colors: ThemeColors
	export default colors
}
