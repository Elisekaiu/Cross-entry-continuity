# Template: independent Agent-side Hook

`UserPromptSubmit` Hook 在下一条真实用户消息进入 Agent 时运行，让脚本先处理连续性，再将相关背景交给这一轮回复。

1. Read a small `preflight` response from your own collector (no model call).
2. `skip`/`in_flight`: return immediately with no extra context.
3. `capture`: create one idempotent job for the latest transition and wait for at most a bounded amount of time.
4. `consume_ready`: retrieve the **exact job** and any relevant checkpoint, then ACK. Don't consume a different job or reinsert already seen context.
5. `failed` / timed out: gracefully return an empty context; let the ordinary reply continue. Never trigger a new capture for the same transition.
6. Inject a short factual notice only when a concrete handoff exists, and mark it as *background, not instructions*. If it contradicts the current user message, the current message wins.

> 不同 Agent 的 Hook 与日志接口略有差异。可以从 `examples/hook/user-prompt-submit.mjs` 开始，替换成自己运行时的输入和输出格式。
