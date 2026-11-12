# 致谢与来源

这座小桥是在不断尝试和改进的过程中搭起来的。下面这些开源项目给过我们不少启发，感谢作者们愿意分享自己的作品。

## 最初的聊天导出思路

- **[OwlCt/ChatGPT-Export](https://github.com/OwlCt/ChatGPT-Export)**（MIT）——早期研究逐字原文归档和在已登录浏览器环境读取 ChatGPT 对话时的重要参考。它的项目致谢还提到了 **[huhusmang/ChatGPT-Exporter](https://github.com/huhusmang/ChatGPT-Exporter)** 和更早的 *ChatGPT Universal Exporter* 贡献者。感兴趣的读者可以沿着这条来源链继续探索。

## 浏览器扩展与当前会话采集

开发期间，我们也阅读、比较过以下项目的页面采集和聊天导出方案：

- [dialoguesai/chatgpt-shadow-extension](https://github.com/dialoguesai/chatgpt-shadow-extension) —— Chrome MV3 扩展、页面消息识别与本地存储。
- [jtsternberg/ChatGPT-Export](https://github.com/jtsternberg/ChatGPT-Export) —— 当前会话 DOM 导出与结构选择器。
- [1nGzo/chatgpt-current-exporter](https://github.com/1nGzo/chatgpt-current-exporter) —— 单个聊天的 JSON／Markdown 导出。
- [Kirito-Elucidator/ChatGPT-Exporter](https://github.com/Kirito-Elucidator/ChatGPT-Exporter) —— 浏览器导出与 userscript 思路。

如果在自己的版本中直接复用这些项目的源代码，记得阅读上游许可证，保留对应的作者与版权信息。仓库的 `examples/` 则是为介绍这套架构整理的通用参考实现。

## 相关产品说明

- [ChatGPT Scheduled Tasks](https://help.openai.com/en/articles/10291617-scheduled-tasks-in-chatgpt)
- [ChatGPT Work and Codex](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex)

这两篇资料有助于了解 Work 的定时／外部事件触发，与普通 Chat 的逐消息通知／上下文交接需求之间的区别。

## 关于协作

这个项目由独立开发者与 AI 编程工具共同整理，其中 Codex 参与了私人系统的开发。Git 提交中的 co-author 署名记录了这份协作。

项目示例采用 [MIT License](LICENSE)。也谢谢每一位愿意分享适配经验、改进建议的人。
