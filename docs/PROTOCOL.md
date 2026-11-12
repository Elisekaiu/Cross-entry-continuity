# 技术协议与状态机

这页把参考实现背后的协议拆开讲。代码在 `examples/`，这里重点解释每个状态为什么存在，以及哪些细节是我们实际踩坑后留下来的。

## 1. 四种数据对象

### Surface transition

只记录「某个聊天入口被打开／关闭」这类**转场事件**，不包含聊天正文。

参考事件：

```json
{"app":"chatgpt","event":"open","at":"2026-11-11T10:00:00Z"}
{"app":"chatgpt","event":"close","at":"2026-11-11T10:12:00Z"}
```

一次有效的 `open → close` 形成新的 `revision`，collector 将它标记为 `dirty`。

### Capture job

真正让浏览器抓消息的任务：

```json
{
  "id": "job_...",
  "revision": 42,
  "status": "pending",
  "capture_start": "...",
  "capture_end": "..."
}
```

它属于某一个 revision，因此同一次转场可以做到幂等：重复 `request(revision)` 不会不断创建新任务。

### Continuity event

短期上下文库中的实际消息。常见来源：

- `source=official, kind=message`：Chat → Agent 的短消息批次
- `source=official, kind=checkpoint`：Chat 主动留下的短期 checkpoint
- `source=agent, kind=message`：Agent → Chat 的增量日志消息

### Cursor

有两类游标：

1. **消息游标**：哪些消息 ID 已经真正消费过；
2. **日志文件游标**：反向读取 JSONL 时已经读到哪个 byte offset。

两者都用于做到「只搬新增内容」。

---

## 2. Chat → Agent：完整状态流

```mermaid
stateDiagram-v2
    [*] --> Clean
    Clean --> Dirty: open → close / revision++
    Dirty --> Pending: request(revision)
    Pending --> Claimed: extension claim
    Claimed --> ReadyBatch: upload(messages)
    Claimed --> ReadyNoDelta: complete(no_delta)
    Claimed --> Failed: capture / identity / timeout error
    ReadyBatch --> Completed: downstream consume ACK
    ReadyNoDelta --> Completed: downstream consume ACK
    Failed --> Clean: settle failed revision
    Completed --> Clean: advance consumed cursor
```

对应的 `preflight` 只返回四种高层动作：

| action | 意义 | Hook 怎么做 |
| --- | --- | --- |
| `skip` | 没有新转场 | 直接让 Agent 正常回复 |
| `capture` | 有新的 dirty revision | 创建一次 capture job |
| `in_flight` | 已经有 pending / claimed job | 不新建任务 |
| `consume_ready` | 已有 ready job | 读取对应 event，ACK 后注入 |

这让 Hook 不需要理解浏览器内部逻辑，只要处理一个很小的状态接口。

---

## 3. 为什么 ACK 之后才提交“已看过”消息

这是整个设计里最值得保留的一个细节。

假设浏览器抓到了消息 `m101, m102, m103`：

1. 扩展上传成功；
2. collector 写入 continuity；
3. 但 Agent Hook 在读取前崩了。

如果扩展在第 1 步就把 `m101–m103` 记为 seen，下次它们就永远不会再被选中，虽然 Agent 实际没有收到。

所以更稳妥的做法是：

```text
upload -> pending seen IDs
downstream read -> consume ACK
ACK observed by extension -> commit pending IDs into seen cursor
```

参考扩展中的 `pending` 就是为了这个目的。

### 一个额外边界：同一句话说两次

纯文本 fingerprint 很适合在 DOM ID 不稳定时兜底，但它不能压过一个**可靠的新 message ID**。

例如：

```text
m100 user: "亲亲"
m102 user: "亲亲"
```

第二句是新的真实消息。生产实现里我们最终采用「稳定 ID 优先，fingerprint 只做辅助」的策略，避免相同文本被误判成旧消息。

公开示例为了保持短小，目前只展示 ID cursor。

---

## 4. `no_delta` 和 `failed` 必须分开

两者看起来都可能导致“这次没有注入消息”，但语义完全不同。

### no_delta

浏览器身份确认成功、采集也成功，只是没有新的未消费消息。

这是一轮**成功的空交接**。

### failed

抓取过程本身没完成，例如：

- 没有可确认的 Chat 标签；
- route ID 不匹配；
- 页面结构变化；
- 任务等待超时；
- 上传失败。

这是一轮**失败终态**。

把二者分开，诊断页会清楚很多，也不会把「系统工作正常但没有新消息」误报成故障。

---

## 5. 为什么 failed 不自动重建同一 revision

Agent 的下一条真实消息会再次经过 Hook。如果 failed revision 仍然被 `preflight` 当作 `capture`，那么每条消息都可能重新创建同一个任务。

这会造成：

- Hook 反复等待；
- 浏览器重复抓取；
- 同一错误一直出现；
- 更差的情况下，模型入口每次回复都被交接流程拖慢。

所以我们把 failed 当成一次转场的终态：

```text
revision 42 failed
→ consumed cursor / terminal cursor 前进
→ revision 42 不再自动重建
→ 下一次真实 open → close 产生 revision 43
```

这里有一个顺序细节：如果旧 revision 还有一个已经 `ready`、但尚未 ACK 的批次，就不能因为更新的 revision 失败而跨过去。**旧的 ready 内容先消费，新的 failed 再结算。**

---

## 6. 时间窗口与消息游标分别解决什么

转场的 `capture_start / capture_end` 很适合描述“用户大概什么时候在这一入口活动”。

但网页抓取不一定能给每个可见 DOM 消息提供可靠时间戳。

我们生产实现后来采用：

- **当前 route 已可靠确认**：优先按 message cursor 选未消费消息；
- **只剩本地缓存／身份较弱的 fallback**：才更依赖时间窗口与缓存时间做约束。

原因很简单：一个刚出现的 DOM tail 没有消息时间，不应该因为缺少 timestamp 被错误判成 `no_delta`。

---

## 7. Agent Hook 为什么放在“下一条真实用户消息”前

我们没有让 Agent 自己一直轮询 continuity。

流程是：

```text
user sends next message
→ UserPromptSubmit hook
→ cheap HTTP preflight
→ only if needed: capture / consume
→ inject <= small context
→ model answers
```

好处：

- 没有转场时几乎没有上下文成本；
- 不需要后台模型一直醒着；
- 交接失败时普通回复仍然可以继续；
- 用户真正回来聊天时，背景才进入模型。

参考 Hook 的等待时间是 8 秒，生产环境可以按体验调整，但重点是**有明确上限**。

---

## 8. 反向：Agent → Chat 为什么不需要模型总结

Agent Runtime 已经写出了可见日志，就直接增量读日志。

参考导出器维护：

```json
{
  "path": "/path/to/transcript.jsonl",
  "offset": 123456
}
```

每轮只读取 `offset` 之后的新 bytes，并且只处理完整的 JSONL 行。

过滤后只发送：

- user 可见消息
- assistant final answer

不发送：

- system / developer instructions
- tool payload
- internal wake event
- reasoning / hidden event

第一轮默认只建立 cursor，不回灌整个历史。之后每条消息用：

```text
message ID
或者
sha256(role + "\0" + text)
```

作为 `idempotency_key`，让重复执行导出器也不会重复写入。

---

## 9. 当前参考 HTTP 接口

示例 collector 提供：

| Method | Path | 用途 |
| --- | --- | --- |
| GET | `/health` | 健康检查 |
| POST | `/surface` | 上报 open / close |
| GET | `/sync/preflight` | Hook 查询下一步 |
| POST | `/sync/request` | 为 revision 建 capture job |
| GET | `/jobs/claim` | 浏览器领取 pending job |
| GET | `/sync/status?job_id=...` | Hook 查询 job |
| POST | `/jobs/:id/upload` | 浏览器上传短消息 batch |
| POST | `/jobs/:id/complete` | 明确 no_delta |
| POST | `/sync/consume` | 下游 ACK |
| POST | `/sync/abandon` | 终止失败 job |
| POST | `/continuity/handoff` | 写入 checkpoint / 反向消息 |
| GET | `/continuity/latest` | 按 source/kind/job 读近期事件 |

除了 `/health`，示例接口都要求 Bearer token。

---

## 10. 我们实际觉得值得保留的约束

这些不是为了追求“复杂”，而是每一个都对应一个真实的故障模式：

- **conversation ID 验证**：防止错误标签页。
- **stable message ID cursor**：避免重复注入。
- **fingerprint fallback**：处理部分页面 ID 漂移。
- **pending seen + consume ACK**：避免上传成功但消费失败后丢消息。
- **bounded payload**：控制 token 和上下文。
- **bounded wait**：上下文交接不阻塞普通回复。
- **terminal failure**：同一转场不反复重建。
- **no_delta != failed**：诊断清晰。
- **checkpoint fallback**：网页采集失效时仍有最小语义背景。
- **source filtering**：避免 Chat 自己的 shadow batch 又回流给自己。
- **TTL**：短期近况自然过期，不变成永久记忆。

如果只实现最小版本，可以从 `checkpoint + continuity_read` 开始；如果要做自动化，再逐步加 job、ACK、浏览器采集和反向日志游标。
