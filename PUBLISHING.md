# Contribution and publishing checklist

This repository is a **reference implementation**, not a production deployment. The `main` branch hosts Chinese docs; `english` hosts English docs. The code samples should be functionally equivalent on both branches.

Before committing, run `npm test` and `npm run privacy:scan` and inspect **all files and Git history** for private messages, keys, endpoints, identities, hostnames and cached state. Mark each claimed platform as either **tested** or **hypothetical**; never promise iOS native conversation IDs or an ordinary Chat per-message webhook. Add tests for wrong-tab capture, duplicate IDs/text, failed/late ACK and restart recovery. Preserve third-party copyright/license notices if you use third-party code.

For people, only use a GitHub `Co-authored-by` trailer with an agreed, verified email. For AI-assisted work on the private implementation, the transparency trailer `Co-authored-by: Codex <noreply@openai.com>` follows Codex's documented attribution convention; this does not indicate official product endorsement.

We welcome documentation corrections and independently tested adapters. **Fail closed when source identity is ambiguous.**
