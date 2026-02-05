const { BridgeCore } = require('./core/bridge');
const { ConfigManager, SUPPORTED_PLATFORMS } = require('./core/config');
const { TelegramAdapter } = require('./adapters/telegram');
const { DiscordAdapter } = require('./adapters/discord');
const { SlackAdapter } = require('./adapters/slack');
const { WhatsAppAdapter } = require('./adapters/whatsapp');
const { MatrixAdapter } = require('./adapters/matrix');
const { SignalAdapter } = require('./adapters/signal');

async function main() {
  const config = ConfigManager.load();
  const core = new BridgeCore(config);

  console.log('🚀 Starting opencode-bot...\n');

  const enabledPlatforms = config.platforms.filter(p => p.enabled);
  
  if (enabledPlatforms.length === 0) {
    console.log('⚠️  No platforms enabled.');
    console.log('Run: opencode-bot-setup\n');
    console.log('Supported platforms:');
    Object.entries(SUPPORTED_PLATFORMS).forEach(([key, info]) => {
      console.log(`  ${info.icon} ${info.name} (${key})`);
    });
    process.exit(1);
  }

  for (const platform of enabledPlatforms) {
    try {
      switch (platform.type) {
        case 'telegram':
          const tg = new TelegramAdapter(platform, core);
          await tg.start();
          console.log(`✓ ${SUPPORTED_PLATFORMS.telegram.icon} Telegram connected`);
          break;
        case 'discord':
          const dc = new DiscordAdapter(platform, core);
          await dc.start();
          console.log(`✓ ${SUPPORTED_PLATFORMS.discord.icon} Discord connected`);
          break;
        case 'slack':
          const slack = new SlackAdapter(platform, core);
          await slack.start();
          console.log(`✓ ${SUPPORTED_PLATFORMS.slack.icon} Slack connected`);
          break;
        case 'whatsapp':
          const wa = new WhatsAppAdapter(platform, core);
          await wa.start();
          console.log(`✓ ${SUPPORTED_PLATFORMS.whatsapp.icon} WhatsApp connected`);
          break;
        case 'signal':
          const sig = new SignalAdapter(platform, core);
          await sig.start();
          console.log(`✓ ${SUPPORTED_PLATFORMS.signal.icon} Signal connected`);
          break;
        case 'matrix':
          const mtx = new MatrixAdapter(platform, core);
          await mtx.start();
          console.log(`✓ ${SUPPORTED_PLATFORMS.matrix.icon} Matrix connected`);
          break;
        case 'mattermost':
          console.log(`⏳ ${SUPPORTED_PLATFORMS.mattermost.icon} Mattermost (v1.6)`);
          break;
        case 'googlechat':
          console.log(`⏳ ${SUPPORTED_PLATFORMS.googlechat.icon} Google Chat (v1.7)`);
          break;
        case 'msteams':
          console.log(`⏳ ${SUPPORTED_PLATFORMS.msteams.icon} Microsoft Teams (v1.8)`);
          break;
        case 'line':
          console.log(`⏳ ${SUPPORTED_PLATFORMS.line.icon} LINE (v1.9)`);
          break;
        case 'zalo':
          console.log(`⏳ ${SUPPORTED_PLATFORMS.zalo.icon} Zalo (v2.0)`);
          break;
        case 'imessage':
          console.log(`⏳ ${SUPPORTED_PLATFORMS.imessage.icon} iMessage (v2.1)`);
          break;
        case 'bluebubbles':
          console.log(`⏳ ${SUPPORTED_PLATFORMS.bluebubbles.icon} BlueBubbles (v2.2)`);
          break;
        case 'nextcloud':
          console.log(`⏳ ${SUPPORTED_PLATFORMS.nextcloud.icon} Nextcloud Talk (v2.3)`);
          break;
        case 'nostr':
          console.log(`⏳ ${SUPPORTED_PLATFORMS.nostr.icon} Nostr (v2.4)`);
          break;
        case 'twitch':
          console.log(`⏳ ${SUPPORTED_PLATFORMS.twitch.icon} Twitch (v2.5)`);
          break;
        case 'tlon':
          console.log(`⏳ ${SUPPORTED_PLATFORMS.tlon.icon} Tlon (v2.6)`);
          break;
        default:
          console.log(`⚠️  Unknown platform: ${platform.type}`);
      }
    } catch (err) {
      console.error(`✗ ${platform.type} failed:`, err.message);
    }
  }

  console.log('\n✅ opencode-bot is running!');
  console.log('Press Ctrl+C to stop\n');
}

main().catch(console.error);
