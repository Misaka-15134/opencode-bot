const axios = require('axios');

class MattermostAdapter {
  constructor(config, core) {
    this.config = config;
    this.core = core;
    this.url = config.url;
    this.token = config.token;
    this.team = config.team;
    this.messages = {};
  }

  async setupHandlers() {
    console.log('📱 Mattermost adapter initialized');
    console.log(`Server: ${this.url}`);
    
    await this.checkConnection();
    this.startPolling();
  }

  async checkConnection() {
    try {
      const response = await axios.get(`${this.url}/api/v4/users/me`, {
        headers: { Authorization: `Bearer ${this.token}` },
        timeout: 5000
      });
      console.log(`✅ Mattermost connected as ${response.data.username}`);
      return true;
    } catch (err) {
      console.error('❌ Mattermost connection failed:', err.message);
      return false;
    }
  }

  startPolling() {
    setInterval(async () => {
      try {
        const posts = await axios.get(`${this.url}/api/v4/channels/direct/posts`, {
          headers: { Authorization: `Bearer ${this.token}` },
          timeout: 10000
        });
        
        for (const post of posts.data.posts || []) {
          if (post.user_id === this.userId) continue;
          await this.handlePost(post);
        }
      } catch (err) {
        if (err.code !== 'ECONNABORTED') {
          console.error('Mattermost polling error:', err.message);
        }
      }
    }, 3000);
  }

  async handlePost(post) {
    const text = post.message?.trim();
    if (!text) return;
    
    const channelId = post.channel_id;

    if (text.startsWith('!')) {
      await this.handleCommand(channelId, text);
      return;
    }

    const thinkingMsg = await this.sendPost(channelId, '⏳ Processing...');
    this.messages[channelId] = { id: thinkingMsg.id };

    await this.core.execute(channelId, text, this);
  }

  async handleCommand(channelId, text) {
    const command = text.slice(1).split(' ')[0].toLowerCase();
    
    switch (command) {
      case 'menu':
        await this.showMenu(channelId);
        break;
      case 'new':
        const sessionId = this.core.createSession(channelId);
        await this.sendPost(channelId, `🆕 New session: \`${sessionId}\``);
        break;
      default:
        await this.sendPost(channelId, 'Unknown command. Try: !menu, !new');
    }
  }

  async showMenu(channelId) {
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

    await this.sendPost(channelId, menuText);
  }

  async sendPost(channelId, text) {
    try {
      const response = await axios.post(`${this.url}/api/v4/posts`, {
        channel_id: channelId,
        message: text
      }, {
        headers: { Authorization: `Bearer ${this.token}` },
        timeout: 30000
      });
      return response.data;
    } catch (err) {
      console.error('Failed to send Mattermost message:', err.message);
      throw err;
    }
  }

  async onStreamData(channelId, text) {
    const msgData = this.messages[channelId];
    if (!msgData) return;

    const formatted = '```\n' + text.slice(-3900) + '\n```';
    await this.sendPost(channelId, formatted);
  }

  async start() {
    await this.setupHandlers();
  }

  async stop() {
    console.log('Mattermost adapter stopped');
  }
}

module.exports = { MattermostAdapter };
