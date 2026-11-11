# 贡献与发布检查 / Publishing checklist

这份公开仓库是 **reference implementation**，并不等于私人生产部署。`main` 是中文文档，`english` 是英文文档；两分支的示例源码应保持同等功能。

## 提交前

1. 运行 `npm test`、`npm run privacy:scan`，并人工审核全部新增文件及 Git 历史。
2. 不上传个人/伴侣聊天、个人记忆、真实密钥、访问凭证、服务器 IP 或私有域名。
3. 新增平台适配时说明是 **tested** 还是 **hypothetical**，并注明权限、条款及无法覆盖的场景。
4. 不要声称提供官方 ChatGPT webhook，或支持 iOS App 自动读取/切窗。
5. 改动协议时先写失败、重复消费、错误窗口、ACK 与重启恢复的测试。
6. 如使用他人开源代码，请保留对应许可证和版权；“调研过”与“实际复制”分别说明。
7. 只在得到协作者同意、并能确认邮箱归属时给真人加 `Co-authored-by`。AI-assisted Codex 贡献以 `Co-authored-by: Codex <noreply@openai.com>` 透明标识；这并不代表官方支持。

文档修复与平台适配的经验分享都欢迎。核心原则是：**fail closed，宁可少抓，不能错抓**。
