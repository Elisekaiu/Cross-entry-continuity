# Architecture and handoff sequence

This page follows the two directions of our working handoff flow. Runnable simplified examples live in `examples/`.

## A. Chat → independent Agent

```mermaid
sequenceDiagram
 participant Phone as iOS Chat / Shortcut
 participant Browser as Desktop Chromium extension
 participant C as Collector
 participant DB as Continuity store
 participant H as Agent prompt hook
 Phone->>C: Optional app open/close signal (no transcript)
 Note over C: Close marks dirty revision
 Note over Browser: Correct Chat conversation must already be open
 H->>C: preflight on next real user prompt
 alt clean
   C-->>H: skip
 else dirty
   H->>C: request(revision), idempotent
   C-->>Browser: claim job via extension polling
   Browser->>Browser: Verify route identity, select visible turns, dedupe and clip
   alt delta
     Browser->>C: upload bounded batch
     C->>DB: persist short-term event
   else no_delta
     Browser->>C: mark no_delta
   else failed
     Browser->>C: fail terminally, no automatic recapture
   end
   H->>C: bounded status check
   alt ready
     H->>DB: fetch exact job batch + relevant checkpoint
     H->>C: consume ACK
     H-->>H: inject only trusted short background
   else pending/failed
     H-->>H: skip injection, continue normal answer
   end
 end
```

An uploaded batch can wait for a later prompt to consume it. A failed handoff ends that transition; fresh Chat activity creates a new one. This keeps the other conversation moving without repeated retries.

### Example production limits

- Prefer visible current branch `user` and `assistant` text; at most **4 turns / 600 Unicode characters** in the current private setup.
- Conversation ID and stable message IDs, with fingerprint fallback for changing DOM identities.
- A job ID, revision, ACK and consumed cursor. Keep the cursor until the downstream consumer has confirmed it.
- A failed terminal job must not create another job for the same revision.

## B. Independent Agent → Chat

```mermaid
sequenceDiagram
 participant Agent as Agent/Codex
 participant Log as Local visible JSONL transcript
 participant Exp as Non-LLM exporter
 participant DB as Continuity store
 participant Chat as ChatGPT Chat
 Agent->>Log: Append final user and assistant messages
 Exp->>Log: Tail new bytes using per-file cursor
 Exp->>Exp: Filter hidden/internal rows and normalize roles
 Exp->>DB: POST short idempotent events
 Chat->>DB: continuity_read when new/returning (best effort)
 DB-->>Chat: Recent other-source events + own checkpoint
```

The actual Codex runtime writes rollout JSONL; an independent script holds per-file byte offsets, sends visible text and timestamps with idempotency keys, and never asks a model to summarize each turn. A separate archive can preserve exact original text much longer than the short-term continuity TTL.

A source-filtered read avoids feeding a Chat-produced shadow batch back into the same Chat. Without it, context can bounce between entrances repeatedly.

## C. Memory is not continuity

- **Bootstrap:** small stable relationship/project core for new sessions.
- **Recall:** indexed long-term semantic memory only when earlier decisions or facts matter.
- **Verbatim archive:** exact historical words, by phrase/date/ID.
- **Continuity:** recent cross-surface fragments, e.g., 24-hour TTL.
- **Checkpoint:** one intentional current-work note written by Chat; only when needed.

Any MCP/plugin tool layer can expose these concepts. They need not be the same product or database, but their lifecycles and responsibilities should remain separate.

## D. The role of iOS Shortcuts

An app-open/close Shortcut reports a surface event. It does **not** read the native ChatGPT transcript or active conversation ID. Desktop Chrome captures the conversation **actually open in its own tab**, not necessarily the one open on the phone. When a matching desktop conversation cannot be confirmed, the capture ends this turn without forwarding messages.

## E. Maintaining browser capture

Web page nodes and private interfaces may change with platform updates. The sample uses a DOM-only capture path for easier reading and adaptation. When customizing it, check site permissions, browser identity, message visibility and upload destinations.


## F. Deeper protocol notes

The state machine, ACK-before-cursor-commit rule, `no_delta` vs `failed`, repeated-text edge case and reverse byte cursor are documented in [PROTOCOL.md](PROTOCOL.md).
