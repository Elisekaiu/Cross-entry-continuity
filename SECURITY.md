# Security / Privacy

这是一个**处理个人聊天内容**的架构。上线前的安全要求远比能否正常启动重要。

1. **绝不公开**：聊天记录、真实 access token、ChatGPT session cookies、内部 Bearer token、私人 MCP 地址、家庭/个人身份信息、VPS IP、内部运行环境完整备份、长期记忆原文。
2. **浏览器边界**：只读取本人已登录 ChatGPT 网页上的**可见对话文本**；尽量只取 `user/assistant` 当前分支，不采集附件、Tool output、不可见 metadata。官方页面/API 改动时优先 fail closed。
3. **网络边界**：示例 collector 默认仅监听 `127.0.0.1`；跨设备连接必须自行提供可信 HTTPS/私网隧道、长随机令牌、访问控制、速率限制、请求大小限制与审计。**不要用明文公网 HTTP**。
4. **最小权限**：Chrome 扩展尽量限定 host permissions；只允许发送到用户配置的自有地址。默认 `enabled:false`，仅 dry-run。不要把自己的登录凭证提交到仓库。
5. **短期数据**：尽量 TTL、裁剪、消息去重、local state 加密或保护权限、数据删除方案。不要用模型日志记录完整用户内容。
6. **失败策略**：同一 transition 失败即终止，避免重新建任务、重复上传和错误注入；只有新真实事件产生新 revision。
7. **供应链**：OpenAI、ChatGPT 和 Chromium 的 UI/私有接口均非稳定协议；使用自己的账户且遵守适用条款；不要企图绕过认证或访问他人聊天。
8. **发布检查**：`npm run privacy:scan` 只能发现一些明显密钥/环境线索，无法证明“没有任何隐私”。还需要人工审查全部文件和 commit history，尤其要确认 `.env`、`config.js` 和 `state.json` 没有被 Git 跟踪。

公开前应做一次密钥轮换，**仅当你发现旧凭证曾经进入 Git 历史或多人可读位置时**尤其重要；不要通过隐藏文件名或新 commit 覆盖的方式假装旧凭证不存在。
