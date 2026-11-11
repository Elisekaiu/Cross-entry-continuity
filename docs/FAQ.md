# FAQ

**Can I use Windows or Linux instead of a Mac?**

Possibly. The underlying requirement is a long-running desktop Chromium environment supporting extensions and a signed-in chat tab. Only MacBook + Chrome has been tested in the original setup; Windows/Linux and other Chromium browsers are **unverified**.

**Can iOS Shortcuts give me the current ChatGPT conversation ID?**

No general supported route is known. App-close/open automation is a *surface event*, not a native Chat transcript export.

**Why not have the model summarize every turn?**

You can, but it adds model calls, latency, token use and potential paraphrase errors. Our design uses ordinary code for cursors, clipping, deduplication and transport, reserving model context for a short factual handoff when actually needed.

**Is this guaranteed to bootstrap in a new Chat?**

No. Ordinary Chat tool use is best effort and depends on the available tools, instructions and model behavior. A brief manual reminder might be needed. If time gaps matter, host-provided timestamps are more trustworthy than prompting the model to print its own clock.

**Why abandon failures instead of retrying forever?**

We prefer a bounded, visible context miss over wrong conversation injection, indefinite waiting or duplicated context. New genuine activity can start another transition.

**Does the repository contain private memory or conversation content?**

No. It describes concepts and provides generic reference code, not personal long-term memories or production secrets.

**Will it work with another AI service without a webhook?**

The design may apply, but the ChatGPT DOM extension cannot be presumed compatible. Confirm permitted exports, browser access, terms, Agent hook and storage options. A manual checkpoint is a valid simpler option. See [Adapter guide](ADAPTERS.md).

**Is this only for AI companionship?**

No. Long-term human–AI companionship is one motivating example, but independent work/personal assistants and multi-agent projects can benefit too.
