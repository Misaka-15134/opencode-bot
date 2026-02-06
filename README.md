# opencode-bot

🚀 **OpenCode in your favorite chat apps**

Run OpenCode from Telegram, Discord, Slack, WhatsApp, and 13 more platforms.

[中文](docs/README.zh-CN.md) | [日本語](docs/README.ja.md) | [한국어](docs/README.ko.md)

## ✨ Features

### ✅ All 17 Platforms Ready

| Platform | Status | Platform | Status |
|----------|--------|----------|--------|
| 📱 Telegram | ✅ Ready | 📋 Mattermost | ✅ Ready |
| 🎮 Discord | ✅ Ready | 💬 Google Chat | ✅ Ready |
| 💼 Slack | ✅ Ready | 🔷 Microsoft Teams | ✅ Ready |
| 💬 WhatsApp | ✅ Ready | 📱 LINE | ✅ Ready |
| 🔒 Signal | ✅ Ready | 💬 Zalo | ✅ Ready |
| 🔷 Matrix | ✅ Ready | 💬 iMessage | ✅ Ready |
| ☁️ Nextcloud Talk | ✅ Ready | 🔵 BlueBubbles | ✅ Ready |
| ⚡ Nostr | ✅ Ready | 📺 Twitch | ✅ Ready |
| 🌐 Tlon | ✅ Ready | | |

- **Agent Support**: Sisyphus, Hephaestus, Prometheus, Oracle, Metis, Momus
- **Model Switching**: Gemini, Claude, DeepSeek
- **Session Management**: Multiple conversation contexts
- **OpenClaw Import**: Auto-import your existing config

## 🚀 Quick Start

### Install from GitHub (Recommended)
```bash
# Install directly from GitHub (npm package name is taken by another project)
npm install -g github:Misaka-15134/opencode-bot

# Or clone and install manually
git clone https://github.com/Misaka-15134/opencode-bot.git
cd opencode-bot
npm install -g .
```

### Setup
```bash
# Interactive setup
opencode-bot-setup

# Or non-interactive mode (for CI/containers)
opencode-bot-setup --no-interactive
```

### Run
```bash
opencode-bot
```

## 🎮 Usage

Send `/menu` in any connected chat app to access:
- **Agents** - Switch AI assistants
- **Models** - Change AI model
- **Sessions** - Manage conversations
- **Tools** - Doctor, plugins, auth, config
- **Thinking Mode** - Show/hide AI thinking process
- **Stop** - Terminate running process

Or just type any message to chat with OpenCode!

### Commands
| Command | Description |
|---------|-------------|
| `/menu` | Open interactive control panel |
| `/new` | Start a fresh conversation session |
| `/stop` | Terminate running OpenCode process |
| `!doctor` | Check system configuration |

### 💬 Platform-Specific Optimizations

Each platform uses its native UI elements for the best experience:

| Platform | UI Feature | Benefit |
|----------|------------|---------|
| Telegram | Inline Keyboard | One-tap menu selection |
| Discord | Slash Commands | Auto-complete & descriptions |
| Slack | Block Kit | Rich interactive buttons |
| WhatsApp | Quick Replies | Fast preset options |
| LINE | LIFF | Full web app integration |
| Others | Text Menu | Universal compatibility |

### 🧠 Thinking Mode

Toggle AI thinking visibility:
- **ON**: Shows reasoning steps before final answer
- **OFF**: Direct answer (cleaner, faster)
- Default: OFF

### ⏹️ Process Control

The `/stop` command ensures safe process termination:
1. Sends SIGTERM (graceful shutdown)
2. Waits 3s for cleanup
3. Falls back to SIGKILL if needed
- Automatically clears typing indicators

### 📂 Session Management

- Each `/new` creates an isolated session
- Sessions persist across restarts
- Supports multiple concurrent conversations

### 📡 Streaming Output

OpenCode's streaming output is optimized for chat platforms:

| Platform | Rate Limit | Optimization |
|----------|------------|--------------|
| Telegram | ~30 msg/sec | 2-second throttle |
| Discord | ~5 msg/sec | Message batching |
| Slack | ~1 msg/sec | Rate-aware sending |
| Others | Variable | Adaptive throttling |

**Visual Indicators:**
- `▌` (streaming) - Shows during output
- Disappears when complete
- Prevents message spam

### 🔤 Content Safety

All output is sanitized before sending:
- HTML escaping (prevents injection)
- Markdown formatting preserved
- Code blocks syntax highlighted

---

## 📦 Requirements

- Node.js >= 18
- OpenCode CLI (auto-installed if missing)
- Platform bot tokens

## 🔧 Auto-Installation

`opencode-bot-setup` automatically installs:
- ✅ OpenCode CLI (if not found)
- ✅ Platform-specific npm packages
- ⚠️ External binaries (manual install required for Signal, iMessage)

## 🔒 Security

- No hardcoded credentials
- Config stored in `~/.config/opencode-bot/`
- Tokens never committed to git

## 📄 License

MIT

## 🙏 Credits

Inspired by [OpenClaw](https://openclaw.ai)
