<template>
	<div class="overview">
		<div v-for="(item, index) in items" :key="item.title" class="card">
			<div class="main">
				<div class="copy">
					<div class="title">{{ item.title }}</div>
					<div class="count">{{ item.count }}</div>
				</div>
				<div
					class="icon"
					:style="{ backgroundColor: iconBackgrounds[index] }"
				>
					<SacoSvg class="overview__icon" :name="item.icon" />
				</div>
			</div>
			<div class="desc">
				<span class="label">{{ item.desc }}</span>
				<SacoSvg
					class="arrow"
					:class="item.direction === 'up' ? 'is-up' : 'is-down'"
					:name="
						item.direction === 'up'
							? 'arcoDesign-arrow-rise'
							: 'arcoDesign-arrow-fall'
					"
				/>
				<span class="ratio" :class="`is-${item.ratioType}`">
					{{ item.ratio }}
				</span>
			</div>
		</div>
	</div>
</template>
<script lang="ts" setup name="HomeInfoOverview">
import type { SvgName } from '@saco/ui'

export interface InfoOverviewItem {
	title: string
	count: string
	icon: SvgName
	desc: string
	direction: 'up' | 'down'
	ratio: string
	ratioType: 'default' | 'success' | 'danger'
}

defineProps<{
	items: InfoOverviewItem[]
}>()

/** 按卡片顺序：2、3 在左，图标在右 */
const iconBackgrounds = [
	'var(--main-color-6)',
	'var(--green-color-1)',
	'var(--pluple-color-1)',
	'var(--yellow-color-1)',
	'var(--main-color-5)',
	'var(--pluple-color)',
]
</script>
<style scoped lang="scss">
.overview {
	display: grid;
	grid-template-columns: repeat(6, minmax(0, 1fr));
	column-gap: var(--home-column-gap);

	.card {
		display: flex;
		flex-direction: column;
		gap: 4px;
		justify-content: space-between;
		height: 100%;
		min-height: 137px;
		padding: 16px 20px;
		background-color: var(--white-color-4);
		border-radius: 16px;

		.main {
			display: flex;
			align-items: center;
			justify-content: space-between;

			.copy {
				display: flex;
				flex-direction: column;
				gap: 12px;
				min-width: 0;

				.title {
					font-size: 16px;
					font-weight: var(--font-bold);
					color: var(--black-color-1);
				}

				.count {
					font-size: 20px;
					font-weight: var(--font-bold);
					color: var(--black-color-1);
				}
			}

			.icon {
				display: flex;
				flex-shrink: 0;
				padding: 10px;
				border-radius: 10px;

				.overview__icon {
					font-size: 35px;
					color: var(--white-color);
				}
			}
		}

		.desc {
			display: flex;
			gap: 4px;
			align-items: center;
			font-size: 16px;

			.label {
				color: var(--info-color);
			}

			.arrow {
				font-size: 20px;

				&.is-up {
					color: var(--success-color);
				}

				&.is-down {
					color: var(--danger-color);
				}
			}

			.ratio {
				color: var(--black-color-1);

				&.is-success {
					color: var(--success-color);
				}

				&.is-danger {
					color: var(--danger-color);
				}
			}
		}
	}
}
</style>
