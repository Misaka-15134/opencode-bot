const { BridgeCore } = require('./core/bridge');
const { ConfigManager, SUPPORTED_PLATFORMS } = require('./core/config');
const { TelegramAdapter } = require('./adapters/telegram');
const { DiscordAdapter } = require('./adapters/discord');
const { SlackAdapter } = require('./adapters/slack');
const { WhatsAppAdapter } = require('./adapters/whatsapp');
const { MatrixAdapter } = require('./adapters/matrix');
const { SignalAdapter } = require('./adapters/signal');
const { MattermostAdapter } = require('./adapters/mattermost');
const { GoogleChatAdapter } = require('./adapters/googlechat');
const { MSTeamsAdapter } = require('./adapters/msteams');
const { LineAdapter } = require('./adapters/line');
const { ZaloAdapter } = require('./adapters/zalo');
const { IMessageAdapter } = require('./adapters/imessage');
const { BlueBubblesAdapter } = require('./adapters/bluebubbles');
const { NextcloudAdapter } = require('./adapters/nextcloud');
const { NostrAdapter } = require('./adapters/nostr');
const { TwitchAdapter } = require('./adapters/twitch');
const { TlonAdapter } = require('./adapters/tlon');

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
          const mm = new MattermostAdapter(platform, core);
          await mm.start();
          console.log(`✓ ${SUPPORTED_PLATFORMS.mattermost.icon} Mattermost connected`);
          break;
        case 'googlechat':
          const gc = new GoogleChatAdapter(platform, core);
          await gc.start();
          console.log(`✓ ${SUPPORTED_PLATFORMS.googlechat.icon} Google Chat connected`);
          break;
        case 'msteams':
          const teams = new MSTeamsAdapter(platform, core);
          await teams.start();
          console.log(`✓ ${SUPPORTED_PLATFORMS.msteams.icon} Microsoft Teams connected`);
          break;
        case 'line':
          const line = new LineAdapter(platform, core);
          await line.start();
          console.log(`✓ ${SUPPORTED_PLATFORMS.line.icon} LINE connected`);
          break;
        case 'zalo':
          const zalo = new ZaloAdapter(platform, core);
          await zalo.start();
          console.log(`✓ ${SUPPORTED_PLATFORMS.zalo.icon} Zalo connected`);
          break;
        case 'imessage':
          const imsg = new IMessageAdapter(platform, core);
          await imsg.start();
          console.log(`✓ ${SUPPORTED_PLATFORMS.imessage.icon} iMessage connected`);
          break;
        case 'bluebubbles':
          const bb = new BlueBubblesAdapter(platform, core);
          await bb.start();
          console.log(`✓ ${SUPPORTED_PLATFORMS.bluebubbles.icon} BlueBubbles connected`);
          break;
        case 'nextcloud':
          const nc = new NextcloudAdapter(platform, core);
          await nc.start();
          console.log(`✓ ${SUPPORTED_PLATFORMS.nextcloud.icon} Nextcloud Talk connected`);
          break;
        case 'nostr':
          const nostr = new NostrAdapter(platform, core);
          await nostr.start();
          console.log(`✓ ${SUPPORTED_PLATFORMS.nostr.icon} Nostr connected`);
          break;
        case 'twitch':
          const twitch = new TwitchAdapter(platform, core);
          await twitch.start();
          console.log(`✓ ${SUPPORTED_PLATFORMS.twitch.icon} Twitch connected`);
          break;
        case 'tlon':
          const tlon = new TlonAdapter(platform, core);
          await tlon.start();
          console.log(`✓ ${SUPPORTED_PLATFORMS.tlon.icon} Tlon connected`);
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
