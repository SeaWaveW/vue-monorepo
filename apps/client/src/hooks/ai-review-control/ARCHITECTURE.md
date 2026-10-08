# AI 审核工作台 — Hook 目标架构（task / agent / dynamic / data）

> 四 Hook：**task / agent / dynamic / data**（`views/ai-review-control/index.vue` 组装并 provide）。纯函数 **`make.ts`**；Pinia 只存业务数据，HTTP/loading 在 **`task.ts` / `agent.ts`** 模块级（**`src/store/ai-review-control.md`**）。**uploadMap + 批量 `onSuccess` 写桶**见本文 §5.3、§6.4–6.5、§8。

---

## 1. 原则

| 原则                 | 说明                                                                                                                                                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **写回键固定**       | 上传 / 批量写 **dataMap** 时用 **`formKeys` + `uniqueId`**，不读「当前选中 tab」的 inject。                                                                                                                                   |
| **表单实例固定**     | `SacoForm :key="formKeys"`；上传 props 带 **`params`**（业务 `AiReviewUploadSessionParams`，common 组件 `generic P`）。                                                                                                        |
| **桶键**             | 读写一律 **`formKeys`**（`dataKey`）+ **`AiReviewUploadSessionParams`**，不另起 session / ctx。                                                                                                                               |
| **Store**            | `taskList` / `agentList` / `dataMap` 仍在 Pinia；Hook 内用 **indexMap** 做 O(1) 下标访问。                                                                                                                                    |
| **data 与 dynamic**  | **dynamic** 独占 **`batchLoadingMap` / `batchSentinelMap` / `uploadLoadingMap` / `uploadMap`**，对外只暴露 **更新 / 读取方法**；**data** 负责 **dataMap 写**、**vBind/vOn**、**映射 + `onBeforeUpload` + `dispatchUpload`**。 |
| **批量不切实例缓存** | 不用 **KeepAlive** 缓存表单；切 agent 会卸上传 SFC，靠 **`mounted` 登记的 `upload` 闭包** + **`onSuccess` 回调** 写桶。                                                                                                       |

### formKeys

```ts
formKeys = dataKey(taskId, agentId) // context.ts，与 dataMap 桶键一致
```

用于：`dataMap` 键、loading 三表 + **uploadMap** 键、表单 `:key`、upload **`params`**。

### AiReviewUploadSessionParams（业务 P）

```ts
interface AiReviewUploadSessionParams {
	formKeys: string
	uniqueId: number
}
```

- 挂在单文件 / 图片 **`params`** 上；相关 **emit 第二参**、**`mounted` 第二参**、**`upload(..., params)`** 均带同一形状。
- **`readUploadTarget(params, fallbackFormKeys, fallbackUniqueId)`**：写桶时 **`params?.formKeys ?? fallback`**，不读当前选中 tab。

---

## 2. 依赖链

```
views/ai-review-control/index.vue（setup）
  ├─ useTask()
  ├─ useAgent({ taskId, agentId })           ← 只传 task 的 id 字段
  ├─ useDynamic({ formKeys, currentAgent })  ← 只传 agent 的字段
  ├─ useData({ formKeys, currentAgent, dynamic })
  └─ provide({ task, agent, dynamic, data })  ← 子组件 inject 仍用完整四包
```

Hook 入参 / inject 类型在 **`types.d.ts`**。**`context.ts`** export **`AI_REVIEW_CONTROL_KEY`**、**`dataKey` / `readFormKeysParts` / `readUploadMapKey`**，并 re-export **`AiReviewControlContext`**。

**组合根（index）按接口传参，不要 `useDynamic(agent)` / `useData({ agent })` 整包透传：** 各 hook 的入参在 §3–§6 写死，意义是 **依赖可见、避免隐式耦合**；provide 给 UI 的仍是完整 `task/agent/dynamic/data`。

```ts
const task = useTask()
const agent = useAgent({ taskId: task.taskId, agentId: task.agentId })
const dynamic = useDynamic({
	formKeys: agent.formKeys,
	currentAgent: agent.currentAgent,
})
const data = useData({
	formKeys: agent.formKeys,
	currentAgent: agent.currentAgent,
	dynamic,
})
```

**formKeys** 由 agent 内 `dataKey(taskId, agentId)` 计算；task **不** export formKeys。

**目录以仓库为准**（仅保留：`task.ts` / `agent.ts` / `dynamic.ts` / `data.ts` / `make.ts` / `types.d.ts` / `context.ts` / 本文 + **`src/store/ai-review-control.md`**）。

---

## 3. task.ts

**职责**：任务创建 / 选中 / 重命名 / 删除 / 轮询；对接 store **`taskId`**、**`taskList`**（每行含 **`reviewAgentId`**）。

### 3.1 内部（不 export）

- **`taskIndexMap`**、**`currentTask`**：仅供 hook 内 **`agentId`** 读写

### 3.2 状态与计算属性（对外）

| 名称           | 说明                              |
| -------------- | --------------------------------- |
| **`taskId`**   | 当前任务 `uniqueId`（对接 store） |
| **`taskList`** | 侧栏列表（对接 store）            |

```ts
const currentTask = computed({
	get: () => {
		if (!taskId.value) {
			return undefined
		}
		return taskList.value[taskIndexMap.value[taskId.value]]
	},
	set: (value) => {
		if (!taskId.value || !value) return
		const index = taskIndexMap.value[taskId.value]
		if (index === undefined) return
		const localCount = store.localTaskList.length
		if (index < localCount) {
			store.localTaskList[index] = value
			return
		}
		store.serverTaskList[index - localCount] = value
	},
})
```

| **`agentId`** | 可写 `computed`，读写当前任务上的 Agent |

```ts
const agentId = computed({
	get: () => {
		return currentTask.value?.reviewAgentId ?? 0
	},
	set: (value: number) => {
		if (!currentTask.value) {
			return
		}
		currentTask.value = {
			...currentTask.value,
			reviewAgentId: value, // 任务行字段名，不是 agentId
		}
	},
})
```

### 3.3 方法（与现网对齐）

`addTask`、`onTaskMenu`（重命名 / 删除）、侧栏轮询、**my-page 合并写 store** 等均在 **`task.ts`**；切任务直接写 **`store.taskId`**。其它模块共用算法见 **make** / **`src/store/ai-review-control.md`**。

**生命周期**：**`onMounted`** — 无本地草稿则 **`addTask()`**，再 **`getTaskList(false)`**；**`onBeforeUnmount`** — **`clearTimeout(pollingTimer)`**、释放 **`taskListLoading`**（无单独 **`dispose`** 函数）。

**不负责**：`agentList` 详情 HTTP、`dataMap`、upload loading。

---

## 4. agent.ts

**职责**：查询详情、拖拽排序；对接 store **`agentList`**。

**入参**：**`UseAgentInput`** — 仅 **`taskId`**、**`agentId`** 两个 `ComputedRef`（来自 task，不传整个 task）。

### 4.1 内部（不 export）

- **`agentIndexMap`**；**`detailLoading`** 读模块 **`agentDetailLoading`**

### 4.2 状态与计算属性

| 名称               | 说明                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| **`formKeys`**     | `computed(() => dataKey(taskId, agentId))`，与 store **dataMap** 键一致 |
| **`currentAgent`** | 可写 `computed`                                                         |

```ts
const currentAgent = computed({
	get: () => agentMap.value[agentId.value],
	set: (value) => {
		if (!agentId.value || !value) return
		const index = agentIndexMap.value[agentId.value]
		if (index === undefined) return
		store.agentList[index] = value
	},
})
```

**读** **`agentIndexMap` + `store.agentList[index]`**（**`currentAgent`**）或 **`findAgent(id)`**（模块外）；**不要** **`buildAgentMap`** 整表索引。**写**改 **`agentList`** 对应下标。UI 用 inject 的 **`agent.currentAgent`**，不读 store getter。

### 4.3 方法

**`watch([taskId, agentId], syncAgentForTask)`**：占 **dataMap** 桶 + **`ensureAgent`**；页签 v-model 写 **`task.agentId`**（与 **`useAgent` 入参同一 computed**）。

**生命周期**：**`onMounted`** → **`loadAgentList()`**；**`onActivated`**（KeepAlive 页签再进，跳过首次以免与 mount 重复）→ 再拉列表；**`onBeforeUnmount`** 里直接清 pending / loading，并 **`forEach(dropAgentPayload)`** 卸详情。

**不负责**：`dataMap` 写、动态表单 vBind。

---

## 5. dynamic.ts

**职责**：动态表单 **渲染态 / 批量态 / 校验视图**。

**入参**：agent 的 **`formKeys`**、**`currentAgent`**。

### 5.1 批量扫描

```ts
batchLoadingMap: Record<formKeys, boolean>
```

| 名称               | 说明                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| **`batchLoading`** | `computed(() => !!batchLoadingMap[formKeys.value])`，给 `batch-file` 等 |

### 5.2 批量哨兵（映射命中的 upload）

```ts
batchSentinelMap: Record<formKeys, number[]>
```

映射接口确认后写入 **本次涉及的 `uniqueId` 列表**，用于和单格 upload loading 联动。

### 5.3 单格 upload loading

```ts
uploadLoadingMap: Record<formKeys, Record<uniqueId, boolean>>
```

### 5.3.1 uploadMap（单文件 OSS 句柄）

```ts
uploadMap: Record<`${formKeys}_${uniqueId}`, DynamicUploadSlotConfig<P>>
```

| 字段                   | 说明                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| **`upload`**           | 组件 **`mounted`** 时登记的 **`exposeUpload` 闭包**（内部仍走 `aliOss.upload` + emit）             |
| **`accept` / `title`** | 供 **`readUploadMapAccept(formKeys)`** 拼批量区 accept（各格一致则合并；有空 accept 则整批不限制） |

**键**：**`readUploadMapKey(formKeys, uniqueId)`**（`context.ts`）→ `` `${formKeys}_${uniqueId}` ``。

**登记 / 摘除**（**`patchUploadMap`**）：

| 调用                                 | 行为                                                                                                                                                      |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`patchUploadMap(fk, id, config)`** | **`config` 非 null** → 写入 / 覆盖                                                                                                                        |
| **`patchUploadMap(fk, id, null)`**   | 卸载；若 **`batchLoadingMap[fk]`** 或 **`batchSentinelMap[fk]`** 含 **`id`** → **不删**（映射或 OSS 进行中切 tab 仍可 **`readUploadMapEntry` → upload**） |

**读取**：**`readUploadMapEntry(formKeys, uniqueId)`** — **`data.dispatchUpload`** 用。

### 5.3.2 对外方法（data / 组件只调这些，不直接读 map 本体）

| 方法                                                                | 作用                                                   |
| ------------------------------------------------------------------- | ------------------------------------------------------ |
| **`updateLoading(formKeys, uniqueId, boolean)`**                    | 更新 **`uploadLoadingMap[formKeys][uniqueId]`**        |
| **`readUploadLoading(formKeys, uniqueId)`**                         | vBind `:loading`                                       |
| **`setBatchLoading(formKeys, boolean)`**                            | 更新 **`batchLoadingMap[formKeys]`**                   |
| **`setBatchSentinels(formKeys, uniqueIds[])`**                      | 映射完成后写 **`batchSentinelMap`**                    |
| **`clearBatchSentinels(formKeys)`**                                 | 批量 **finally** 清空哨兵                              |
| **`patchUploadMap` / `readUploadMapEntry` / `readUploadMapAccept`** | uploadMap 写读                                         |
| **`isAnyUploading`**                                                | 当前 **`formKeys`** 下 batch 或任一格 upload loading   |
| **`onBeforeUnmount`**                                               | 离开工作台清空三表 + uploadMap（无单独 **`dispose`**） |

三表与 **uploadMap 本体不 export**；状态变更 **全部经上表方法**。

### 5.4 批量区禁用

```ts
const batchDisabled = computed(() => {
	const sentinelList = batchSentinelMap[formKeys.value]
	const loadingMap = uploadLoadingMap[formKeys.value] ?? {}
	return sentinelList?.some((uniqueId) => loadingMap[uniqueId])
})
```

整批映射 / 上传中的 **`batchLoadingMap`** 走 **`batchLoading`**（如 `batch-file`）；**`batchDisabled`** 只表示哨兵列表里仍有 upload 在上传。

### 5.5 动态组件与表单壳

| 名称                         | 说明                                                                                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **`components`**             | `computed(() => currentAgent.value?.components ?? [])`（详情进 store 时已摊平，不再读 `schemaJson`）                                      |
| **`formModel`**              | `computed(() => store.dataMap[formKeys.value] ?? {})`；默认值在 **`ensureAgent`** 详情落地时 **`applySeedFormDefaults`** 写入 **dataMap** |
| **`formRules`**              | 由 **`components`** + i18n 生成，挂 **`SacoForm` `:rules`**；不再产出 **`formItems`**                                                      |
| **`hideTitle` / `itemProp`** | 循环 **`components`** 时算标签与 **`prop`**（**`data.vOn`** 校验仍用 **`itemProp`**）                                                     |

### 5.6 与 data 的分工

- **dynamic**：三表 + uploadMap 的 **存储** 与 **patch/read API**。
- **data**：**`dispatchUpload` / `writeUploadResult` / `onBeforeUpload`** 编排；不持有 uploadMap 变量。

---

## 6. data.ts

**职责**：**dataMap 更新** + 动态表单 **vBind / vOn** + **映射 / onBeforeUpload / dispatchUpload**。

### 6.1 入参

**`UseDataInput`**（index 组装，不传整包 agent）：

| 字段               | 来源                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **`formKeys`**     | agent.formKeys                                                                                                          |
| **`currentAgent`** | agent.currentAgent（批量 guard 等）                                                                                     |
| **`dynamic`**      | useDynamic 返回值（**方法** + `components` / `formModel` / `formRules` / `hideTitle` / `itemProp`，**不**暴露三表 map） |

批量与单格 loading **一律调 dynamic 方法**。

**生命周期**：**`onBeforeUnmount`** → **`fileMap = {}`**（无单独 **`dispose`**）。

### 6.2 Store

| 方法                                                  | 说明                                                                                                                                                                                                                                           |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`writeField(formKeys, uniqueId, fieldKey, value)`** | 写 **`dataMap[formKeys][uniqueId]`**                                                                                                                                                                                                           |
| **`getSubmitFormData(formKeys?)`**                    | 提交                                                                                                                                                                                                                                           |
| **`watch(taskList` 的 uniqueId 串)**                  | **`pruneDataMapByTaskList`**：组成变了才裁桶；一个都没裁返回原 **dataMap**，轮询换数组引用不刷表单                                                                                                                                             |
| 侧栏 my-page                                          | **`getTaskList(page, onLoaded)`**；**`onTaskListLoaded`** 里 **`clearTimeout(pollingTimer)`**，仍有「审核中」则 **`setTimeout(pollingTaskList)`**                                                                                              |
| 侧栏点审核中                                          | **`openReviewingTaskBox`**：打开即 **`reviewRecordDurationStatistics`**，预计 / 最长用返回的平均时长和最长时长。已执行用详情 **`currentTimestamp`** 减去任务 **`createTime`**，之后每秒加 1。只能点「我知道了」、关闭钮或 Esc，点遮罩不关      |
| 侧栏删行                                              | **`onTaskMenu` delete**（本地 **`nextCheckIndex` + splice**）                                                                                                                                                                                  |
| 创建落库                                              | **`createTaskSuccessCallback(钉住的 uniqueId)`** 删那条草稿并拉侧栏。弹窗还开着时另每 10 秒查该条详情；收起后停掉详情查询，审核中只靠侧栏轮询。收起时弹窗按锥形收到侧栏对应任务再关（靠近任务的一侧先收尖；已落库对记录 id，否则对钉住的草稿） |

### 6.3 绑定

```ts
const vBind = (item: ComponentItem) => { … }
const vOn = (item: ComponentItem) => { … }
```

- 非 upload：`update:*` → **`writeField(formKeys, uniqueId, fieldKey, value)`**（**formKeys 用 props / 闭包参数，不读当前 tab**）。
- upload：`:loading` ← **`readUploadLoading`**；**`params`** ← `{ formKeys, uniqueId }`；**`mounted`** → **`patchUploadMap(..., config)`** / 卸载 **`null`**；**`update:*`** 第二参 **`params`** → **`readUploadTarget`** → **`writeField`**（点选 / 仍挂载时走 emit）。

### 6.4 单格点选 vs 批量分发

| 路径                         | 写桶                                                                                                                                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 用户点选 **`SacoUpload`**     | 组件 **`emit('update:fileName'                                                                                                                                                            | 'update:fileUrl', …, params)`** → **`vOn`** → **`writeField`** |
| **`dispatchUpload`（批量）** | **`upload(file, sessionParams, onSuccess)`** → OSS 成功后 **`onSuccess({ fileName, fileUrl }, params)`** → **`writeUploadResult`** → **`writeField`**（组件已卸时 emit 到不了 **`vOn`**） |

**`writeUploadResult`**：按 **`item.modelBind.fileName` / `fileUrl`** 写 **`dataMap[target.formKeys][target.uniqueId]`**，与 **`vOn` 的 modelBind 循环** 一致。

**`dispatchUpload` 细节**：

1. **`readUploadMapEntry(bucketFormKeys, uniqueId)?.upload`**，无则静默跳过（未 mount 过或 map 已清）。
2. 每个 **`File`**：**`updateLoading(..., true)`** → **`await upload(file, { formKeys, uniqueId }, callback)`** → **finally `updateLoading(..., false)`**（不依赖卸组件后的 **`update:loading` emit**）。
3. 组内文件串行；多组 **`Promise.all`**（**`uploadMatchedGroup`**）。
4. 结束后若 **`bucketFormKeys === formKeys`**（仍是当前 tab），按 **`itemProp`** 调 **`validateField`**。

### 6.5 批量文件夹（`onBeforeUpload`）

**`params.formKeys`** 与 **`batch-file`** 上 **`:params="{ formKeys: agent.formKeys }"`** 一致（缺省用当前 `formKeys`，切 tab 仍写启动批量那一桶）。

```
fileList + bucketFormKeys
  → setBatchLoading(true)
  → reviewRecordMatchFileUploadComponents（upload 项 title / description 快照 + 当前 Agent skillId）
  → readMatchedRows / readMatchedGroups
  → setBatchSentinels(uniqueIds) + setBatchLoading(false)   // 映射结束，OSS 阶段靠哨兵留 uploadMap
  → Promise.all(groups → dispatchUpload)
  → finally: clearBatchSentinels + setBatchLoading(false)
```

| 步骤             | dynamic / data                                          |
| ---------------- | ------------------------------------------------------- |
| 映射前           | **`setBatchLoading(bucketFormKeys, true)`**             |
| 映射成功且有命中 | **`setBatchSentinels`** → **`setBatchLoading(false)`**  |
| OSS              | **`dispatchUpload`** + 每文件 **`updateLoading`**       |
| **finally**      | **`clearBatchSentinels`**、**`setBatchLoading(false)`** |

**`batchFileAccept`**：优先 **`readUploadMapAccept(formKeys)`**；无登记 upload 时用 **`NONE_ACCEPT`** 拦住批量区。

**`DynamicUploadMultiple`**：**`v-model:loading` ← `dynamic.batchLoading`**；**`beforeUpload` → `data.onBeforeUpload`**；**`setBatchLoading`** 只在 **`onBeforeUpload`** 进出。

---

## 7. 页面与 inject

- **`index.vue`**：创建四个 hook、`provide`；进页 / 离页清理在各 hook **`onMounted` / `onBeforeUnmount`**（agent 另 **`onActivated`**），**离页逻辑直接写在 `onBeforeUnmount`，不要 `dispose()` 壳**。**不在此重复 `formKeys`**，开始审核用 **`agent.formKeys`** / **`task.taskId`** / **`task.agentId`**。
- 子组件 **`inject(AI_REVIEW_CONTROL_KEY)`**，类型见 **`context.ts`**。
- **`agent-form.vue`**：**`SacoForm :key="formKeys"`**（**不用 KeepAlive**）；**`v-for="components"`**；`:model="dynamic.formModel"`、`:rules="dynamic.formRules"`；**`data.vBind` / `data.vOn`**。
- **`batch-file.vue`**：**`:params="{ formKeys }"`**、**`dynamic.batchLoading`**、**`data.onBeforeUpload`**、**`data.onGuardBatch`**。

---

## 8. @saco/common 上传（与工作台对接）

类型见 **`@saco/common/dynamic/upload/single/types`**（图片 **`mounted`** 用同一 **`DynamicUploadSlotConfig`**）。

| 能力                                    | 说明                                                                                                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`generic="P = any"`**                 | 工作台 **`P = AiReviewUploadSessionParams`**                                                                                                                             |
| **`params?: P`**                        | props 默认快照；单次 OSS 用 **`explicitParams ?? props.params`**                                                                                                         |
| **emit**                                | **`update:fileName` / `update:fileUrl` / `update:loading`** 均 **`(value, params?)`**                                                                                    |
| **`mounted`**                           | **`(config: DynamicUploadSlotConfig \| null, params?)`**；**`config = { upload, accept?, title? }`**                                                                     |
| **`defineExpose({ upload })`**          | 与 **`config.upload`** 同一函数                                                                                                                                          |
| **`upload(file, params?, onSuccess?)`** | 第三参 **`UploadSuccessHandler<P>`**：**`( { fileName, fileUrl }, params ) => void`**；与 emit **并行**；带 **`onSuccess`** 时跳过「已在 loading」守卫（批量卸组件场景） |
| **卸载**                                | **`emit('mounted', null)`** + abort 当前 put；**uploadMap 闭包** 在哨兵/batch 期间仍可调（业务 **`patchUploadMap(null)`** 不删项）                                       |
| **多文件 `DynamicUploadMultiple`**      | **`beforeUpload` / `success`** 第二参 **`params`**；批量 loading 由业务 **`setBatchLoading`**                                                                            |

无挂载组件时校验可用 **`detectDynamicUploadFile(file, item)`**（accept / size 与单文件 props 默认一致）。

---

## 9. 目标文件

```
hooks/ai-review-control/
  task.ts
  agent.ts
  dynamic.ts
  data.ts
  context.ts          // inject key + 类型
  ARCHITECTURE.md
views/ai-review-control/
  index.vue           // provide
```
