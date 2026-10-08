/**
 * 编辑器从当前文件往上找 tsconfig，共享组件落到仓库根配置。
 * 这两份是 SacoUiPlugin 生成的业务图标名；不引进来时 SvgName 只有库内置名字。
 */
import '../apps/client/.types/saco-ui'
import '../apps/admin/.types/saco-ui'
