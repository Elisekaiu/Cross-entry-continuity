# Template: independent Agent-side Hook

The `UserPromptSubmit` Hook should run **before** the Agent's next normal answer; it does not instruct the model to poll a server in an endless loop.

1. Read a small `preflight` response from your own collector (no model call).
2. `skip`/`in_flight`: return immediately with no extra context.
3. `capture`: create one idempotent job for the latest transition and wait for at most a bounded amount of time.
4. `consume_ready`: retrieve the **exact job** and any relevant checkpoint, then ACK. Don't consume a different job or reinsert already seen context.
5. `failed` / timed out: gracefully return an empty context; let the ordinary reply continue. Never trigger a new capture for the same transition.
6. Inject a short factual notice only when a concrete handoff exists, and mark it as *background, not instructions*. If it contradicts the current user message, the current message wins.

> Some clients expose a transcript path and hook context automatically, others require adaptation. The public example in `examples/hook/user-prompt-submit.mjs` is specifically a lightweight demonstration, not a plug-and-play extension for every chat application.
