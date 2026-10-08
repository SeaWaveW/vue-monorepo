# AI 审核工作台 — 数据层（Pinia + make）

页面入口：`views/ai-review-control/index.vue`  
四 Hook、上传、inject：**`src/hooks/ai-review-control/ARCHITECTURE.md`**

---

## 1. 当前模型（一条线）

```
HTTP / UI 事件 → task.ts | agent.ts | data.ts | dynamic.ts
                      ↓
              make.ts（纯函数：算下一帧快照）
                      ↓
              apply* / 赋值写回 Pinia
                      ↓
              persist 插件只落 localTaskList / serverTaskList / taskId / dataMap
```

- **Pinia**：可持久化的**字段容器** + **`clearCache`**。没有 merge / writeField 等 action，避免和 make 双份逻辑。
- **make.ts**：跨模块共用的纯函数 / 写回（**`applySeedFormDefaults`**、**`pruneDataMapByTaskList`** 等）。**侧栏 my-page** 在 **`task.ts` `getTaskList`** 内直接写 **`serverTaskList`**。删草稿在 **`deleteLocalDraftRow`**。
- **types.d.ts**：`TaskItem`、`AiReviewAgentItem`、`AgentFormData`、Hook 入参、`AiReviewTaskDataSlice` 等。
- **Hook**：编排 HTTP、loading、computed（`currentTask` / `formKeys` / `currentAgent` 只在这里和 make 推导，**不进 store getter**）。

401 / 登出：此时通常不在审核页，**`App.vue`** `onClearAuthStorage` 只调 store **`clearCache()`**（清 persist 快照）。侧栏轮询、Agent pending、upload 三表等模块状态在各 hook **`onBeforeUnmount`** 内直接清（**`index.vue` 不调**；**不要 `dispose()` 只包一层**）。

---

## 2. Store 字段

| 字段                        | persist | 说明                                                                |
| --------------------------- | ------- | ------------------------------------------------------------------- |
| `localTaskList`             | 是      | 侧栏本地草稿（无 `id`，必带 `uniqueId`）                            |
| `serverTaskList`            | 是      | 侧栏已加载落库行                                                    |
| `taskId`                    | 是      | 当前选中任务的 `uniqueId`                                           |
| `dataMap`                   | 是      | 键 = `` `${taskId}_${agentId}` ``（与 `formKeys` 同规则）           |
| `agentList`                 | 否      | 授权行 + 运行时详情；进页 **`fetchAgentList` / `ensureAgent`** 重建 |
| `taskPageNum` / `taskTotal` | 否      | my-page 分页；刷新后 **`getTaskList`** 重算                         |

Getter：仅 **`taskList`**（`localTaskList.concat(serverTaskList)`）。写草稿 / 落库分别改两数组，**不要**给 getter 赋值。滚到底是否再拉在 **`onListScroll`** 比 **`serverTaskList.length` 与 `taskTotal`**。Agent 按 id：**`findAgent`** / **`agentIndexMap` + `agentList[index]`**，**禁止** Pinia **`agentMap`**、**禁止**整表 **`buildAgentMap`** 再包一层。

Action：仅 **`clearCache()`**。

---

## 3. make.ts 分工（查表用）

### 3.1 只读 / 键

| 函数                                                                 | 用途                                                   |
| -------------------------------------------------------------------- | ------------------------------------------------------ |
| `dataKey` / `readFormKeysParts` / `readUploadMapKey`（`context.ts`） | 桶键、uploadMap 键                                     |
| `readTaskReviewAgentId` / `readDataId`                               | 从 `taskList` + `taskId` 取当前 `reviewAgentId` / 桶键 |
| `findAgent`（agent.ts）                                              | **`agentList.find(id)`**                               |

### 3.2 产出下一帧（纯函数）

| 函数                                             | 写回谁                                                         |
| ------------------------------------------------ | -------------------------------------------------------------- |
| `pruneDataMapByTaskList`                         | **`useData` watch `taskList`**；按侧栏仍存在的 `uniqueId` 裁桶 |
| `mergeAgentListFromRecords` / `reorderAgentList` | `store.agentList = …`（agent.ts）                              |
| `applyAgentDetailToItem`                         | 原地改 `agentList` 元素                                        |
| `ensureDataMapBucket` / `applySeedFormDefaults`  | `store.dataMap = ensure…`；详情落地补 defaultModel             |
| `writeDataMapField`                              | `store.dataMap = …`（data.ts）                                 |
| `buildReviewRecordCreateData`                    | 提交体（data.ts），内含 inputDataJson                          |
| `toAgentItem` / `dropAgentPayload`               | 授权行合并详情 / 卸详情                                        |

### 3.3 模块级状态（不进 Pinia）

| 位置     | 内容                                                                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| task.ts  | 模块内 **`getTaskList` / `pollingTaskList`**（不 export）；对外 **`useTask`**（含 **`createTaskSuccessCallback`**）；**`pollingTimer`** + **`taskListLoading`** |
| agent.ts | `agentDetailLoading`、`fetchAgentList`、`ensureAgent`、`useAgent`                                                                                               |

---

## 4. 禁止再出现的模式

| 不要                                                                                  | 应                                                                                                                                                                           |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| store 里 patch / HTTP / loading                                                       | make + hook                                                                                                                                                                  |
| store getter 推导 `currentTask` / `agentId` / `dataId`                                | make + `useTask` / `useAgent`                                                                                                                                                |
| store getter **`agentMap`** / **`hasMoreTasks`** / **`buildAgentMap` 整表索引**       | **`findAgent`** / **`useAgent` `agentIndexMap`**                                                                                                                             |
| `task.ts` 删菜单里清 dataMap                                                          | **`useData` 监听 `taskList`** + `pruneDataMapByTaskList`                                                                                                                     |
| 单独 `task-list.ts` / `agent-store.ts` / `runtime.ts` / `store/*.make.ts`             | 已并入上表模块                                                                                                                                                               |
| export 与现有字段同 ref 的别名（如 `currentTaskId`）                                  | 只保留 **`taskId`**                                                                                                                                                          |
| 不参与模板绑定的 loading 用 `ref`                                                     | 模块内 **`boolean`**（如 `taskListLoading`）                                                                                                                                 |
| 登录成功再清一遍工作台快照                                                            | 只依赖 **`onClearAuthStorage`**                                                                                                                                              |
| 删 helper 后留 no-op `if`、或 `foo!` 代替已删守卫                                     | 分支对齐新语义；切任务只写 **`store.taskId`**，Agent 跟 **`useAgent` watch**                                                                                                 |
| 薄包装再导出（`openTaskDetail`、`readAgentChecklists`、`useData` 转发 `getTaskList`） | 调用点 **`from task.ts`** 或 **`useTask.createTaskSuccessCallback`**（inject）                                                                                               |
| 审核完成再 **`loadTaskList` + `addTask`**                                             | 创建回包只带 id，**`createTaskSuccessCallback(uniqueId)`** 删钉住的草稿并拉侧栏。弹窗未关才每 10 秒查该条详情；收起后停掉。**`onComplete`** 只在详情结束且弹窗仍开着时开结果 |

改 `src/hooks/ai-review-control/**` 时按 **`.cursor/rules/ai-review-control-hooks.mdc`**。

---

## 6. 改完必扫（防历史遗留）

在 `report_review_client` 根目录：

```bash
rg "agentMap|hasMoreTasks|buildAgentMap" src/store/ai-review-control.ts
rg "task-list\\.ts|agent-store|runtime\\.ts|aiReviewTask|currentTaskId|store\\.currentAgent|store\\.agentId|store\\.agentMap|store actions" src
rg "export const taskListLoading = ref" src/hooks/ai-review-control
rg "openTaskDetail|readAgentChecklists|uniqueId!|querySelector\\(.+\\)!" src/hooks/ai-review-control src/components/ai-review-control
rg "from '\\./task'|fetchTaskList|applyCreatedTask|resetTaskListSync|clearAiReviewControlSession" src/hooks/ai-review-control/data.ts src/hooks/ai-review-control/dynamic.ts
rg "applyRemoveLocalTask|readHasMoreTasks|patchLocalTaskFromServerRow|buildTaskById" src/hooks/ai-review-control
```

有命中 → 删或改到上表模块；并同步 **`ARCHITECTURE.md`** 与本文件。

---

## 5. 对外类型

业务若只需任务行类型：`import type { TaskItem, AgentFormData } from '@/store/ai-review-control'`（re-export 自 `types.d.ts`）。
