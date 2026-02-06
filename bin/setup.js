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

const PLATFORM_DEPENDENCIES = {
  telegram: [],
  discord: [],
  slack: [],
  whatsapp: ['whatsapp-web.js', 'qrcode-terminal', 'puppeteer'],
  signal: ['axios'],
  matrix: ['matrix-bot-sdk'],
  mattermost: ['axios'],
  googlechat: ['axios', 'jsonwebtoken'],
  msteams: ['axios'],
  line: ['axios'],
  zalo: ['axios'],
  imessage: [],
  bluebubbles: ['axios'],
  nextcloud: ['axios'],
  nostr: ['nostr-tools'],
  twitch: ['axios'],
  tlon: ['axios']
};

const EXTERNAL_DEPENDENCIES = {
  signal: ['signal-cli (https://github.com/AsamK/signal-cli)'],
  imessage: ['macOS with AppleScript support']
};

async function checkDependency(pkg) {
  try {
    require.resolve(pkg);
    return true;
  } catch {
    return false;
  }
}

async function installDependencies(platforms) {
  const depsToInstall = new Set();
  const externalDeps = [];
  
  for (const platform of platforms) {
    const deps = PLATFORM_DEPENDENCIES[platform] || [];
    for (const dep of deps) {
      if (!await checkDependency(dep)) {
        depsToInstall.add(dep);
      }
    }
    
    if (EXTERNAL_DEPENDENCIES[platform]) {
      externalDeps.push(...EXTERNAL_DEPENDENCIES[platform]);
    }
  }
  
  if (depsToInstall.size > 0) {
    console.log('\n📦 Installing platform dependencies...');
    const deps = Array.from(depsToInstall).join(' ');
    
    try {
      execSync(`npm install -g ${deps}`, { stdio: 'inherit' });
      console.log('✅ Dependencies installed successfully');
    } catch (err) {
      console.error('❌ Failed to install dependencies:', err.message);
      console.log('Try running manually: npm install -g', deps);
    }
  }
  
  if (externalDeps.length > 0) {
    console.log('\n⚠️  External dependencies required:');
    externalDeps.forEach(dep => console.log(`  - ${dep}`));
  }
}

async function checkOpencodeInstallation() {
  try {
    execSync('which opencode', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function installOpencode() {
  console.log('\n🔧 OpenCode CLI is required but not found.');
  
  if (clack) {
    const shouldInstall = await clack.confirm({
      message: 'Install OpenCode CLI now?',
      initialValue: true
    });
    
    if (shouldInstall) {
      console.log('\n📦 Installing OpenCode CLI...');
      try {
        execSync('npm install -g opencode', { stdio: 'inherit' });
        console.log('✅ OpenCode CLI installed');
        return true;
      } catch (err) {
        console.error('❌ Failed to install OpenCode:', err.message);
        return false;
      }
    }
  } else {
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise(r => rl.question('Install OpenCode CLI? (y/n): ', r));
    rl.close();
    
    if (answer.toLowerCase() === 'y') {
      console.log('\n📦 Installing OpenCode CLI...');
      try {
        execSync('npm install -g opencode', { stdio: 'inherit' });
        console.log('✅ OpenCode CLI installed');
        return true;
      } catch (err) {
        console.error('❌ Failed to install OpenCode:', err.message);
        return false;
      }
    }
  }
  
  return false;
}

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

  const isNonInteractive = process.env.CI || process.argv.includes('--no-interactive');

  if (isNonInteractive) {
    console.log('Running in non-interactive mode...');
    console.log('Please manually create config at ~/.config/opencode-bot/config.json');
    console.log('Example config:');
    console.log(JSON.stringify(ConfigManager.createDefault(), null, 2));
    return;
  }

  const hasOpencode = await checkOpencodeInstallation();
  if (!hasOpencode) {
    const installed = await installOpencode();
    if (!installed) {
      console.log('\n⚠️  OpenCode CLI is required to use opencode-bot.');
      console.log('Install manually: npm install -g opencode\n');
    }
  } else {
    console.log('✅ OpenCode CLI found');
  }

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

  await installDependencies(selected);
  
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

  const selectedPlatforms = indices.map(idx => platforms[idx]).filter(Boolean);
  await installDependencies(selectedPlatforms);

  rl.close();
  console.log('\n🎉 Setup complete! Run: opencode-bot\n');
}

interactiveSetup().catch(console.error);
