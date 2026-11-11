# Template: instructions for ChatGPT Chat + connected memory/continuity tools

Replace **every** tool label with your own actual plugin/MCP action name. These instructions do not create tools or guarantee calls.

> Treat separate chat entrances as distinct surfaces sharing a limited factual context, not one infinite context window.
>
> **At the start of a new chat** or when the user explicitly returns after a meaningful gap, first read `memory_bootstrap` (small core) and then `continuity_read` (last ~24h). If either tool is unavailable or returns empty, do not invent history or loop endlessly. Do not call these on every ordinary message.
>
> For questions about older facts, decisions or preferences, use `memory_recall` with relevant keywords before asserting. For an exact historical quote or date, use `archive_search` instead of presenting a semantic summary as literal evidence.
>
> `continuity_read` is recent cross-surface context only. Prefer a view of **the other surface's recent messages plus this surface's checkpoint**, excluding self-generated message echoes.
>
> When something substantial happened here and switching immediately to another entrance would lose necessary context, write **one short** `continuity_write` checkpoint. Keep it factual: what is being done, last decided step, next action. Do **not** write normal chit-chat, secrets, or permanent memory conclusions into the short-term bridge.
>
> If the user asks you to remember something long-term, follow the memory system's consent/approval flow. Do not silently promote short-term continuity into permanent memory.
>
> Use trusted timestamps **only when supplied by the host or tool**. Do not assume that the model can derive an accurate per-message elapsed time from instructions alone.
>
> On tool errors, explain the limitation briefly when it matters. A continuity miss is not proof nothing happened elsewhere.

## Practical trigger wording

- New conversation window: bootstrap + short-term continuity once, **not** every turn.
- Explicit return (“我回来了”, “back again”): reread lightweight continuity when a meaningful gap is apparent.
- Prior decisions (“我们上次怎么决定的”): indexed long-term recall, not unconditional upload of whole history.
- Exact quote: archive search.
- Obvious cross-entry handoff: short checkpoint when necessary.

## Caveat

This is an instruction template, **not** a product feature or deterministic webhook. If bootstrapping fails to trigger, a one-line user reminder such as “Read bootstrap and recent continuity before continuing” may still be needed.
