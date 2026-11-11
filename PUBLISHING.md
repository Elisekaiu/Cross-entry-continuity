# Contribution and publishing checklist

Welcome to contribute ideas and improvements to this little continuity bridge. `main` hosts Chinese documentation and `english` hosts English; the examples share the same behavior.

Before committing, run `npm test` and `npm run privacy:scan` and inspect **all files and Git history** for private messages, keys, endpoints, identities, hostnames and cached state. For new platform adapters, describe which environment was tested and what remains to be explored. Add tests for wrong-tab capture, duplicate IDs/text, failed/late ACK and restart recovery. Preserve third-party copyright/license notices if you use third-party code.

For people, only use a GitHub `Co-authored-by` trailer with an agreed, verified email. Codex-assisted commits may use the trailer `Co-authored-by: Codex <noreply@openai.com>`.

We welcome documentation corrections and independently tested adapters. **Fail closed when source identity is ambiguous.**
