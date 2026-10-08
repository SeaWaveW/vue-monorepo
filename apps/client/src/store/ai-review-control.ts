import { createStore } from '#/pinia'
import type {
	AgentFormData,
	AiReviewAgentItem,
	TaskItem,
} from '@/hooks/ai-review-control/types'

export type { AgentFormData, TaskItem } from '@/hooks/ai-review-control/types'

/** Pinia 只存业务快照；合并 / 写桶 / HTTP 见 hooks + make.ts */
export const useAiReviewControlStore = createStore(
	'aiReviewControl',
	{
		state: () => ({
			localTaskList: [] as TaskItem[],
			serverTaskList: [] as TaskItem[],
			taskId: '',
			agentList: [] as AiReviewAgentItem[],
			dataMap: {} as Record<string, AgentFormData>,
			/** my-page 分页缓存，不 persist */
			taskPageNum: 0,
			taskTotal: 0,
		}),
		getters: {
			taskList() {
				return this.localTaskList.concat(this.serverTaskList)
			},
		},
		actions: {
			clearCache() {
				this.localTaskList = []
				this.serverTaskList = []
				this.taskId = ''
				this.agentList = []
				this.dataMap = {}
				this.taskPageNum = 0
				this.taskTotal = 0
			},
		},
	},
	['localTaskList', 'serverTaskList', 'taskId', 'dataMap'],
)
