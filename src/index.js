#!/usr/bin/env node
/**
 * opencode-bot
 * Multi-platform bridge for OpenCode
 */

const { BridgeCore } = require('./core/bridge');
const { TelegramAdapter } = require('./adapters/telegram');
const { ConfigManager } = require('./core/config');

async function main() {
  const config = ConfigManager.load();
  const core = new BridgeCore(config);

  // Start adapters based on config
  for (const platform of config.platforms) {
    if (platform.enabled) {
      switch (platform.type) {
        case 'telegram':
          const tg = new TelegramAdapter(platform, core);
          await tg.start();
          console.log(`✓ Telegram adapter started`);
          break;
        case 'discord':
          console.log('⚠ Discord adapter coming in v1.1');
          break;
        case 'slack':
          console.log('⚠ Slack adapter coming in v1.2');
          break;
      }
    }
  }

  console.log('\n🚀 opencode-bot is running!');
  console.log('Press Ctrl+C to stop');
}

main().catch(console.error);
