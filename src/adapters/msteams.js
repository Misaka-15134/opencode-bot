const axios = require('axios');

class MSTeamsAdapter {
  constructor(config, core) {
    this.config = config;
    this.core = core;
    this.appId = config.appId;
    this.appPassword = config.appPassword;
    this.tenantId = config.tenantId;
    this.accessToken = null;
    this.messages = {};
  }

  async setupHandlers() {
    console.log('🔷 Microsoft Teams adapter initialized');
    await this.authenticate();
  }

  async authenticate() {
    try {
      const url = this.tenantId 
        ? `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`
        : 'https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token';
      
      const response = await axios.post(url, {
        grant_type: 'client_credentials',
        client_id: this.appId,
        client_secret: this.appPassword,
        scope: 'https://api.botframework.com/.default'
      }, {
        timeout: 10000
      });
      
      this.accessToken = response.data.access_token;
      console.log('✅ Microsoft Teams authenticated');
      return true;
    } catch (err) {
      console.error('❌ Microsoft Teams authentication failed:', err.message);
      return false;
    }
  }

  async handleWebhook(activity) {
    const text = activity.text?.trim();
    if (!text) return;
    
    const conversationId = activity.conversation?.id;

    if (text.startsWith('!')) {
      await this.handleCommand(conversationId, text, activity);
      return;
    }

    await this.handleMessage(conversationId, text, activity);
  }

  async handleMessage(conversationId, text, activity) {
    await this.sendActivity(conversationId, '⏳ Processing...', activity);
    this.messages[conversationId] = { conversationId, activity };

    await this.core.execute(conversationId, text, this);
  }

  async handleCommand(conversationId, text, activity) {
    const command = text.slice(1).split(' ')[0].toLowerCase();
    
    switch (command) {
      case 'menu':
        await this.showMenu(conversationId, activity);
        break;
      case 'new':
        const sessionId = this.core.createSession(conversationId);
        await this.sendActivity(conversationId, `🆕 New session: ${sessionId}`, activity);
        break;
      default:
        await this.sendActivity(conversationId, 'Unknown command. Try: !menu, !new', activity);
    }
  }

  async showMenu(conversationId, activity) {
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

    await this.sendActivity(conversationId, menuText, activity);
  }

  async sendActivity(conversationId, text, originalActivity) {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const serviceUrl = originalActivity.serviceUrl || 'https://smba.trafficmanager.net/emea/';
      await axios.post(`${serviceUrl}v3/conversations/${conversationId}/activities`, {
        type: 'message',
        from: { id: this.appId },
        conversation: { id: conversationId },
        text: text.slice(0, 4000)
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
    } catch (err) {
      console.error('Failed to send Teams message:', err.message);
      throw err;
    }
  }

  async onStreamData(conversationId, text) {
    const msgData = this.messages[conversationId];
    if (!msgData) return;

    await this.sendActivity(conversationId, text.slice(0, 4000), msgData.activity);
  }

  async start() {
    await this.setupHandlers();
    console.log('✅ Microsoft Teams adapter started (webhook mode)');
  }

  async stop() {
    console.log('Microsoft Teams adapter stopped');
  }
}

module.exports = { MSTeamsAdapter };
