# From a personal extension to a reusable example

Our Chrome extension grew around a personal two-entry setup, with many iterations of page parsing, deduplication and handoff state. For this repository, we kept the useful core—**current-page capture → small delta → collector → ACK**—and separated out private configuration and historical migration details.

The [example extension](../examples/extension) contains an MV3 `manifest`, `content`, `background`, `extractor` and `popup`. Start with **Capture preview** to see the visible messages it identifies on the current page. Once your local collector is ready, you can enable upload and explore its deduplication and ACK behavior.

| Area | Private production idea | Public reference |
| --- | --- | --- |
| Conversation identity | Current route plus stronger API/DOM verification | Require current `/c/<id>` route |
| Message extraction | Visible DOM and optional non-public site response APIs | DOM-only visible text |
| Deduplication | Per-conversation stable IDs and fingerprint fallback | Simple bounded message-ID cursor |
| Collector | Private production job/ACK store | Small loopback demo |
| Memory | Independent long-term and short-term services | Instructions and a minimal short-term store |
| iOS native switch | Not automatically solved | Not automatically solved |

To build on the example, adapt the current-page parser, configure your own HTTPS/private endpoint, limit extension permissions, and add regression tests for wrong tabs, duplicate text, streaming replies, ACK failures and recovery. When including another project's code, preserve its license and attribution.
