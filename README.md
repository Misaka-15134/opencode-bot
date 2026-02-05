# opencode-bot

🚀 **Universal bridge connecting OpenCode to 17+ messaging platforms**

Inspired by OpenClaw's multi-platform architecture, opencode-bot brings OpenCode's power to Telegram, Discord, Slack, WhatsApp, Signal, Matrix, and more.

## ✨ Features

### 🤖 Multi-Platform Support

| Platform | Status | Version |
|----------|--------|---------|
| 📱 Telegram | ✅ Ready | v1.0 |
| 🎮 Discord | 🚧 Planned | v1.1 |
| 💼 Slack | 🚧 Planned | v1.2 |
| 💬 WhatsApp | 🚧 Planned | v1.3 |
| 🔒 Signal | 🚧 Planned | v1.4 |
| 🔷 Matrix | 🚧 Planned | v1.5 |
| 📋 Mattermost | 🚧 Planned | v1.6 |
| 💬 Google Chat | 🚧 Planned | v1.7 |
| 🔷 Microsoft Teams | 🚧 Planned | v1.8 |
| 📱 LINE | 🚧 Planned | v1.9 |
| 💬 Zalo | 🚧 Planned | v2.0 |
| 💬 iMessage | 🚧 Planned | v2.1 |
| 🔵 BlueBubbles | 🚧 Planned | v2.2 |
| ☁️ Nextcloud Talk | 🚧 Planned | v2.3 |
| ⚡ Nostr | 🚧 Planned | v2.4 |
| 📺 Twitch | 🚧 Planned | v2.5 |
| 🌐 Tlon | 🚧 Planned | v2.6 |

### 🎮 Smart Controls

- **Agent Selection**: Switch between Sisyphus, Hephaestus, Prometheus, Oracle, Metis, Momus
- **Model Switching**: Quick access to Gemini, Claude, DeepSeek
- **Session Management**: Create, switch, and manage multiple conversation contexts
- **System Tools**: Direct access to doctor, plugins, auth, config

## 📦 Installation

```bash
npm install -g opencode-bot
```

## 🚀 Quick Start

### 1. Interactive Setup

```bash
opencode-bot-setup
```

Choose which platforms to enable and enter their credentials.

### 2. Start the Bot

```bash
opencode-bot
```

### 3. Use in Your Messaging App

- Send `/menu` to open the control panel
- Select **🤖 Agents** to choose your AI assistant
- Select **🧠 Models** to switch AI models
- Select **💬 Sessions** to manage conversations
- Type any message to chat with OpenCode

## 🎮 Commands

| Command | Description |
|---------|-------------|
| `/menu` | Open control panel |
| `/new` | Create new session |
| `/start` | Show welcome message |

## 🤖 Available Agents

| Agent | Description |
|-------|-------------|
| Sisyphus | Task executor |
| Hephaestus | Code crafter |
| Prometheus | Planner |
| Oracle | Consultant |
| Metis | Pre-planning consultant |
| Momus | Quality reviewer |

*Requires oh-my-opencode to be installed*

## 🛠 Menu Options

### 🤖 Agents
Select from available OpenCode agents

### 🧠 Models
- Gemini 3 Flash (fast)
- Gemini 3 Pro (powerful)
- Claude 3.5 Sonnet
- DeepSeek R1

### 💬 Sessions
- View recent sessions
- Switch between contexts
- Create new sessions

### 🛠 System Tools
- 🩺 Doctor - Health check
- 📦 Plugins - Manage plugins
- 🔑 Auth - Authentication
- ⚙️ Config - Configuration

## 📁 Configuration

Config file: `~/.config/opencode-bot/config.json`

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

## 🔧 Requirements

- Node.js >= 18
- OpenCode CLI installed
- oh-my-opencode (optional, for agents)
- Platform-specific credentials (bot tokens, etc.)

## 🏗 Architecture

```
opencode-bot/
├── src/
│   ├── adapters/          # Platform adapters (like OpenClaw extensions)
│   │   ├── telegram.js    # ✅ Implemented
│   │   ├── discord.js     # 🚧 Planned
│   │   └── slack.js       # 🚧 Planned
│   ├── core/
│   │   ├── bridge.js      # PTY bridge to OpenCode
│   │   └── config.js      # Configuration management
│   └── index.js           # Entry point
├── bin/
│   └── setup.js           # Interactive setup
└── package.json
```

## 📝 Roadmap

- [x] Telegram support
- [ ] Discord support (v1.1)
- [ ] Slack support (v1.2)
- [ ] WhatsApp support (v1.3)
- [ ] Signal support (v1.4)
- [ ] Matrix support (v1.5)
- [ ] Mattermost support (v1.6)
- [ ] Google Chat support (v1.7)
- [ ] Microsoft Teams support (v1.8)
- [ ] LINE support (v1.9)
- [ ] Zalo support (v2.0)
- [ ] iMessage support (v2.1)
- [ ] BlueBubbles support (v2.2)
- [ ] Nextcloud Talk support (v2.3)
- [ ] Nostr support (v2.4)
- [ ] Twitch support (v2.5)
- [ ] Tlon support (v2.6)

## 📄 License

MIT

## 🙏 Credits

Inspired by [OpenClaw](https://openclaw.ai)'s multi-platform architecture.
