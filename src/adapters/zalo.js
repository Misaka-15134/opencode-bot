const axios = require('axios');

class ZaloAdapter {
  constructor(config, core) {
    this.config = config;
    this.core = core;
    this.oaId = config.oaId;
    this.oaSecret = config.oaSecret;
    this.accessToken = null;
    this.messages = {};
  }

  async setupHandlers() {
    console.log('💬 Zalo adapter initialized');
    await this.authenticate();
  }

  async authenticate() {
    try {
      const response = await axios.post('https://oauth.zaloapp.com/v4/oa/access_token', {
        app_id: this.oaId,
        secret_key: this.oaSecret,
        grant_type: 'client_credentials'
      }, {
        timeout: 10000
      });
      
      this.accessToken = response.data.access_token;
      console.log('✅ Zalo OA authenticated');
      return true;
    } catch (err) {
      console.error('❌ Zalo authentication failed:', err.message);
      return false;
    }
  }

  async handleWebhook(event) {
    const text = event.message?.text?.trim();
    if (!text) return;
    
    const userId = event.sender?.id;

    if (text.startsWith('!')) {
      await this.handleCommand(userId, text);
      return;
    }

    await this.handleMessage(userId, text);
  }

  async handleMessage(userId, text) {
    await this.sendMessage(userId, '⏳ Processing...');
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
        await this.sendMessage(userId, `🆕 New session: ${sessionId}`);
        break;
      default:
        await this.sendMessage(userId, 'Unknown command. Try: !menu, !new');
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

    await this.sendMessage(userId, menuText);
  }

  async sendMessage(userId, text) {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      await axios.post('https://openapi.zalo.me/v3.0/oa/message/cs', {
        recipient: { user_id: userId },
        message: { text: text.slice(0, 2000) }
      }, {
        headers: {
          'access_token': this.accessToken,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
    } catch (err) {
      console.error('Failed to send Zalo message:', err.message);
      throw err;
    }
  }

  async onStreamData(userId, text) {
    const msgData = this.messages[userId];
    if (!msgData) return;

    await this.sendMessage(userId, text.slice(0, 2000));
  }

  async start() {
    await this.setupHandlers();
    console.log('✅ Zalo adapter started (webhook mode)');
  }

  async stop() {
    console.log('Zalo adapter stopped');
  }
}

module.exports = { ZaloAdapter };
