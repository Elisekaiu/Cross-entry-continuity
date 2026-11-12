# FAQ

**Can I use Windows or Linux instead of a Mac?**

Possibly. The underlying requirement is a long-running desktop Chromium environment supporting extensions and a signed-in chat tab. Only MacBook + Chrome has been tested in the original setup; Windows/Linux and other Chromium browsers are **unverified**.

**Can iOS Shortcuts give me the current ChatGPT conversation ID?**

No general supported route is known. App-close/open automation is a *surface event*, not a native Chat transcript export.


**Do Agent / messaging-app replies automatically appear in the original ChatGPT conversation?**

No. The native chat histories stay separate. New Agent-side messages are written as short-lived Continuity events; Chat can read that context through a connected tool and then respond naturally in its **next own turn**. Those messages are not inserted into ChatGPT's existing bubble history. The reverse direction works the same way: Chat messages can become bounded recent context for the Agent, but they are not replayed as a mirrored transcript.

**Why not have the model summarize every turn?**

You can, but it adds model calls, latency, token use and potential paraphrase errors. Our design uses ordinary code for cursors, clipping, deduplication and transport, reserving model context for a short factual handoff when actually needed.

**When will a new Chat read bootstrap and continuity?**

You can describe triggers such as a new conversation, an explicit return, or a meaningful time gap in your instructions and tool descriptions. Model-initiated calls may still vary, so a gentle reminder can help. Chat does not always expose reliable per-message timing to the model; setups that already check trustworthy current time each turn, or supply real message timestamps, may detect long returns more consistently.

**Why abandon failures instead of retrying forever?**

We prefer a bounded, visible context miss over wrong conversation injection, indefinite waiting or duplicated context. New genuine activity can start another transition.

**Can I connect my own memory system?**

Yes. The examples show separate roles for bootstrap, recall, archive, continuity and checkpoints. Connect those to your own storage and tools; personal conversations and memory data stay in your own environment.

**Will it work with another AI service without a webhook?**

The architecture is adaptable. Check the service's permitted export or browser access, then connect your own message parser, hook and short-term storage. A manual checkpoint is a lovely lightweight starting point. See [Adapter guide](ADAPTERS.md).

**Is this only for AI companionship?**

Not at all. We started with long-term human–AI companionship, but independent project agents, work/personal assistants and multi-device chats can benefit from the same idea.
