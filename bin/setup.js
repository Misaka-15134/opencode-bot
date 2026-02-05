#!/usr/bin/env node
const { ConfigManager, SUPPORTED_PLATFORMS } = require('../src/core/config');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const q = (msg) => new Promise(r => rl.question(msg, r));

async function setup() {
  console.log('🚀 opencode-bot Setup\n');
  
  const config = ConfigManager.load();
  
  console.log('Available platforms:\n');
  Object.entries(SUPPORTED_PLATFORMS).forEach(([key, info]) => {
    const status = config.platforms.find(p => p.type === key)?.enabled ? '✅' : '⭕';
    console.log(`${status} ${info.icon} ${info.name} (${key})`);
    console.log(`   ${info.description}\n`);
  });
  
  console.log('Configure platforms (leave empty to skip):\n');
  
  const enableTelegram = await q('Enable Telegram? (y/n): ');
  if (enableTelegram.toLowerCase() === 'y') {
    const token = await q('Enter Telegram Bot Token: ');
    ConfigManager.addPlatform(config, 'telegram', { token });
    console.log('✅ Telegram configured\n');
  }
  
  const enableDiscord = await q('Enable Discord? (y/n): ');
  if (enableDiscord.toLowerCase() === 'y') {
    const token = await q('Enter Discord Bot Token: ');
    ConfigManager.addPlatform(config, 'discord', { token });
    console.log('✅ Discord configured (will work in v1.1)\n');
  }
  
  const enableSlack = await q('Enable Slack? (y/n): ');
  if (enableSlack.toLowerCase() === 'y') {
    const token = await q('Enter Slack Bot Token: ');
    const signingSecret = await q('Enter Slack Signing Secret: ');
    ConfigManager.addPlatform(config, 'slack', { token, signingSecret });
    console.log('✅ Slack configured (will work in v1.2)\n');
  }
  
  console.log('\n✅ Configuration saved!');
  console.log('Run: opencode-bot');
  
  rl.close();
}

setup();
