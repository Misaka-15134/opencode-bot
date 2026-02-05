# opencode-bot

🚀 **17以上のメッセージングプラットフォームにOpenCodeを接続するユニバーサルブリッジ**

OpenClawのマルチプラットフォームアーキテクチャにインスパイアされ、opencode-botはOpenCodeのパワーをTelegram、Discord、Slack、WhatsApp、Signal、Matrixなどにもたらします。

[English](../README.md) | [中文](README.zh-CN.md) | [한국어](README.ko.md)

## ✨ 機能

### 🤖 マルチプラットフォーム対応

| プラットフォーム | ステータス | バージョン |
|----------------|-----------|-----------|
| 📱 Telegram | ✅ 準備完了 | v1.0 |
| 🎮 Discord | 🚧 計画中 | v1.1 |
| 💼 Slack | 🚧 計画中 | v1.2 |
| 💬 WhatsApp | 🚧 計画中 | v1.3 |
| 🔒 Signal | 🚧 計画中 | v1.4 |
| 🔷 Matrix | 🚧 計画中 | v1.5 |
| 📋 Mattermost | 🚧 計画中 | v1.6 |
| 💬 Google Chat | 🚧 計画中 | v1.7 |
| 🔷 Microsoft Teams | 🚧 計画中 | v1.8 |
| 📱 LINE | 🚧 計画中 | v1.9 |
| 💬 Zalo | 🚧 計画中 | v2.0 |
| 💬 iMessage | 🚧 計画中 | v2.1 |
| 🔵 BlueBubbles | 🚧 計画中 | v2.2 |
| ☁️ Nextcloud Talk | 🚧 計画中 | v2.3 |
| ⚡ Nostr | 🚧 計画中 | v2.4 |
| 📺 Twitch | 🚧 計画中 | v2.5 |
| 🌐 Tlon | 🚧 計画中 | v2.6 |

### 🎮 スマートコントロール

- **エージェント選択**: Sisyphus、Hephaestus、Prometheus、Oracle、Metis、Momus間で切り替え
- **モデル切り替え**: Gemini、Claude、DeepSeekへのクイックアクセス
- **セッション管理**: 複数の会話コンテキストの作成、切り替え、管理
- **システムツール**: doctor、plugins、auth、configへの直接アクセス

## 📦 インストール

```bash
npm install -g opencode-bot
```

## 🚀 クイックスタート

### 1. インタラクティブセットアップ

```bash
opencode-bot-setup
```

セットアップウィザードは以下を行います：
- 既存のOpenClaw設定を検出してインポートを提供
- 矢印キーでプラットフォームを選択（スペースで選択、Enterで確定）
- 各プラットフォームの認証情報を設定

### 2. ボットの起動

```bash
opencode-bot
```

### 3. メッセージングアプリでの使用

- `/menu`を送信してコントロールパネルを開く
- **🤖 エージェント**を選択してAIアシスタントを選択
- **🧠 モデル**を選択してAIモデルを切り替え
- **💬 セッション**を選択して会話コンテキストを管理
- 任意のメッセージを入力してOpenCodeとチャット

## 🎮 コマンド

| コマンド | 説明 |
|---------|------|
| `/menu` | コントロールパネルを開く |
| `/new` | 新しいセッションを作成 |
| `/start` | ウェルカムメッセージを表示 |

## 🤖 利用可能なエージェント

| エージェント | 説明 |
|-------------|------|
| Sisyphus | タスク実行者 |
| Hephaestus | コード職人 |
| Prometheus | プランナー |
| Oracle | コンサルタント |
| Metis | 事前計画コンサルタント |
| Momus | 品質レビューアー |

*oh-my-opencodeのインストールが必要*

## 🛠 メニューオプション

### 🤖 エージェント
利用可能なOpenCodeエージェントから選択

### 🧠 モデル
- Gemini 3 Flash（高速）
- Gemini 3 Pro（強力）
- Claude 3.5 Sonnet
- DeepSeek R1

### 💬 セッション
- 最近のセッションを表示
- コンテキスト間を切り替え
- 新しいセッションを作成

### 🛠 システムツール
- 🩺 Doctor - ヘルスチェック
- 📦 Plugins - プラグイン管理
- 🔑 Auth - 認証
- ⚙️ Config - 設定

## 📁 設定

設定ファイル：`~/.config/opencode-bot/config.json`

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

## 🔧 要件

- Node.js >= 18
- OpenCode CLIがインストールされていること
- oh-my-opencode（オプション、エージェント用）
- プラットフォーム固有の認証情報（ボットトークンなど）

## 🏗 アーキテクチャ

```
opencode-bot/
├── src/
│   ├── adapters/          # プラットフォームアダプター（OpenClaw拡張機能のような）
│   │   ├── telegram.js    # ✅ 実装済み
│   │   ├── discord.js     # 🚧 計画中
│   │   └── slack.js       # 🚧 計画中
│   ├── core/
│   │   ├── bridge.js      # OpenCodeへのPTYブリッジ
│   │   └── config.js      # 設定管理
│   └── index.js           # エントリーポイント
├── bin/
│   └── setup.js           # インタラクティブセットアップ
└── package.json
```

## 📝 ロードマップ

- [x] Telegram対応
- [ ] Discord対応 (v1.1)
- [ ] Slack対応 (v1.2)
- [ ] WhatsApp対応 (v1.3)
- [ ] Signal対応 (v1.4)
- [ ] Matrix対応 (v1.5)
- [ ] Mattermost対応 (v1.6)
- [ ] Google Chat対応 (v1.7)
- [ ] Microsoft Teams対応 (v1.8)
- [ ] LINE対応 (v1.9)
- [ ] Zalo対応 (v2.0)
- [ ] iMessage対応 (v2.1)
- [ ] BlueBubbles対応 (v2.2)
- [ ] Nextcloud Talk対応 (v2.3)
- [ ] Nostr対応 (v2.4)
- [ ] Twitch対応 (v2.5)
- [ ] Tlon対応 (v2.6)

## 🤝 貢献

貢献を歓迎します！気軽にPull Requestを送信してください。

## 📄 ライセンス

MIT

## 🙏 クレジット

[OpenClaw](https://openclaw.ai)のマルチプラットフォームアーキテクチャにインスパイアされました。
