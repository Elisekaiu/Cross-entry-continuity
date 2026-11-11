# Tested setups and areas we're still exploring

| Capability | Status | Practical implication |
| --- | --- | --- |
| iOS ChatGPT + optional app open/close Shortcut | Used in private setup | Signal only; not a transcript or conversation ID |
| MacBook + desktop Chrome extension + signed-in Chat tab | Used in private setup | Correct conversation must be open; cannot auto-follow iPhone tab |
| Linux VPS + Node.js collector + independent Agent hook | Used in private setup | Bounded job wait, ACK, terminal failure |
| Codex visible rollout JSONL tailing | Used in private setup | Non-model exporter, byte cursor and idempotency; format dependent |
| Windows/Linux desktop Chromium | Hypothetical, not validated | Verify permissions, extension background lifecycle and login |
| Edge/Brave/Arc Chromium | Hypothetical, not validated | Verify DOM and extension APIs |
| Other AI chat website or messaging platform | Potential adaptation | Check permitted access and build a platform-specific adapter |
| Mobile Safari/Chrome running desktop extension on iOS | Unsupported path | Use a desktop device or manual checkpoint |
| Automatic identification of the currently open iOS Chat | Still exploring | Use the verified desktop conversation ID; otherwise leave the handoff empty |
| Automatic switching of desktop tab after iOS chat switch | Unsolved | Manually open target conversation on desktop |
| Automatic bootstrap / continuity on a new Chat | Model-triggered | Clear tool descriptions and return-time instructions help; a gentle reminder may still be useful |
| Long-gap detection via user instructions | Depends on time information | The model may lack per-message timestamps; reliable current-time checks or supplied message times may improve return triggers |
| ChatGPT private site APIs / DOM selectors | Unstable | Expect maintenance; avoid claiming official integration |
| Building the complete bridge in your own setup | Adapter work required | The sample includes collector, extension, hook and exporter; connect your preferred memory and chat services |

Other failure modes include multiple open tabs, streaming replies, regenerations, branch edits, lazy-loaded long chats, background service-worker sleep, Shortcuts permissions, transient DB loss, stale caches, race conditions and timeout errors. When a conversation cannot be identified confidently, the handoff ends quietly and can be tried again after the correct page is open.
