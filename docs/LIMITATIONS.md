# Verification scope and known limitations

| Capability | Status | Practical implication |
| --- | --- | --- |
| iOS ChatGPT + optional app open/close Shortcut | Used in private setup | Signal only; not a transcript or conversation ID |
| MacBook + desktop Chrome extension + signed-in Chat tab | Used in private setup | Correct conversation must be open; cannot auto-follow iPhone tab |
| Linux VPS + Node.js collector + independent Agent hook | Used in private setup | Bounded job wait, ACK, terminal failure |
| Codex visible rollout JSONL tailing | Used in private setup | Non-model exporter, byte cursor and idempotency; format dependent |
| Windows/Linux desktop Chromium | Hypothetical, not validated | Verify permissions, extension background lifecycle and login |
| Edge/Brave/Arc Chromium | Hypothetical, not validated | Verify DOM and extension APIs |
| Other AI chat website or messaging platform | Architectural possibility only | Requires separate lawful access and adapter, not guaranteed |
| Mobile Safari/Chrome running desktop extension on iOS | Unsupported path | Use a desktop device or manual checkpoint |
| Automatic identification of iOS Chat's latest opened conversation | Unsolved | Never guess from recency; fail closed |
| Automatic switching of desktop tab after iOS chat switch | Unsolved | Manually open target conversation on desktop |
| Guaranteed Chat-side bootstrap / continuity tool invocation | Not guaranteed | Prompt/tool descriptions help; manual reminder may be needed |
| Reliable time gap inferred from LLM itself | Not guaranteed | Host-provided timestamps, not generated time assertions |
| ChatGPT private site APIs / DOM selectors | Unstable | Expect maintenance; avoid claiming official integration |
| One-click deployment of the private production system | Not provided | Memory server and internal routing are intentionally not public |

Other failure modes include multiple open tabs, streaming replies, regenerations, branch edits, lazy-loaded long chats, background service-worker sleep, Shortcuts permissions, transient DB loss, stale caches, race conditions and timeout errors. Prefer **a missing handoff over misattributed conversations**.
