# opencode-bot

🚀 **OpenCode in your favorite chat apps**

Run OpenCode from Telegram, Discord, Slack, WhatsApp, and 13 more platforms.

[中文](docs/README.zh-CN.md) | [日本語](docs/README.ja.md) | [한국어](docs/README.ko.md)

## ✨ Features

- **17 Platforms**: Telegram, Discord, Slack, WhatsApp, Signal, Matrix, Mattermost, Google Chat, Teams, LINE, Zalo, iMessage, BlueBubbles, Nextcloud, Nostr, Twitch, Tlon
- **Agent Support**: Sisyphus, Hephaestus, Prometheus, Oracle, Metis, Momus
- **Model Switching**: Gemini, Claude, DeepSeek
- **Session Management**: Multiple conversation contexts
- **OpenClaw Import**: Auto-import your existing config

## 🚀 Quick Start

```bash
# Install
npm install -g opencode-bot

# Setup
opencode-bot-setup

# Run
opencode-bot
```

## 🎮 Usage

Send `/menu` in any connected chat app to access:
- **Agents** - Switch AI assistants
- **Models** - Change AI model
- **Sessions** - Manage conversations
- **Tools** - Doctor, plugins, auth, config

Or just type any message to chat with OpenCode!

## 📦 Requirements

- Node.js >= 18
- OpenCode CLI
- Platform bot tokens

## 🔒 Security

- No hardcoded credentials
- Config stored in `~/.config/opencode-bot/`
- Tokens never committed to git

## 📄 License

MIT

## 🙏 Credits

Inspired by [OpenClaw](https://openclaw.ai)
