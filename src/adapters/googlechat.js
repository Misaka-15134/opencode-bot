const axios = require('axios');

class GoogleChatAdapter {
  constructor(config, core) {
    this.config = config;
    this.core = core;
    this.serviceAccountKey = config.serviceAccountKey;
    this.spaceId = config.spaceId;
    this.accessToken = null;
    this.messages = {};
  }

  async setupHandlers() {
    console.log('💬 Google Chat adapter initialized');
    await this.authenticate();
  }

  async authenticate() {
    try {
      const jwt = this.createJWT();
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      }, {
        timeout: 10000
      });
      
      this.accessToken = response.data.access_token;
      console.log('✅ Google Chat authenticated');
      return true;
    } catch (err) {
      console.error('❌ Google Chat authentication failed:', err.message);
      return false;
    }
  }

  createJWT() {
    const key = typeof this.serviceAccountKey === 'string' 
      ? JSON.parse(this.serviceAccountKey) 
      : this.serviceAccountKey;
    
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: key.client_email,
      sub: key.client_email,
      scope: 'https://www.googleapis.com/auth/chat.bot',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600
    };
    
    console.log('JWT created (implementation requires crypto library)');
    return 'jwt_token_placeholder';
  }

  async handleWebhook(event) {
    const text = event.message?.text?.trim();
    if (!text) return;
    
    const spaceId = event.space?.name;

    if (text.startsWith('!')) {
      await this.handleCommand(spaceId, text);
      return;
    }

    await this.handleMessage(spaceId, text);
  }

  async handleMessage(spaceId, text) {
    await this.sendMessage(spaceId, '⏳ Processing...');
    this.messages[spaceId] = { spaceId };

    await this.core.execute(spaceId, text, this);
  }

  async handleCommand(spaceId, text) {
    const command = text.slice(1).split(' ')[0].toLowerCase();
    
    switch (command) {
      case 'menu':
        await this.showMenu(spaceId);
        break;
      case 'new':
        const sessionId = this.core.createSession(spaceId);
        await this.sendMessage(spaceId, `🆕 New session: ${sessionId}`);
        break;
      default:
        await this.sendMessage(spaceId, 'Unknown command. Try: !menu, !new');
    }
  }

  async showMenu(spaceId) {
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

    await this.sendMessage(spaceId, menuText);
  }

  async sendMessage(spaceId, text) {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      await axios.post(`https://chat.googleapis.com/v1/${spaceId}/messages`, {
        text: text.slice(0, 4096)
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
    } catch (err) {
      console.error('Failed to send Google Chat message:', err.message);
      throw err;
    }
  }

  async onStreamData(spaceId, text) {
    const msgData = this.messages[spaceId];
    if (!msgData) return;

    await this.sendMessage(spaceId, text.slice(0, 4096));
  }

  async start() {
    await this.setupHandlers();
    console.log('✅ Google Chat adapter started (webhook mode)');
  }

  async stop() {
    console.log('Google Chat adapter stopped');
  }
}

module.exports = { GoogleChatAdapter };
