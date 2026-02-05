# opencode-bot

🚀 **连接 OpenCode 到 17+ 消息平台的通用桥接器**

受 OpenClaw 多平台架构启发，opencode-bot 将 OpenCode 的强大功能带到 Telegram、Discord、Slack、WhatsApp、Signal、Matrix 等平台。

[English](../README.md) | [日本語](README.ja.md) | [한국어](README.ko.md)

## ✨ 功能特性

### 🤖 多平台支持

| 平台 | 状态 | 版本 |
|------|------|------|
| 📱 Telegram | ✅ 可用 | v1.0 |
| 🎮 Discord | 🚧 计划中 | v1.1 |
| 💼 Slack | 🚧 计划中 | v1.2 |
| 💬 WhatsApp | 🚧 计划中 | v1.3 |
| 🔒 Signal | 🚧 计划中 | v1.4 |
| 🔷 Matrix | 🚧 计划中 | v1.5 |
| 📋 Mattermost | 🚧 计划中 | v1.6 |
| 💬 Google Chat | 🚧 计划中 | v1.7 |
| 🔷 Microsoft Teams | 🚧 计划中 | v1.8 |
| 📱 LINE | 🚧 计划中 | v1.9 |
| 💬 Zalo | 🚧 计划中 | v2.0 |
| 💬 iMessage | 🚧 计划中 | v2.1 |
| 🔵 BlueBubbles | 🚧 计划中 | v2.2 |
| ☁️ Nextcloud Talk | 🚧 计划中 | v2.3 |
| ⚡ Nostr | 🚧 计划中 | v2.4 |
| 📺 Twitch | 🚧 计划中 | v2.5 |
| 🌐 Tlon | 🚧 计划中 | v2.6 |

### 🎮 智能控制

- **智能体选择**：在 Sisyphus、Hephaestus、Prometheus、Oracle、Metis、Momus 之间切换
- **模型切换**：快速访问 Gemini、Claude、DeepSeek
- **会话管理**：创建、切换和管理多个对话上下文
- **系统工具**：直接访问 doctor、plugins、auth、config

## 📦 安装

```bash
npm install -g opencode-bot
```

## 🚀 快速开始

### 1. 交互式设置

```bash
opencode-bot-setup
```

设置向导将：
- 检测现有的 OpenClaw 配置并提供导入选项
- 使用方向键选择平台（空格选择，回车确认）
- 配置每个平台的凭据

### 2. 启动机器人

```bash
opencode-bot
```

### 3. 在消息应用中使用

- 发送 `/menu` 打开控制面板
- 选择 **🤖 智能体** 选择你的 AI 助手
- 选择 **🧠 模型** 切换 AI 模型
- 选择 **💬 会话** 管理对话上下文
- 输入任何消息与 OpenCode 聊天

## 🎮 命令

| 命令 | 说明 |
|------|------|
| `/menu` | 打开控制面板 |
| `/new` | 创建新会话 |
| `/start` | 显示欢迎信息 |

## 🤖 可用智能体

| 智能体 | 说明 |
|--------|------|
| Sisyphus | 任务执行器 |
| Hephaestus | 代码工匠 |
| Prometheus | 规划师 |
| Oracle | 顾问 |
| Metis | 预规划顾问 |
| Momus | 质量审查员 |

*需要安装 oh-my-opencode*

## 🛠 菜单选项

### 🤖 智能体
从可用的 OpenCode 智能体中选择

### 🧠 模型
- Gemini 3 Flash（快速）
- Gemini 3 Pro（强大）
- Claude 3.5 Sonnet
- DeepSeek R1

### 💬 会话
- 查看最近会话
- 在上下文之间切换
- 创建新会话

### 🛠 系统工具
- 🩺 Doctor - 健康检查
- 📦 Plugins - 管理插件
- 🔑 Auth - 身份验证
- ⚙️ Config - 配置

## 📁 配置

配置文件：`~/.config/opencode-bot/config.json`

```json
{
  "platforms": [
    {
      "type": "telegram",
      "enabled": true,
      "token": "YOUR_BOT_TOKEN"
    }
  ],
  "opencode": {
    "defaultModel": "google/antigravity-gemini-3-flash",
    "defaultAgent": null
  },
  "agents": {
    "sisyphus": { "name": "Sisyphus", "enabled": true },
    "hephaestus": { "name": "Hephaestus", "enabled": true }
  }
}
```

## 🔧 要求

- Node.js >= 18
- 已安装 OpenCode CLI
- oh-my-opencode（可选，用于智能体）
- 平台特定的凭据（机器人令牌等）

## 🏗 架构

```
opencode-bot/
├── src/
│   ├── adapters/          # 平台适配器（类似 OpenClaw 扩展）
│   │   ├── telegram.js    # ✅ 已实现
│   │   ├── discord.js     # 🚧 计划中
│   │   └── slack.js       # 🚧 计划中
│   ├── core/
│   │   ├── bridge.js      # 到 OpenCode 的 PTY 桥接
│   │   └── config.js      # 配置管理
│   └── index.js           # 入口点
├── bin/
│   └── setup.js           # 交互式设置
└── package.json
```

## 📝 路线图

- [x] Telegram 支持
- [ ] Discord 支持 (v1.1)
- [ ] Slack 支持 (v1.2)
- [ ] WhatsApp 支持 (v1.3)
- [ ] Signal 支持 (v1.4)
- [ ] Matrix 支持 (v1.5)
- [ ] Mattermost 支持 (v1.6)
- [ ] Google Chat 支持 (v1.7)
- [ ] Microsoft Teams 支持 (v1.8)
- [ ] LINE 支持 (v1.9)
- [ ] Zalo 支持 (v2.0)
- [ ] iMessage 支持 (v2.1)
- [ ] BlueBubbles 支持 (v2.2)
- [ ] Nextcloud Talk 支持 (v2.3)
- [ ] Nostr 支持 (v2.4)
- [ ] Twitch 支持 (v2.5)
- [ ] Tlon 支持 (v2.6)

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

## 📄 许可证

MIT

## 🙏 致谢

受 [OpenClaw](https://openclaw.ai) 多平台架构启发。
