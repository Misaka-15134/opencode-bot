#!/usr/bin/env node
const { ConfigManager, SUPPORTED_PLATFORMS } = require('../src/core/config');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

let clack;
try {
  clack = require('@clack/prompts');
} catch (e) {
  console.log('Note: For better UI, install @clack/prompts: npm install @clack/prompts');
}

const OPENCLAW_CONFIG = path.join(os.homedir(), '.openclaw/openclaw.json');

async function importFromOpenClaw() {
  if (!fs.existsSync(OPENCLAW_CONFIG)) {
    return null;
  }

  console.log('\n📦 Found OpenClaw configuration!');
  
  if (clack) {
    const shouldImport = await clack.confirm({
      message: 'Import settings from OpenClaw?',
      initialValue: true
    });
    
    if (!shouldImport) return null;
  } else {
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise(r => rl.question('Import from OpenClaw? (y/n): ', r));
    rl.close();
    if (answer.toLowerCase() !== 'y') return null;
  }

  try {
    const openclaw = JSON.parse(fs.readFileSync(OPENCLAW_CONFIG, 'utf8'));
    const imported = { platforms: [] };

    if (openclaw.channels?.telegram?.botToken) {
      imported.platforms.push({
        type: 'telegram',
        enabled: true,
        token: openclaw.channels.telegram.botToken
      });
      console.log('✓ Imported Telegram configuration');
    }

    if (openclaw.channels?.discord?.botToken) {
      imported.platforms.push({
        type: 'discord',
        enabled: true,
        token: openclaw.channels.discord.botToken
      });
      console.log('✓ Imported Discord configuration');
    }

    if (openclaw.channels?.slack?.botToken) {
      imported.platforms.push({
        type: 'slack',
        enabled: true,
        token: openclaw.channels.slack.botToken,
        signingSecret: openclaw.channels.slack.signingSecret || ''
      });
      console.log('✓ Imported Slack configuration');
    }

    if (openclaw.agents?.defaults?.model?.primary) {
      imported.defaultModel = openclaw.agents.defaults.model.primary;
      console.log(`✓ Imported default model: ${imported.defaultModel}`);
    }

    return imported;
  } catch (err) {
    console.error('Failed to import OpenClaw config:', err.message);
    return null;
  }
}

async function interactiveSetup() {
  console.log('\n🚀 opencode-bot Setup\n');
  
  let config = ConfigManager.load();
  
  const imported = await importFromOpenClaw();
  if (imported) {
    config.platforms = [...config.platforms, ...imported.platforms];
    if (imported.defaultModel) {
      config.opencode.defaultModel = imported.defaultModel;
    }
    ConfigManager.save(config);
    
    console.log('\n✅ Configuration imported from OpenClaw!');
    
    const addMore = clack ? await clack.confirm({
      message: 'Add more platforms?',
      initialValue: false
    }) : false;
    
    if (!addMore) {
      console.log('\n🎉 Setup complete! Run: opencode-bot\n');
      return;
    }
  }

  if (clack) {
    await setupWithClack(config);
  } else {
    await setupWithReadline(config);
  }
}

async function setupWithClack(config) {
  const clack = require('@clack/prompts');
  
  clack.intro('opencode-bot Platform Configuration');
  
  const platformList = Object.entries(SUPPORTED_PLATFORMS).map(([key, info]) => ({
    value: key,
    label: `${info.icon} ${info.name}`,
    hint: info.description
  }));

  const selected = await clack.multiselect({
    message: 'Select platforms to enable (Space to select, Enter to confirm):',
    options: platformList,
    required: false
  });

  if (clack.isCancel(selected) || selected.length === 0) {
    clack.outro('No platforms selected. Run opencode-bot-setup again to configure.');
    return;
  }

  const s = clack.spinner();
  
  for (const platformType of selected) {
    const info = SUPPORTED_PLATFORMS[platformType];
    s.start(`Configuring ${info.name}...`);
    
    const settings = {};
    
    for (const field of info.requiredFields) {
      s.stop();
      const value = await clack.text({
        message: `Enter ${info.name} ${field}:`,
        placeholder: field
      });
      
      if (clack.isCancel(value)) {
        clack.outro('Setup cancelled');
        return;
      }
      
      settings[field] = value;
      s.start(`Configuring ${info.name}...`);
    }
    
    try {
      ConfigManager.addPlatform(config, platformType, settings);
      s.stop(`✅ ${info.name} configured`);
    } catch (err) {
      s.stop(`❌ ${info.name} failed: ${err.message}`);
    }
  }

  clack.outro('🎉 Setup complete! Run: opencode-bot');
}

async function setupWithReadline(config) {
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const q = (msg) => new Promise(r => rl.question(msg, r));

  console.log('Available platforms:\n');
  Object.entries(SUPPORTED_PLATFORMS).forEach(([key, info], idx) => {
    console.log(`${idx + 1}. ${info.icon} ${info.name} (${key})`);
    console.log(`   ${info.description}\n`);
  });

  const selection = await q('Enter platform numbers to enable (comma-separated, e.g., 1,3,5): ');
  const indices = selection.split(',').map(s => parseInt(s.trim()) - 1).filter(n => !isNaN(n));
  
  const platforms = Object.keys(SUPPORTED_PLATFORMS);
  
  for (const idx of indices) {
    if (idx < 0 || idx >= platforms.length) continue;
    
    const platformType = platforms[idx];
    const info = SUPPORTED_PLATFORMS[platformType];
    
    console.log(`\n📦 Configuring ${info.name}...`);
    const settings = {};
    
    for (const field of info.requiredFields) {
      settings[field] = await q(`  Enter ${field}: `);
    }
    
    try {
      ConfigManager.addPlatform(config, platformType, settings);
      console.log(`✅ ${info.name} configured\n`);
    } catch (err) {
      console.log(`❌ ${info.name} failed: ${err.message}\n`);
    }
  }

  rl.close();
  console.log('\n🎉 Setup complete! Run: opencode-bot\n');
}

interactiveSetup().catch(console.error);
