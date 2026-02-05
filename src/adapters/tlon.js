const axios = require('axios');

class TlonAdapter {
  constructor(config, core) {
    this.config = config;
    this.core = core;
    this.ship = config.ship;
    this.code = config.code;
    this.url = config.url || `http://localhost:8080`;
    this.messages = {};
  }

  async setupHandlers() {
    console.log('🌐 Tlon/Urbit adapter initialized');
    console.log(`Ship: ${this.ship}`);
    
    await this.authenticate();
    this.startPolling();
  }

  async authenticate() {
    try {
      const response = await axios.post(`${this.url}/~/login`, {
        password: this.code
      }, {
        timeout: 10000
      });
      
      this.cookie = response.headers['set-cookie'];
      console.log('✅ Urbit authenticated');
      return true;
    } catch (err) {
      console.error('❌ Urbit authentication failed:', err.message);
      return false;
    }
  }

  startPolling() {
    console.log('⚠️  Tlon chat polling requires Urbit API integration');
    console.log('This is a placeholder implementation');
  }

  async sendMessage(ship, text) {
    if (!this.cookie) {
      throw new Error('Not authenticated');
    }

    try {
      await axios.post(`${this.url}/~/channel/${Date.now()}`, [
        {
          id: Date.now(),
          action: 'poke',
          ship: this.ship,
          app: 'chat-cli',
          mark: 'chat-action',
          json: {
            message: {
              path: '/~zod/chat',
              envelope: {
                uid: `${Date.now()}`,
                number: 1,
                author: this.ship,
                when: Date.now(),
                content: [{ text: text.slice(0, 2000) }]
              }
            }
          }
        }
      ], {
        headers: { 'Cookie': this.cookie },
        timeout: 30000
      });
    } catch (err) {
      console.error('Failed to send Urbit message:', err.message);
      throw err;
    }
  }

  async onStreamData(ship, text) {
    await this.sendMessage(ship, text.slice(0, 2000));
  }

  async start() {
    await this.setupHandlers();
    console.log('✅ Tlon adapter started (limited functionality)');
  }

  async stop() {
    console.log('Tlon adapter stopped');
  }
}

module.exports = { TlonAdapter };
