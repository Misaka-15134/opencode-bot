const { App } = require('@slack/bolt');

class SlackAdapter {
  constructor(config, core) {
    this.config = config;
    this.core = core;
    this.app = new App({
      token: config.token,
      signingSecret: config.signingSecret,
      socketMode: config.socketMode !== false,
      appToken: config.appToken
    });
    this.messages = {};
  }

  setupHandlers() {
    this.app.message(async ({ message, say }) => {
      if (message.subtype === 'bot_message') return;
      
      const text = message.text?.trim() || '';
      const channelId = message.channel;
      
      if (text.startsWith('!')) {
        await this.handleCommand(text, say, channelId);
        return;
      }

      const thinkingMsg = await say('⏳ Processing...');
      this.messages[channelId] = { message: thinkingMsg, ts: thinkingMsg.ts };

      await this.core.execute(channelId, text, this);
    });

    this.app.error((error) => {
      console.error('Slack error:', error);
    });
  }

  async handleCommand(text, say, channelId) {
    const command = text.slice(1).split(' ')[0].toLowerCase();
    
    switch (command) {
      case 'menu':
        await this.showMenu(say);
        break;
      case 'new':
        const sessionId = this.core.createSession(channelId);
        await say(`🆕 New session: \`${sessionId}\``);
        break;
      default:
        await say('Unknown command. Try: !menu, !new');
    }
  }

  async showMenu(say) {
    const currentModel = this.core.config.opencode.defaultModel?.split('/').pop() || 'default';
    const currentAgent = this.core.config.opencode.defaultAgent || 'none';

    await say({
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🎮 OpenCode Bot Control Center',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Model:* \`${currentModel}\``
            },
            {
              type: 'mrkdwn',
              text: `*Agent:* \`${currentAgent}\``
            }
          ]
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Commands:\n• `!new` - Create new session\n• `!menu` - Show this menu\n\nOr just send a message to chat!'
          }
        }
      ]
    });
  }

  onStreamData(channelId, text) {
    const msgData = this.messages[channelId];
    if (!msgData) return;

    const formatted = '```\n' + text.slice(-2900) + '\n```';
    
    this.app.client.chat.update({
      channel: channelId,
      ts: msgData.ts,
      text: formatted
    }).catch(() => {});
  }

  async start() {
    this.setupHandlers();
    await this.app.start();
    console.log('✅ Slack Bolt app is running');
  }

  async stop() {
    await this.app.stop();
  }
}

module.exports = { SlackAdapter };
