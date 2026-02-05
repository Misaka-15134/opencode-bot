const axios = require('axios');

class BlueBubblesAdapter {
  constructor(config, core) {
    this.config = config;
    this.core = core;
    this.serverUrl = config.serverUrl;
    this.password = config.password;
    this.messages = {};
  }

  async setupHandlers() {
    console.log('🔵 BlueBubbles adapter initialized');
    console.log(`Server: ${this.serverUrl}`);
    
    await this.checkConnection();
    this.startPolling();
  }

  async checkConnection() {
    try {
      const response = await axios.get(`${this.serverUrl}/api/v1/server/info`, {
        headers: this.password ? { 'Authorization': this.password } : {},
        timeout: 5000
      });
      console.log(`✅ BlueBubbles connected: ${response.data.data?.server_version}`);
      return true;
    } catch (err) {
      console.error('❌ BlueBubbles connection failed:', err.message);
      return false;
    }
  }

  startPolling() {
    setInterval(async () => {
      try {
        const response = await axios.get(`${this.serverUrl}/api/v1/message/updated`, {
          headers: this.password ? { 'Authorization': this.password } : {},
          timeout: 10000
        });
        
        for (const message of response.data.data || []) {
          if (message.is_from_me) continue;
          await this.handleMessage(message);
        }
      } catch (err) {
        if (err.code !== 'ECONNABORTED') {
          console.error('BlueBubbles polling error:', err.message);
        }
      }
    }, 3000);
  }

  async handleMessage(message) {
    const text = message.text?.trim();
    if (!text) return;
    
    const chatGuid = message.chat_guid;

    if (text.startsWith('!')) {
      await this.handleCommand(chatGuid, text);
      return;
    }

    const thinkingMsg = await this.sendMessage(chatGuid, '⏳ Processing...');
    this.messages[chatGuid] = { guid: thinkingMsg.guid };

    await this.core.execute(chatGuid, text, this);
  }

  async handleCommand(chatGuid, text) {
    const command = text.slice(1).split(' ')[0].toLowerCase();
    
    switch (command) {
      case 'menu':
        await this.showMenu(chatGuid);
        break;
      case 'new':
        const sessionId = this.core.createSession(chatGuid);
        await this.sendMessage(chatGuid, `🆕 New session: ${sessionId}`);
        break;
      default:
        await this.sendMessage(chatGuid, 'Unknown command. Try: !menu, !new');
    }
  }

  async showMenu(chatGuid) {
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

    await this.sendMessage(chatGuid, menuText);
  }

  async sendMessage(chatGuid, text) {
    try {
      const response = await axios.post(`${this.serverUrl}/api/v1/message`, {
        chat_guid: chatGuid,
        message: text.slice(0, 4000)
      }, {
        headers: this.password ? { 'Authorization': this.password } : {},
        timeout: 30000
      });
      return response.data.data;
    } catch (err) {
      console.error('Failed to send BlueBubbles message:', err.message);
      throw err;
    }
  }

  async onStreamData(chatGuid, text) {
    const msgData = this.messages[chatGuid];
    if (!msgData) return;

    await this.sendMessage(chatGuid, text.slice(0, 4000));
  }

  async start() {
    await this.setupHandlers();
  }

  async stop() {
    console.log('BlueBubbles adapter stopped');
  }
}

module.exports = { BlueBubblesAdapter };
