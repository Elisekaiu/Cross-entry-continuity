# Credits / Attribution

## 直接相关的早期启发

- **[OwlCt/ChatGPT-Export](https://github.com/OwlCt/ChatGPT-Export)** — MIT License；我们早期的逐字原文归档与登录态读取 ChatGPT 对话的研究参考。上游项目本身给 **[huhusmang/ChatGPT-Exporter](https://github.com/huhusmang/ChatGPT-Exporter)** 和更早的 *ChatGPT Universal Exporter* 项目及其贡献者致谢；请尊重这条出处链。其现行 `LICENSE` 声明包括 `Copyright (c) 2026 huhu`。参考项目使用 ChatGPT 网页内部私有接口的方式，而非官方稳定的 Chat Webhook。

## 后续技术调研与相似问题空间

下列项目用于研究当前分支捕获、页面观察、DOM 消息 ID、扩展隔离与本地数据导出等问题。**列在这里并不代表本项目复制了它们的源代码**：

- [dialoguesai/chatgpt-shadow-extension](https://github.com/dialoguesai/chatgpt-shadow-extension) — Chrome MV3、本地存储、页面可见消息与消息身份边界（Apache-2.0）。
- [jtsternberg/ChatGPT-Export](https://github.com/jtsternberg/ChatGPT-Export) — 当前会话 DOM 导出与稳定结构选择器。
- [1nGzo/chatgpt-current-exporter](https://github.com/1nGzo/chatgpt-current-exporter) — 当前聊天单会话 JSON / Markdown 导出。
- [Kirito-Elucidator/ChatGPT-Exporter](https://github.com/Kirito-Elucidator/ChatGPT-Exporter) — 浏览器导出器与 userscript 方案。

在对照这些参考时，应以各自仓库实际 `LICENSE` 为准。**不因为某仓库公开可见就认定它可被直接重分发。** 当前 repo 的 `examples/` 是重新写成的独立通用参考，而不是上述仓库打包再分发。

## OpenAI 产品信息

- [ChatGPT Scheduled tasks](https://help.openai.com/en/articles/10291617-scheduled-tasks-in-chatgpt)
- [ChatGPT Work and Codex](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex)

这些引用用于准确区分 Work 的「受支持外部应用事件触发任务」与普通 Chat 消息 webhook，并不意味着 OpenAI 对本项目提供支持或背书。

## 本项目

Concept and reference implementation assembled collaboratively by an independent developer and AI-assisted coding tools (including OpenAI Codex on the private system). Git commit trailers identify AI assistance; they do not imply endorsement or an official OpenAI contribution. See [MIT LICENSE](LICENSE). No private chat transcript, user data, secrets or proprietary connected-app content is included.
