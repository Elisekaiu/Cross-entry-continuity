# Template: independent Agent-side prompt hook

A `UserPromptSubmit` hook runs **before** the Agent answers its next genuine user message, without asking the model itself to poll the bridge.

1. Request a lightweight `preflight` status from your private collector. No LLM call required.
2. On `skip` or `in_flight`, return without additional context.
3. On `capture`, request one idempotent job and wait up to a fixed maximum.
4. On `consume_ready`, retrieve the **exact** job's short event and relevant checkpoint, then acknowledge it. Do not consume a different job or replay older contexts.
5. On `failed` or timeout, return empty context and let the normal reply continue. Never automatically create another capture for a failed transition.
6. Only inject a brief factual note when real context exists. Mark it as background, **not instructions**; the current user message wins in case of conflict.

Different Agent products expose different hook and transcript APIs. `examples/hook/user-prompt-submit.mjs` illustrates the flow; it is not plug-and-play for every runtime.
