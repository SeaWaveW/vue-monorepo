<template>
	<div class="task-panel">
		<SacoCard class="task-list">
			<template #header>
				<div class="logo-box">
					<img :src="logo" alt="logo" />
					<span>{{ t('control_logo_title') }}</span>
				</div>
				<SacoButton
					type="primary"
					icon="antOutline-plus"
					@click="addTask"
				>
					{{ t('control_add_task') }}
				</SacoButton>
			</template>
			<div class="task-list__scroll" @scroll="onListScroll">
				<div
					v-for="item in taskList"
					:key="`${item.id ?? item.uniqueId}-${item.uniqueId === highlightTaskId ? highlightEpoch : 0}`"
					class="task-item"
					:data-review-id="item.id"
					:data-task-unique-id="item.uniqueId"
					:class="{
						'is-active': !item.id && item.uniqueId === taskId,
						'is-fail':
							item.reviewStatus === ReviewRecordReviewStatus.Fail,
						'is-afoot':
							item.reviewStatus ===
							ReviewRecordReviewStatus.Reviewing,
						'is-highlight': item.uniqueId === highlightTaskId,
					}"
					@click="onTaskClick(item)"
				>
					<div
						v-if="
							item.reviewStatus ===
							ReviewRecordReviewStatus.Reviewing
						"
						class="saco-upload-light-effect"
						aria-hidden="true"
					>
						<span class="saco-upload-light-effect__beam" />
					</div>
					<h3 class="task-name">{{ item.reviewRecordIdentifier }}</h3>
					<div class="task-desc">
						<label>
							{{
								hmdhmsFormatter(
									item.editTime || item.createTime,
								)
							}}
						</label>
						<span @click.stop>
							<SacoDropdown
								:ref="
									(el) =>
										setTaskMenuRef(taskMenuKey(item), el)
								"
								trigger="click"
								placement="bottom-end"
								popper-class="task-menu-popper"
								@visible-change="
									(open) =>
										onTaskMenuVisible(
											taskMenuKey(item),
											open,
										)
								"
								@command="
									(command) => onTaskMenu(item, command)
								"
							>
								<SacoSvg
									class="task-desc__more"
									name="ze-ellipsis"
								/>
								<template #dropdown>
									<SacoDropdownMenu>
										<SacoDropdownItem command="rename">
											{{ t('rename') }}
										</SacoDropdownItem>
										<SacoDropdownItem
											v-if="
												item.id ||
												localTaskList.length > 1
											"
											command="delete"
										>
											{{ t('delete') }}
										</SacoDropdownItem>
									</SacoDropdownMenu>
								</template>
							</SacoDropdown>
						</span>
					</div>
				</div>
			</div>
			<template #footer>
				<SacoButton icon="mb-search" @click="searchMore">
					{{ t('search_more_review_record') }}
				</SacoButton>
			</template>
		</SacoCard>
	</div>
</template>
<script lang="ts" setup name="AiReviewControlTaskList">
import logo from '#/assets/img/logo.png'
import { hmdhmsFormatter } from '#/utils/formatter'
import {
	AI_REVIEW_CONTROL_KEY,
	type AiReviewControlContext,
} from '@/hooks/ai-review-control/context'
import type { TaskItem } from '@/hooks/ai-review-control/types'
const { t } = useI18n()
const { task } = inject(AI_REVIEW_CONTROL_KEY) as AiReviewControlContext
const {
	taskId,
	taskList,
	highlightTaskId,
	highlightEpoch,
	localTaskList,
	addTask,
	onTaskClick,
	onTaskMenu,
	searchMore,
	onListScroll,
} = task

/** 省略号的 click.stop 到不了 document，先开的菜单不会自己关。落库行没有 uniqueId */
const taskMenuCloseMap = new Map<string, () => void>()
let openedTaskMenuId = ''

const taskMenuKey = (item: TaskItem) => {
	if (item.uniqueId) {
		return `u:${item.uniqueId}`
	}
	return `i:${item.id}`
}

const setTaskMenuRef = (id: string, el: unknown) => {
	const close =
		el && typeof el === 'object'
			? Reflect.get(el, 'handleClose')
			: undefined
	if (typeof close === 'function') {
		taskMenuCloseMap.set(id, () => {
			close()
		})
		return
	}
	taskMenuCloseMap.delete(id)
}

const onTaskMenuVisible = (id: string, open: boolean) => {
	if (!open) {
		if (openedTaskMenuId === id) {
			openedTaskMenuId = ''
		}
		return
	}
	if (openedTaskMenuId && openedTaskMenuId !== id) {
		taskMenuCloseMap.get(openedTaskMenuId)?.()
	}
	openedTaskMenuId = id
}
</script>
<style scoped lang="scss">
.task-panel {
	width: var(--task-panel-width);

	:deep(.saco-card) {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 0 calc(var(--common-gap) * 0.7);
		background-color: transparent !important;
		border: none !important;
		box-shadow: none !important;

		$header-inset-size: calc(var(--common-gap) / 2);

		.saco-card__header {
			display: flex;
			flex-shrink: 0;
			flex-direction: column;
			gap: var(--common-gap);
			align-items: start;
			margin-bottom: var(--common-gap);

			// overflow 不成滚动盒时 gutter 不生效，右侧就留不出槽
			overflow-y: auto;
			scrollbar-gutter: stable;

			.logo-box {
				position: relative;
				user-select: none;

				img {
					width: 230px;
					height: 100px;
					margin-top: -15%;
					margin-left: -12%;
					object-fit: contain;
				}

				span {
					position: absolute;
					bottom: 0.5em;
					left: 0;
					font-size: var(--font-size);
					font-weight: var(--font-bold);
					color: var(--main-color-2);
					text-indent: 0.5em;
				}
			}

			.saco-button {
				width: calc(100% - var(--common-gap));
				margin-left: $header-inset-size;
			}
		}

		.saco-card__body {
			display: flex;
			flex: 1;
			flex-direction: column;
			min-height: 0;

			.task-list__scroll {
				flex: 1;
				min-height: 0;
				padding: 0 $header-inset-size;
				overflow-y: auto;

				// 只占右边，没条时左边不缩，和按钮左缘齐
				scrollbar-gutter: stable;
			}

			.task-item {
				position: relative;
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				height: 91px;
				padding: calc(var(--common-gap) * 1.5)
					calc(var(--common-gap) * 1.9);
				margin-bottom: var(--common-gap);
				cursor: pointer;
				user-select: none;
				border-radius: 8px;

				&:last-child {
					margin-bottom: 0;
				}

				&:hover {
					background-color: var(--white-color);
				}

				.task-name {
					font-size: 16px;
					font-weight: normal;

					@include line-clamp(1);

					color: var(--black-color);
				}

				.task-desc {
					display: flex;
					align-items: center;
					justify-content: space-between;
					width: 100%;

					label {
						color: var(--grey-color-6);
						cursor: pointer;
					}

					.task-desc__more {
						font-size: 24px;
						color: var(--grey-color-8);

						&:hover {
							color: var(--primary-color);
						}
					}
				}

				&.is-active {
					background-color: var(--white-color);

					&::before {
						position: absolute;
						top: 0;
						bottom: 0;
						left: 0;
						width: 4px;
						content: '';
						background-color: var(--primary-color);
						border-radius: 5px 0 0 5px;
					}
				}

				&.is-highlight {
					animation: task-exist-highlight 1s ease-out forwards;

					@at-root {
						@keyframes task-exist-highlight {
							0% {
								background-color: var(--main-color-4);
							}
						}
					}
				}

				&.is-fail {
					.task-name {
						color: var(--red-color-1);
					}
				}

				&.is-afoot {
					position: relative;
					background-color: var(--white-color);

					@include upload-light-effect;
				}
			}
		}

		.saco-card__footer {
			flex-shrink: 0;
			padding: calc(var(--common-gap) / 2) 0;

			// 和 header 一样，不成滚动盒 gutter 不占右侧
			overflow-y: auto;
			scrollbar-gutter: stable;
			border-top: none;

			.saco-button {
				width: calc(100% - var(--common-gap));
				margin-left: $header-inset-size;

				--button-hover-bg-color: color-mix(
					in srgb,
					var(--white-color) 60%,
					transparent
				);
				--button-active-bg-color: color-mix(
					in srgb,
					var(--white-color) 60%,
					transparent
				);
			}
		}
	}
}
</style>
<style lang="scss">
.rename-message-box {
	.saco-message-box {
		width: 450px;
	}
}

.review-afoot-message-box {
	.saco-message-box {
		width: 560px;

		.saco-message-box__title {
			font-size: calc(var(--font-size) + 6px);
		}
	}

	.review-afoot-message {
		line-height: 1.8;
		text-align: left;
		white-space: pre-line;

		strong {
			font-weight: var(--font-bold);
		}
	}

	.saco-message-box__btns {
		.saco-button {
			padding-inline: 20px;
		}
	}
}

.task-menu-popper {
	.saco-dropdown-item {
		&:hover {
			color: var(--white-color) !important;
			background-color: var(--primary-color) !important;
		}
	}
}
</style>
