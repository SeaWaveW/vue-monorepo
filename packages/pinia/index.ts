import { createPinia } from '@saco/pinia'

/**
 * 全应用一份 pinia。createStore 和路由都从这里取，另建一份会对不上 inject。
 * 实现在 npm 的 `@saco/pinia`，这里不再抄一份。
 */
export {
	createPinia,
	createStore,
	defineStore,
	storeToRefs,
	acceptHMRUpdate,
	getActivePinia,
	setActivePinia,
	mapActions,
	mapGetters,
	mapState,
	mapStores,
	mapWritableState,
	setMapStoreSuffix,
} from '@saco/pinia'
export type * from '@saco/pinia'

export const pinia = createPinia()
