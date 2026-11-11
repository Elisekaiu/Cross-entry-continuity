# Setup — runnable local reference

Start with the small local example. Once the collector, extension and hook make sense together, you can connect your own devices and chat tools.

## Requirements

- Node.js 22+ and a desktop Chromium browser that supports MV3 extensions.
- For optional end-to-end testing, a fake Agent prompt or a compatible `UserPromptSubmit` hook.
- A loopback environment: no public internet endpoint is needed for this demo.

## 1. Run local tests

```bash
npm test
npm run privacy:scan
```

## 2. Start the collector

```bash
cp .env.example .env
# Replace the placeholder token with a random 32+ character secret.
npm run demo:server
```

The collector binds to `127.0.0.1:8794` by default. It uses a tiny state file and is not designed for public network exposure or multi-instance concurrency. You must add secure transport, authentication and data-lifecycle rules for actual deployment.

## 3. Install the reference Chrome extension

- In `examples/extension`, copy `config.example.js` to `config.js` and configure the loopback collector and the **same** demo token if your version requires it.
- Open `chrome://extensions`, enable Developer Mode, then **Load unpacked** from `examples/extension`.
- Open the intended ChatGPT conversation in Chrome. The extension checks the current `/c/<conversation-id>` route and reads visible DOM turns only.
- Start with the popup's **preview/dry-run** to see which messages are selected. When you're happy with the result, configure your own collector to enable upload. ChatGPT login credentials stay in the browser.

## 4. Agent hook

See `examples/hook/user-prompt-submit.mjs` and `examples/instructions/agent-hook.md`. Wire it to the appropriate Agent hook mechanism and verify that the local collector is reachable **before enabling automatic consumption**. The hook returns quickly on `skip`, waits for a bounded time on `capture`, and passes along the short event for that particular job.

## 5. Reverse direction

See `examples/wechat-export/export-visible.mjs` for a non-LLM JSONL cursor design. Adapt the parser to the transcript format used by your Agent; Codex rollout JSONL is one example. Send only allowed visible messages with idempotent keys and short TTL.

## 6. Chat-side memory tools

Connect a memory tool with separate operations for bootstrap, selective recall, exact archive search, short-term continuity read and checkpoint writing. See `examples/instructions/official-chat.md` for a starting set of instructions about new sessions and meaningful returns.

## 7. iOS surface signal (optional)

An iOS Shortcut may signal `app opened` / `app closed`. It cannot extract ChatGPT's native message content or current conversation ID. When the matching desktop conversation is not open, the capture waits for a future turn with the correct page. You can omit Shortcuts and trigger handoff manually instead.

## Bringing it into your own environment

For remote use, extend the loopback demo with private HTTPS/VPN connectivity, secure tokens, rate limits, bounded payloads, TTL, per-user isolation, backups and wrong-tab/ACK regression tests. The browser adapter and hook are intentionally small, so they can be adapted to the platforms and permissions available in your environment.
