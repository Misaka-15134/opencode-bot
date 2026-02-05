#!/usr/bin/env node
const { ConfigManager } = require('../src/core/config');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const q = (msg) => new Promise(r => rl.question(msg, r));

async function setup() {
  console.log('🚀 opencode-bot Setup\n');
  
  const config = ConfigManager.load();
  
  console.log('Configure Telegram (required for first setup):');
  const enableTelegram = await q('Enable Telegram? (y/n): ');
  
  if (enableTelegram.toLowerCase() === 'y') {
    const token = await q('Enter Telegram Bot Token: ');
    config.platforms[0].enabled = true;
    config.platforms[0].token = token;
  }
  
  console.log('\nOptional platforms (can be configured later):');
  console.log('- Discord (coming v1.1)');
  console.log('- Slack (coming v1.2)');
  
  ConfigManager.save(config);
  console.log('\n✅ Configuration saved!');
  console.log('Run: opencode-bot');
  
  rl.close();
}

setup();
