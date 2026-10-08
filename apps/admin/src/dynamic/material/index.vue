<template>
	<div class="material-component">
		<div class="header-title">
			<p class="title">{{ t('dynamic_form_com_title') }}</p>
			<p class="tips">{{ t('dynamic_form_com_title_tips') }}</p>
			<div class="proportion-box">
				<p class="title">{{ t('panel_width') }}</p>
				<SacoTabs v-model="proportion">
					<SacoTabPane
						v-for="item in Number(PROPORTION_MAX_SIZE)"
						:key="item"
						:label="String(item)"
						:name="item"
					/>
				</SacoTabs>
			</div>
		</div>
		<div
			v-for="item in componentStore.components"
			:key="item.title"
			class="material-item"
		>
			<div class="material-title">{{ t(item.title) }}</div>
			<div v-if="item.children?.length" class="material-children">
				<div
					v-for="citem in item.children"
					:key="citem.name"
					class="component-item"
					:data-component-name="citem.name"
					:draggable="citem.usable"
				>
					<SacoButton>
						<template #icon>
							<SacoSvg
								class="component-item__icon"
								:name="(citem.icon as SvgName)"
							/>
						</template>
						{{ t(citem.name) }}
					</SacoButton>
				</div>
			</div>
		</div>
	</div>
</template>
<script lang="ts" setup name="Material">
import { useComponentStore } from '#/store'

import {
	PROPORTION_DEFAULT_SIZE,
	PROPORTION_MAX_SIZE,
} from '#/utils/proportion'
const { t } = useI18n()
const componentStore = useComponentStore()
const proportion = defineModel<TabPaneName>('proportion', {
	default: PROPORTION_DEFAULT_SIZE,
})
</script>
<style scoped lang="scss">
.material-component {
	$padding-x: calc(var(--common-gap) * 2.3);

	height: 100%;
	min-height: 0;
	padding: 0 calc(var(--common-gap) * 1.4) var(--header-top) $padding-x;

	@include overflow-y-hover;

	.header-title {
		margin-bottom: 0 !important;

		$blank-space: var(--common-gap);

		.proportion-box {
			display: flex;
			gap: calc(var(--common-gap) * 1.8);
			align-items: center;
			padding-bottom: $blank-space;
			margin: calc(var(--common-gap) * 2.3) 0
				calc(var(--common-gap) * 2.4);

			$tab-border-width: 5px;

			.title {
				margin-bottom: $tab-border-width;
				font-size: var(--font-size) !important;
				font-weight: normal !important;
			}

			:deep(.saco-tabs) {
				flex: 1;

				@include tabs-scroll-border(
					$item-size: var(--proportion-max),
					$item-height: 38px,
					$item-font-size: var(--font-size),
					$active-border-width: $tab-border-width,
					$active-border-radius: 5px
				);

				.saco-tabs__item {
					padding: 0;
				}
			}
		}
	}

	.material-item {
		margin-bottom: calc(var(--common-gap) * 5);

		.material-title {
			margin-bottom: calc(var(--common-gap) * 1.5);
			font-size: 18px;
		}

		.material-children {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: calc(var(--common-gap) * 2) $padding-x;

			.component-item {
				position: relative;
				flex: 1;
				cursor: pointer;

				.component-item__icon {
					font-size: 18px;
				}

				:deep(.saco-button) {
					width: 100%;
					height: 40px;
					margin: 0;
					pointer-events: none;

					.saco-button__text {
						@include line-clamp(1);

						// 按钮文案默认 inline-flex，文字是 flex 项，省略号加不到行盒上
						display: block;

						// 父按钮是 flex，min-width:auto 会按整段文案撑开，nowrap 也不截断
						min-width: 0;
						margin-bottom: 0;
					}
				}

				&[draggable='false'] {
					cursor: no-drop;

					&::before {
						position: absolute;
						inset: 0;
						z-index: 3;
						content: '';
					}

					&:hover {
						&::before {
							backdrop-filter: blur(1px);
						}
					}
				}
			}
		}
	}
}
</style>
