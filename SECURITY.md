# Security and privacy

This design handles private conversational data. Use it only for messages you are authorized to access and transmit.

1. **Never publish** user chats, real bearer tokens, session cookies, private MCP endpoints, real server addresses, snapshots, hidden tool content or personal long-term memories.
2. The browser source should extract **visible current-conversation user/assistant text only**. Unknown route, UI changes, ambiguous identity: **fail closed**.
3. The example collector binds to `127.0.0.1`. For remote use, build private HTTPS/VPN connectivity, authorization, rotating secrets, message-size limits, rate limits, audit and per-user isolation. Public plaintext HTTP is not appropriate.
4. Keep the extension's host permissions minimal. Dry-run must be the default; uploads require explicit configuration. **Never put ChatGPT session tokens on the VPS.**
5. Short-term event stores should enforce TTL, deletion and bounded payloads; avoid persisting full transcripts in observability logs.
6. A failed handoff must not recreate a job for the same revision. ACK only after successful downstream consumption.
7. Official product UI/private web APIs are not stable protocols and may be subject to policies. Do not bypass authorization or scrape another person's account.
8. `npm run privacy:scan` is a **basic heuristic**, not a security certification. Review every committed file and the complete Git history manually.

If private credentials have ever been publicly committed, removing the file in a later commit is not enough. Rotate credentials and clean the history appropriately.
