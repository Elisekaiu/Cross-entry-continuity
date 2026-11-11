# The continuity instructions we actually use (generalized)

This template is based on the instructions we use in our own long-running setup. Private tool names have been replaced with generic ones, while the separation of responsibilities is largely unchanged.

In practice, we have found this shape reasonably effective for five recurring situations: **new chat windows, explicit returns, recalling older decisions, finding exact historical wording, and leaving a short cross-entry checkpoint.**

Example tool capabilities:

- `memory_bootstrap`: a lightweight relationship/project core
- `continuity_read`: recent cross-entry context
- `memory_recall`: indexed long-term semantic memory
- `archive_literal` / `archive_day` / `archive_context`: verbatim history
- `continuity_write`: short-term checkpoint

Rename them to match your own tools.

---

## Template

```text
### Active memory and continuity rules

You have several memory and continuity tools. Use them proactively when the situation clearly calls for them, and keep long-term memory, verbatim history, and recent continuity as separate layers.

1. memory_bootstrap (lightweight core / opening context)

STRONG TRIGGERS
- The first turn of a new chat or new window.
- The user explicitly returns, e.g. "I'm back" or "continue what we were doing".
- A meaningful gap is reliably known and the conversation needs its core context restored.

BEHAVIOR
- Call memory_bootstrap before the first substantive reply.
- Bootstrap is a small stable core, not a full transcript.
- Do not reload it on every ordinary turn in the same continuous conversation.

2. continuity_read (recent cross-entry continuity)

STRONG TRIGGERS
- After bootstrap on a new chat / new window.
- The user is clearly continuing something that just happened in another chat entrance.
- The user returns after a meaningful gap and recent activity elsewhere may matter.

BEHAVIOR
- Use continuity_read for "what just happened" and "where did the other entrance leave off?"
- An empty result is normal; continue without repeated polling.
- Do not call it on every ordinary turn.
- Prefer recent items from the other entrance plus checkpoints written by the current entrance, avoiding self-echoes.

TIME-GAP NOTE
- Instructions can include triggers such as explicit return or "a long time has passed".
- The model may not receive reliable per-message timestamps, so prompt-only elapsed-time detection can be inconsistent.
- If the host supplies real message/current timestamps, or the setup already checks a trustworthy current time before each reply, that time signal can be used to make return triggers more reliable.

3. memory_recall (long-term memory)

STRONG TRIGGERS
When visible context is insufficient and the user asks about:
- meaningful past events;
- older agreements, decisions, disagreements or revisions;
- stable long-term preferences or boundaries;
- "do you remember?" / "what did we decide before?"

BEHAVIOR
- Search by topic before answering.
- New explicit information from the user overrides older memory.
- Do not fill gaps from vague impressions when no relevant memory was retrieved.

4. Archive (exact historical evidence)

STRONG TRIGGERS
Use archive tools when the user needs:
- an exact quote;
- exact wording;
- what was said on a particular day;
- original chat evidence.

BEHAVIOR
- Known phrase -> archive_literal.
- Known date -> archive_day.
- Need surrounding context -> archive_context.
- Add memory_recall only when archive evidence is insufficient and the long-term meaning also matters.
- Do not present semantic memory as a verbatim quote.

5. continuity_write (short-term cross-entry checkpoint)

PROACTIVE WRITE TRIGGER
When something important has just happened in this chat and the user would be noticeably lost if they immediately switched to another entrance, write one concise checkpoint.

Good checkpoint content:
- current task progress;
- a decision just made;
- the next planned step;
- short-lived background the other entrance will need.

Keep out:
- routine chit-chat;
- a full conversation summary;
- broad personality conclusions;
- material that belongs in long-term memory.

A checkpoint is a short-lived bridge, not permanent memory.
```

## Why the separation matters

The most common mistake is often not "the model never uses a tool", but **the model uses the wrong layer**.

Examples:

- "I just came back from the other app" -> continuity
- "Why did we choose this architecture three months ago?" -> long-term recall
- "What exactly did I say that day?" -> archive
- "We just fixed the bug to this point; I'll continue elsewhere" -> write a checkpoint
- first turn in a fresh window -> bootstrap + one continuity read

Clear boundaries also reduce unnecessary tool calls and large context injections.

## Put the same distinctions in tool descriptions

The user instructions and the tool descriptions should reinforce each other:

- Bootstrap: "new window / explicit return; lightweight core; once per return"
- Continuity Read: "recent cross-entry context; empty is normal; not every turn"
- Recall: "older decisions and meaning; not verbatim evidence"
- Archive: "exact quote / day / surrounding context"
- Checkpoint: "short-term handoff only; not permanent memory"

A simple rule we found useful:

**Instructions help the model decide *when continuity matters*; tool descriptions help it choose *which layer to call*.**
