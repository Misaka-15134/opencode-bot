const { MatrixClient, SimpleFsStorageProvider, AutojoinRoomsMixin } = require('matrix-bot-sdk');

class MatrixAdapter {
  constructor(config, core) {
    this.config = config;
    this.core = core;
    this.homeserver = config.homeserver;
    this.accessToken = config.accessToken;
    this.userId = config.userId;
    this.messages = {};
    
    const storage = new SimpleFsStorageProvider('matrix-bot.json');
    this.client = new MatrixClient(this.homeserver, this.accessToken, storage);
    AutojoinRoomsMixin.setupOnClient(this.client);
  }

  setupHandlers() {
    this.client.on('room.message', async (roomId, event) => {
      if (event.sender === this.userId) return;
      if (!event.content || event.content.msgtype !== 'm.text') return;
      
      const text = event.content.body.trim();
      
      if (text.startsWith('!')) {
        await this.handleCommand(roomId, text, event);
        return;
      }

      await this.handleMessage(roomId, text, event);
    });

    this.client.start().then(() => {
      console.log('✅ Matrix client started');
    });
  }

  async handleMessage(roomId, text, event) {
    const thinkingEvent = await this.client.sendMessage(roomId, {
      msgtype: 'm.text',
      body: '⏳ Processing...'
    });
    
    this.messages[roomId] = { eventId: thinkingEvent.event_id, roomId };

    await this.core.execute(roomId, text, this);
  }

  async handleCommand(roomId, text, event) {
    const command = text.slice(1).split(' ')[0].toLowerCase();
    
    switch (command) {
      case 'menu':
        await this.showMenu(roomId);
        break;
      case 'new':
        const sessionId = this.core.createSession(roomId);
        await this.client.sendMessage(roomId, {
          msgtype: 'm.text',
          body: `🆕 New session: \`${sessionId}\``
        });
        break;
      default:
        await this.client.sendMessage(roomId, {
          msgtype: 'm.text',
          body: 'Unknown command. Try: !menu, !new'
        });
    }
  }

  async showMenu(roomId) {
    const currentModel = this.core.config.opencode.defaultModel?.split('/').pop() || 'default';
    const currentAgent = this.core.config.opencode.defaultAgent || 'none';

    const menuText = `
🎮 **OpenCode Bot Control Center**

Model: \`${currentModel}\`
Agent: \`${currentAgent}\`

Commands:
• \`!new\` - Create new session
• \`!menu\` - Show this menu

Or just send a message to chat with OpenCode!
    `.trim();

    await this.client.sendMessage(roomId, {
      msgtype: 'm.text',
      body: menuText,
      format: 'org.matrix.custom.html',
      formatted_body: menuText.replace(/\n/g, '\u003cbr\u003e')
    });
  }

  async onStreamData(roomId, text) {
    const msgData = this.messages[roomId];
    if (!msgData) return;

    const formatted = '```\n' + text.slice(-3900) + '\n```';
    
    await this.client.sendMessage(roomId, {
      msgtype: 'm.text',
      body: formatted,
      format: 'org.matrix.custom.html',
      formatted_body: '\u003cpre\u003e\u003ccode\u003e' + text.slice(-3900) + '\u003c/code\u003e\u003c/pre\u003e'
    });
  }

  async start() {
    this.setupHandlers();
  }

  async stop() {
    await this.client.stop();
  }
}

module.exports = { MatrixAdapter };
