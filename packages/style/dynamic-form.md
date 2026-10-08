# 动态表单栅格（`dynamic-form.scss`）

画布、预览、客户端渲染区共用这一套，**不要吃页面表单的 `--grid-column-size`**。

`ui-reset` 只给 `.layout-container` 里的普通页表单排 5 列。设计器（`.dynamic-component`）和预览（`.preview-component`）已排除在外，列数和跨列在这里自己设。

不要写进 `@saco/common/style.scss` 入口，业务按需 `@use`。

## 变量

外壳上写，不要和页面 `--column-span` 混用。

| 变量 | 写在哪 | 含义 |
| --- | --- | --- |
| `--proportion-columns` | 栅格容器 | 当前面板列数，等于 `proportion`（1–5） |
| `--proportion-span` | 每个格子 | 该字段跨几列；缺省或大于列数时按 `min(span, columns)` 收 |

```html
<div :style="{ '--proportion-columns': Number(proportion) }">
	<div
		v-for="item in components"
		:style="{
			'--proportion-span': Number(item.proportion) || Number(proportion),
		}"
	/>
</div>
```

## Mixin

```scss
@use '#/style/dynamic-form.scss' as *;
```

| Mixin | 套在谁身上 | 做什么 |
| --- | --- | --- |
| `dynamic-form-grid` | 栅格容器 | `repeat(--proportion-columns, minmax(0, 1fr))`；列距 17px，行距 20px（给客户端绝对定位的校验文案留空） |
| `dynamic-form-item-box` | 每个字段外壳 | 固定高度、跨列、表单项和上传撑满格子 |

`:deep` 写在 mixin 里，从外壳穿透，避免再套一层打不到 `SacoUploadSingle`。

## 谁在用

- 管理端画布：`rendering/index.vue` 的 `.component-container` / `.component-item`
- 管理端预览：`preview/index.vue` 的 `.preview-component` / `.preview-component__item`

客户端渲染区同样：容器 `@include dynamic-form-grid`，格子 `@include dynamic-form-item-box`，只设上面两个变量。
