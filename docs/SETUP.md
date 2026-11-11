# Setup — 开源参考实现

这是**本机安全演示**，不是一键部署私人生产系统。

## 要准备什么

- Node.js >= 22
- Chromium 桌面浏览器 + 有权使用的 ChatGPT 网页会话
- 如果想测试 Agent Hook，准备一个允许 `UserPromptSubmit`（或等价）Hook 的 Agent，以及本地 Node 可执行文件
- 如果想跨设备/用 Shortcuts，准备自己管理的 HTTPS 入口、强认证、防重放/速率限制与私有网络；**不要把本演示的 HTTP 服务裸露公网**

## 1. 运行 collector

```bash
cp .env.example .env
# 修改 .env 的 CONTINUITY_TOKEN；至少 32 字节随机值，不放 Git
npm test
npm run demo:server
```

默认只监听 `127.0.0.1:8794`。鉴于示例展示的是架构，服务只处理本机本人的演示数据；生产环境还需认证生命周期、备份、日志脱敏和 HTTPS 网关。

## 2. Chrome Extension（选择是否发送）

1. `cd examples/extension && cp config.example.js config.js`
2. 根据实际本机 collector 编辑 `config.js`（默认 `enabled:false`，此时仅 dry-run）
3. Chrome → `chrome://extensions` → Developer mode → Load unpacked → 选择 `examples/extension`
4. 打开或刷新 `https://chatgpt.com/c/<conversation-id>` 对话页，再点扩展 popup 的 **Capture preview**；它不会发送任何内容
5. 在本机独立演示环境里有真实 collector 才将 `enabled` 调成 `true`，然后重新加载扩展

**注意：** 演示扩展走 DOM-only 当前对话，不拥有 iOS conversation ID、不读取 ChatGPT cookie，也不检索账户全部历史。无 `/c/<id>` 或读取不到可见消息，就显示无法抓取。严格避免把输出发到不属于自己的端点。

## 3. 模拟 App 开关信号和 Agent Hook

使用示例 curl 上报事件（必须填自己的令牌）：

```bash
curl -sS -X POST http://127.0.0.1:8794/surface -H 'Content-Type: application/json' -H "Authorization: Bearer $CONTINUITY_TOKEN" -d '{"app":"chatgpt","event":"open"}'
curl -sS -X POST http://127.0.0.1:8794/surface -H 'Content-Type: application/json' -H "Authorization: Bearer $CONTINUITY_TOKEN" -d '{"app":"chatgpt","event":"close"}'
```

真实 Shortcuts：建立 **App Opened/Closed** 自动化，按使用的平台选合适事件；POST 到自有 HTTPS/私网隧道入口，body 只有 `{ "app": "chatgpt", "event": "close", "at": "..." }`，携带安全授权。不要试图从 Shortcuts 读取 iOS ChatGPT 沙盒或复制 session token。不同 iOS 版本/权限下需自行确认自动化实际触发情况。

示例 Hook：

```bash
printf '{"prompt":"你好","session_id":"demo"}\n' | node examples/hook/user-prompt-submit.mjs
```

需要给它 `CONTINUITY_URL=http://127.0.0.1:8794` 和 `CONTINUITY_TOKEN`。示例 Hook 输出符合一种 Codex `UserPromptSubmit` additionalContext 的常见结构；其他运行时应自行调整，不保证通用可直接使用。

## 4. 反向：Agent → Chat

将 `examples/wechat-export/export-visible.mjs` 的输入指向**你有权访问的** Agent 可见 JSONL 日志。该脚本只读增量并写短期消息；真实 Codex rollout 的复杂 `response_item` / 内部事件过滤需要按版本自行适配，绝不把系统指令和工具输出当成用户聊天。初次运行默认建立基准游标，不补发整个历史，后续只推新内容。

官端需接入一个有权限读取 `continuity/latest?source=agent` 的 MCP/插件工具，再在 `examples/instructions/official-chat.md` 基础上按自己的工具名配置。README 不会假装这个工具由 ChatGPT 默认提供。

## 5. 测试

```bash
npm test
npm run privacy:scan
```

示例包含状态机测试、纯文本增量提取测试与脱敏检查。它们不能代替真实 iOS → Chrome → Hook 的人工验收。
