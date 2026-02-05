const axios = require('axios');

class NextcloudAdapter {
  constructor(config, core) {
    this.config = config;
    this.core = core;
    this.serverUrl = config.serverUrl;
    this.username = config.username;
    this.token = config.token;
    this.messages = {};
  }

  async setupHandlers() {
    console.log('☁️ Nextcloud Talk adapter initialized');
    console.log(`Server: ${this.serverUrl}`);
    
    await this.checkConnection();
    this.startPolling();
  }

  async checkConnection() {
    try {
      const response = await axios.get(`${this.serverUrl}/ocs/v2.php/cloud/user`, {
        headers: {
          'OCS-APIRequest': 'true',
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.token}`).toString('base64')}`
        },
        timeout: 5000
      });
      console.log(`✅ Nextcloud connected as ${response.data.ocs?.data?.displayname}`);
      return true;
    } catch (err) {
      console.error('❌ Nextcloud connection failed:', err.message);
      return false;
    }
  }

  startPolling() {
    setInterval(async () => {
      try {
        const response = await axios.get(`${this.serverUrl}/ocs/v2.php/apps/spreed/api/v1/chat`, {
          headers: {
            'OCS-APIRequest': 'true',
            'Authorization': `Basic ${Buffer.from(`${this.username}:${this.token}`).toString('base64')}`
          },
          timeout: 10000
        });
        
        console.log('Nextcloud polling not fully implemented');
      } catch (err) {
        if (err.code !== 'ECONNABORTED') {
          console.error('Nextcloud polling error:', err.message);
        }
      }
    }, 5000);
  }

  async sendMessage(token, text) {
    try {
      await axios.post(`${this.serverUrl}/ocs/v2.php/apps/spreed/api/v1/chat/${token}`, {
        message: text.slice(0, 4000)
      }, {
        headers: {
          'OCS-APIRequest': 'true',
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.token}`).toString('base64')}`
        },
        timeout: 30000
      });
    } catch (err) {
      console.error('Failed to send Nextcloud message:', err.message);
      throw err;
    }
  }

  async onStreamData(token, text) {
    await this.sendMessage(token, text.slice(0, 4000));
  }

  async start() {
    await this.setupHandlers();
    console.log('✅ Nextcloud Talk adapter started (polling mode)');
  }

  async stop() {
    console.log('Nextcloud Talk adapter stopped');
  }
}

module.exports = { NextcloudAdapter };
