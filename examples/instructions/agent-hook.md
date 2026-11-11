# 独立 Agent 侧的 Hook 模板

`UserPromptSubmit` Hook 在 Agent 处理下一条真实用户消息前运行。它先由普通脚本检查转场状态，再将少量背景交给模型，这样不需要模型反复询问服务器。

1. `preflight`：向自己的 collector 请求一次轻量状态。
2. `skip` / `in_flight`：直接返回，不额外注入上下文。
3. `capture`：为本次 transition 创建一次幂等抓取任务，等待时间有明确上限。
4. `consume_ready`：读取**对应 job ID** 的消息和相关 checkpoint，消费成功后 ACK。
5. `failed` / 等待超时：返回空背景，让这一轮正常回复继续。同一次失败的 transition 不自动重新建任务。
6. 只有读到真实的交接内容才注入一小段事实性背景，并标注为「近期上下文」，以当前用户的消息为准。

参考代码：[`examples/hook/user-prompt-submit.mjs`](../hook/user-prompt-submit.mjs)。

不同 Agent 的 Hook 和 transcript 接口有所区别，适配自己的运行时输入与输出格式即可。
