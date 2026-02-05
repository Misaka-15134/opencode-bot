const axios = require('axios');

class LineAdapter {
  constructor(config, core) {
    this.config = config;
    this.core = core;
    this.channelAccessToken = config.channelAccessToken;
    this.channelSecret = config.channelSecret;
    this.messages = {};
    this.apiUrl = 'https://api.line.me/v2/bot';
  }

  async setupHandlers() {
    console.log('📱 LINE adapter initialized');
    await this.checkConnection();
  }

  async checkConnection() {
    try {
      await axios.get(`${this.apiUrl}/info`, {
        headers: { Authorization: `Bearer ${this.channelAccessToken}` },
        timeout: 5000
      });
      console.log('✅ LINE API connected');
      return true;
    } catch (err) {
      console.error('❌ LINE API connection failed:', err.message);
      return false;
    }
  }

  async handleWebhook(events) {
    for (const event of events) {
      if (event.type !== 'message' || event.message.type !== 'text') continue;
      
      const text = event.message.text.trim();
      const userId = event.source.userId;

      if (text.startsWith('!')) {
        await this.handleCommand(userId, text);
        continue;
      }

      await this.handleMessage(userId, text);
    }
  }

  async handleMessage(userId, text) {
    await this.pushMessage(userId, '⏳ Processing...');
    this.messages[userId] = { userId };

    await this.core.execute(userId, text, this);
  }

  async handleCommand(userId, text) {
    const command = text.slice(1).split(' ')[0].toLowerCase();
    
    switch (command) {
      case 'menu':
        await this.showMenu(userId);
        break;
      case 'new':
        const sessionId = this.core.createSession(userId);
        await this.pushMessage(userId, `🆕 New session: ${sessionId}`);
        break;
      default:
        await this.pushMessage(userId, 'Unknown command. Try: !menu, !new');
    }
  }

  async showMenu(userId) {
    const currentModel = this.core.config.opencode.defaultModel?.split('/').pop() || 'default';
    const currentAgent = this.core.config.opencode.defaultAgent || 'none';

    const menuText = `
🎮 OpenCode Bot Control Center

Model: ${currentModel}
Agent: ${currentAgent}

Commands:
• !new - Create new session
• !menu - Show this menu

Or just send a message to chat with OpenCode!
    `.trim();

    await this.pushMessage(userId, menuText);
  }

  async pushMessage(userId, text) {
    try {
      await axios.post(`${this.apiUrl}/message/push`, {
        to: userId,
        messages: [{ type: 'text', text: text.slice(0, 5000) }]
      }, {
        headers: { 
          Authorization: `Bearer ${this.channelAccessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
    } catch (err) {
      console.error('Failed to send LINE message:', err.message);
      throw err;
    }
  }

  async onStreamData(userId, text) {
    const msgData = this.messages[userId];
    if (!msgData) return;

    await this.pushMessage(userId, text.slice(0, 5000));
  }

  async start() {
    await this.setupHandlers();
    console.log('✅ LINE adapter started (webhook mode)');
  }

  async stop() {
    console.log('LINE adapter stopped');
  }
}

module.exports = { LineAdapter };
