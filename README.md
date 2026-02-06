# opencode-bot

🚀 **OpenCode in your favorite chat apps**

Connect OpenCode AI assistant to 17+ chat platforms with a single bridge.

[中文](docs/README.zh-CN.md) | [日本語](docs/README.ja.md) | [한국어](docs/README.ko.md)

---

## ✨ Features

### 🎯 Multi-Platform Support

| Platform | Status | UI Style |
|----------|--------|----------|
| 📱 Telegram | ✅ Ready | Inline Keyboard |
| 🎮 Discord | ✅ Ready | Slash Commands |
| 💼 Slack | ✅ Ready | Block Kit |
| 💬 WhatsApp | ✅ Ready | Quick Replies |
| 🔒 Signal | ✅ Ready | Text Menu |
| 🔷 Matrix | ✅ Ready | Buttons |
| 📋 Mattermost | ✅ Ready | Buttons |
| 💬 Google Chat | ✅ Ready | Cards |
| 🔷 Microsoft Teams | ✅ Ready | Cards |
| 📱 LINE | ✅ Ready | LIFF |
| 💬 Zalo | ✅ Ready | Buttons |
| 💬 iMessage | ✅ Ready | Text Menu |
| 🔵 BlueBubbles | ✅ Ready | Buttons |
| ☁️ Nextcloud Talk | ✅ Ready | Buttons |
| ⚡ Nostr | ✅ Ready | Nip-05 |
| 📺 Twitch | ✅ Ready | Whisper |
| 🌐 Tlon | ✅ Ready | Urbit |

### 🤖 AI Model Selection (12+ Models)

Switch models via `/menu → Models`:

| Provider | Models | Icon |
|----------|--------|------|
| **Google** | Gemini Flash, Gemini Pro | ✨ 🧠 |
| **Anthropic** | Claude 3.5 Sonnet, Claude 4 Opus | 🟣 |
| **DeepSeek** | DeepSeek V3, DeepSeek R1 | 🔵 |
| **Kimi** | Kimi K2.5 | 🌙 |
| **Qwen** | Qwen Plus, Qwen Max | 🌸 🚀 |
| **GLM** | GLM-4, GLM-4V | 📊 🖼️ |
| **Minimax** | MiniMax | ⚡ |

### 🧠 Thinking Mode

Toggle AI reasoning visibility:
- **ON**: Shows `<thinking>` blocks with reasoning
- **OFF**: Direct answer (cleaner, faster)
- Toggle via `/menu → Toggle Thinking`

### ⏹️ Process Control

| Command | Action |
|---------|--------|
| `/stop` | Graceful SIGTERM → 3s wait → SIGKILL |
| Clears | Typing indicators, streaming state |
| Safe | Prevents runaway processes |

### 📂 Session Management

| Feature | Description |
|---------|-------------|
| `/new` | Creates isolated session |
| Persistence | Sessions saved to disk |
| Multi-session | Multiple concurrent conversations |
| Mapping | Chat ID → Session ID mapping |

### 📡 Streaming Output

Optimized for chat platform rate limits:

| Platform | Rate Limit | Optimization |
|----------|------------|--------------|
| Telegram | ~30 msg/sec | 2-second throttle |
| Discord | ~5 msg/sec | Message batching |
| Slack | ~1 msg/sec | Rate-aware |
| Others | Variable | Adaptive |

**Visual Feedback:**
- `▌` indicator during streaming
- `⏳ Processing...` on start
- `[Process Finished ✅/❌]` on exit

### 🔤 Content Safety

- HTML escaping (XSS prevention)
- Markdown preserved
- Code syntax highlighting
- Output truncation for long messages

---

## 🚀 Quick Start

### Installation

```bash
# From GitHub (recommended)
npm install -g github:Misaka-15134/opencode-bot

# Or from source
git clone https://github.com/Misaka-15134/opencode-bot.git
cd opencode-bot
npm install -g .
```

### Setup

```bash
# Interactive setup with guided wizard
opencode-bot-setup

# Non-interactive mode (CI/containers)
opencode-bot-setup --no-interactive
```

### Running

```bash
opencode-bot
```

---

## 🎮 Commands

### Chat Commands

| Command | Description |
|---------|-------------|
| `/menu` | Open interactive control panel |
| `/new` | Start new session |
| `/stop` | Terminate running process |
| `[message]` | Chat with OpenCode |

### OpenCode Commands

| Command | Description |
|---------|-------------|
| `!doctor` | System diagnostics |
| `!plugins` | Plugin management |
| `!auth` | Authentication |
| `!config` | Configuration |

---

## 🔧 Architecture

### Core Components

```
opencode-bot/
├── bin/
│   ├── opencode-bot.js    # Main entry point
│   └── setup.js           # Interactive setup wizard
├── src/
│   ├── adapters/          # Platform adapters (17 total)
│   │   ├── telegram.js
│   │   ├── discord.js
│   │   ├── slack.js
│   │   └── ...
│   └── core/
│       ├── bridge.js      # PTY bridge & streaming
│       └── config.js      # Config management
└── docs/                 # Documentation
```

### PTY Bridge

- Uses `@lydell/node-pty` for real terminal experience
- Streaming output with 2-second throttle
- Process lifecycle management
- Session isolation per chat

### Configuration

| Location | Purpose |
|----------|---------|
| `~/.config/opencode-bot/config.json` | Platform tokens & settings |
| `~/.config/opencode/mobile-bridge.json` | Bridge settings |
| `~/.local/share/opencode/storage/session/` | Session data |

---

## 📦 Requirements

- **Node.js**: >= 18
- **OpenCode CLI**: Installed automatically or manually
- **Platform Tokens**: Telegram Bot Token, Discord Bot Token, etc.

### Auto-Installation

`opencode-bot-setup` automatically installs:
- ✅ OpenCode CLI (if not found)
- ✅ Platform-specific npm packages
- ⚠️ External binaries (Signal CLI, macOS for iMessage)

---

## 🔒 Security

- ✅ No hardcoded credentials
- ✅ Config stored in user directory
- ✅ Tokens never committed to git
- ✅ HTML escaping on all output

---

## 🙏 Credits

Inspired by:
- [OpenClaw](https://openclaw.ai) - Architecture reference
- V17 Telegram Bridge - Feature reference

---

## 📄 License

MIT

---

**Questions? Issues? Pull requests welcome!**
