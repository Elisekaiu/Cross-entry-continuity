# Adapting to another AI chat service without a message webhook

The reference design is not branded to one chatbot. It can be useful for long-running personal assistants, human–AI companionship, creative workflows, multiple devices and separate Agent threads. It is **not** a universal cross-platform extension.

| Feature available | What you can build | If absent |
| --- | --- | --- |
| Official message event/webhook | Prefer stable documented event integration | Consider permitted export, local transcript or web view |
| Authorized access to your own conversation history | Source-verified small deltas | Do not scrape blindly; use intentional checkpoints |
| Long-running desktop browser | Local MV3 extension / browser capture | Use manual exports/shares with lower freshness expectations |
| Agent prompt hook | Read and inject only when a real user prompt arrives | Offer an explicit user command instead |
| Agent visible transcript/log | Non-LLM cursor-based reverse export | Use user-exported snippets or checkpoints |
| Chat-side memory/continuity tool | Bootstrap, recall, archive, continuity_read/write | Manual copy-and-paste is an honest fallback |

**Adoption stages:**

1. **Minimal:** A private short-lived store, manual or explicit checkpoint writing, manual reading.
2. **Log-based:** A consented incremental exporter for another Agent's visible local messages.
3. **Browser-based:** A verified active conversation on an authorized web page, with extension and one-shot ACK protocol.
4. **Official webhook:** If a service offers a documented message event later, replace the fragile page-capture layer.

**Tested in the original private deployment:** ChatGPT Chat, iOS Shortcut surface signals, Mac Chrome, Linux VPS, independent Codex hook/logs, custom memory tools.

**Not tested:** Windows/Linux Chromium, alternate chatbot UIs, other mobile chat apps, non-Codex agents. Their APIs, terms, login sessions and limitations require separate investigation.

For AI companionship, preserving **traceable, bounded context** is more valuable than pretending the model has memories it never received. Short-term continuity expires; permanent memory belongs to a separate reviewed/consented layer.
