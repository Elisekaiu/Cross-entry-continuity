# Why we built it this way

## 1. Not all webhooks are the same

The desired event is **every new message/reply in an ordinary Chat → a private endpoint**. Ordinary Chat does not offer a general user-facing outgoing webhook for that. ChatGPT Work has scheduled and supported external-app event-triggered tasks (e.g. email or other connected-app changes), but that is not a per-Chat-message webhook. We keep the official references below so that readers can check current event-trigger options while designing their own flow.

- https://help.openai.com/en/articles/10291617-scheduled-tasks-in-chatgpt
- https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex

## 2. Why not move everything to Work?

The primary long-running conversation remains in Chat, and a separate Agent runs in parallel. Moving the entire relationship/workflow to a different product mode would change the user experience. Repeated scheduled or event-triggered tasks have limits, latency and different context semantics; they are not a free unlimited stream of normal Chat messages. That is why we keep ordinary Chat for our main conversation and let small scripts handle the **context handoff** between independent threads.

## 3. Why not summarize each message with an LLM?

Models are unnecessary for copying small visible chat deltas, tracking cursors and acknowledgements, or deduplicating. A conventional script can cheaply manage that; only a bounded factual snippet is injected at the moment a response needs it. This reduces prompt size and quota use.

## 4. Why intentional checkpoints?

A browser may be offline, on the wrong tab or broken after a DOM update. If Chat has a working tool, the model may proactively write **one brief factual note** about significant current progress before a handoff. It's a small piece of context, often enough to pick up a task naturally on the other side.

## 5. Why one-shot failure?

This is a bridge for everyday conversations, where a graceful missed handoff is often better than blocking the next reply. A missed snippet is often safer than endless retries, misplaced conversation IDs or stale content injected into the wrong thread. A failure terminates the revision; the next authentic user activity creates a new revision. High-stakes actions still need fresh explicit confirmation.

## 6. Why human–AI companionship?

Meaningful continuity across multiple entrances matters when an assistant is a long-term companion, creative collaborator or project partner. Distinguishing short-lived "what just happened" from stable "what have we decided" lets threads remain independent while reducing repetitive explanations. Keeping recent context and long-term memories separate also makes it easier to choose thoughtfully what is worth remembering.
