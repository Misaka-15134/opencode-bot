# opencode-bot

🚀 **Multi-platform bridge connecting OpenCode to messaging apps**

Control OpenCode from Telegram, Discord, or Slack with a unified interface.

## ✨ Features

- **Multi-Platform**: Telegram (✓), Discord (planned), Slack (planned)
- **Agent Selection**: Switch between Sisyphus, Hephaestus, Prometheus, Oracle, etc.
- **Session Management**: Create, switch, and manage multiple conversation contexts
- **Model Switching**: Quick access to Gemini, Claude, DeepSeek models
- **System Tools**: Direct access to OpenCode's doctor, plugins, auth, config

## 📦 Installation

```bash
npm install -g opencode-bot
```

## 🚀 Quick Start

### 1. Initial Setup

```bash
opencode-bot-setup
```

Enter your Telegram Bot Token when prompted.

### 2. Start the Bot

```bash
opencode-bot
```

### 3. Use in Telegram

- Send `/menu` to open the control panel
- Select **Agents** to choose Sisyphus, Hephaestus, etc.
- Select **Models** to switch AI models
- Select **Sessions** to manage conversation contexts
- Type any message to chat with OpenCode

## 🎮 Commands

| Command | Description |
|---------|-------------|
| `/menu` | Open control panel |
| `/new` | Create new session |
| `/start` | Show welcome message |

## 🛠 Menu Options

### 🤖 Agents
- Sisyphus - Task executor
- Hephaestus - Code crafter  
- Prometheus - Planner
- Oracle - Consultant

*Requires oh-my-opencode to be installed*

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
- Doctor - Health check
- Plugins - Manage plugins
- Auth - Authentication
- Config - Configuration

## 📁 Configuration

Config file: `~/.config/opencode-bot/config.json`

```json
{
  "platforms": [{
    "type": "telegram",
    "enabled": true,
    "token": "YOUR_BOT_TOKEN"
  }],
  "opencode": {
    "defaultModel": "google/antigravity-gemini-3-flash",
    "defaultAgent": null
  }
}
```

## 🔧 Requirements

- Node.js >= 18
- OpenCode CLI installed
- oh-my-opencode (optional, for agents)

## 📄 License

MIT
