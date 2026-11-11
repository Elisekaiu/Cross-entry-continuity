# Why release a clean reference extension instead of the private live one?

Sharing a small working MV3 extension is useful. Sharing a personally evolved production extension verbatim can expose private relay hosts, token conventions, historical one-off migration markers, internal DB schemas, cached snapshots and brittle site-specific fallbacks.

The public code is a **clean DOM-only example** (`manifest`, `content`, `background`, `extractor`, `popup`). It intentionally omits internal signed-in ChatGPT APIs and memory implementations. Preview is the default, upload is opt-in and uses loopback only. It demonstrates a narrow path for reading **the currently open authorized web conversation**, deduplication, handoff jobs and ACK.

| Area | Private production idea | Public reference |
| --- | --- | --- |
| Conversation identity | Current route plus stronger API/DOM verification | Require current `/c/<id>` route |
| Message extraction | Visible DOM and optional non-public site response APIs | DOM-only visible text |
| Deduplication | Per-conversation stable IDs and fingerprint fallback | Simple bounded message-ID cursor |
| Collector | Private production job/ACK store | Small loopback demo |
| Memory | Independent long-term and short-term services | Instructions and a minimal short-term store |
| iOS native switch | Not automatically solved | Not automatically solved |

If publishing more original production code later, audit every file, copy appropriate third-party licenses, remove private addresses, credentials, raw messages and legacy patches, use new history (not a branch of a private repo), and add tests for wrong route, duplicate text, branch edits, ACK failure and terminal abandonment.
