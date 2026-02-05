const axios = require('axios');

class TwitchAdapter {
  constructor(config, core) {
    this.config = config;
    this.core = core;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.channel = config.channel;
    this.accessToken = null;
    this.messages = {};
  }

  async setupHandlers() {
    console.log('📺 Twitch adapter initialized');
    console.log(`Channel: ${this.channel}`);
    
    await this.authenticate();
    this.startPolling();
  }

  async authenticate() {
    try {
      const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
          scope: 'chat:read chat:edit'
        },
        timeout: 10000
      });
      
      this.accessToken = response.data.access_token;
      console.log('✅ Twitch authenticated');
      return true;
    } catch (err) {
      console.error('❌ Twitch authentication failed:', err.message);
      return false;
    }
  }

  startPolling() {
    console.log('⚠️  Twitch chat polling not implemented in this version');
    console.log('Use IRC connection for full Twitch chat support');
  }

  async sendMessage(message) {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      await axios.post(`https://api.twitch.tv/helix/chat/messages`, {
        broadcaster_id: this.channel,
        sender_id: this.channel,
        message: message.slice(0, 500)
      }, {
        headers: {
          'Client-Id': this.clientId,
          'Authorization': `Bearer ${this.accessToken}`
        },
        timeout: 30000
      });
    } catch (err) {
      console.error('Failed to send Twitch message:', err.message);
      throw err;
    }
  }

  async onStreamData(channelId, text) {
    await this.sendMessage(text.slice(0, 500));
  }

  async start() {
    await this.setupHandlers();
  }

  async stop() {
    console.log('Twitch adapter stopped');
  }
}

module.exports = { TwitchAdapter };
