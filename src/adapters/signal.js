const axios = require('axios');

class SignalAdapter {
  constructor(config, core) {
    this.config = config;
    this.core = core;
    this.phoneNumber = config.phoneNumber;
    this.signalCliPath = config.signalCliPath || 'signal-cli';
    this.httpUrl = config.httpUrl || `http://${config.httpHost || 'localhost'}:${config.httpPort || 8080}`;
    this.messages = {};
  }

  async setupHandlers() {
    console.log('📱 Signal adapter initialized');
    console.log(`Phone: ${this.phoneNumber}`);
    console.log(`HTTP API: ${this.httpUrl}`);
    
    await this.checkConnection();
    this.startPolling();
  }

  async checkConnection() {
    try {
      const response = await axios.get(`${this.httpUrl}/v1/accounts`, {
        timeout: 5000
      });
      console.log('✅ Signal HTTP API connected');
      return true;
    } catch (err) {
      console.warn('⚠️  Signal HTTP API not available:', err.message);
      console.log('Make sure signal-cli is running with --http-mode');
      return false;
    }
  }

  startPolling() {
    setInterval(async () => {
      try {
        const response = await axios.get(`${this.httpUrl}/v1/receive/${this.phoneNumber}`, {
          timeout: 10000
        });
        
        if (response.data && Array.isArray(response.data)) {
          for (const envelope of response.data) {
            await this.handleEnvelope(envelope);
          }
        }
      } catch (err) {
        if (err.code !== 'ECONNABORTED') {
          console.error('Signal polling error:', err.message);
        }
      }
    }, 3000);
  }

  async handleEnvelope(envelope) {
    if (!envelope.dataMessage) return;
    
    const msg = envelope.dataMessage;
    const sender = envelope.source;
    const text = msg.message?.trim();
    
    if (!text) return;

    if (text.startsWith('!')) {
      await this.handleCommand(sender, text, msg);
      return;
    }

    await this.handleMessage(sender, text, msg);
  }

  async handleMessage(sender, text, msg) {
    const thinkingMsg = await this.sendMessage(sender, '⏳ Processing...');
    this.messages[sender] = { timestamp: thinkingMsg.timestamp };

    await this.core.execute(sender, text, this);
  }

  async handleCommand(sender, text, msg) {
    const command = text.slice(1).split(' ')[0].toLowerCase();
    
    switch (command) {
      case 'menu':
        await this.showMenu(sender);
        break;
      case 'new':
        const sessionId = this.core.createSession(sender);
        await this.sendMessage(sender, `🆕 New session: \`${sessionId}\``);
        break;
      default:
        await this.sendMessage(sender, 'Unknown command. Try: !menu, !new');
    }
  }

  async showMenu(sender) {
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

    await this.sendMessage(sender, menuText);
  }

  async sendMessage(recipient, text) {
    try {
      const response = await axios.post(`${this.httpUrl}/v2/send`, {
        number: this.phoneNumber,
        recipients: [recipient],
        message: text
      }, {
        timeout: 30000
      });
      return response.data;
    } catch (err) {
      console.error('Failed to send Signal message:', err.message);
      throw err;
    }
  }

  async onStreamData(sender, text) {
    const msgData = this.messages[sender];
    if (!msgData) return;

    const formatted = text.slice(-3900);
    await this.sendMessage(sender, formatted);
  }

  async start() {
    await this.setupHandlers();
  }

  async stop() {
    console.log('Signal adapter stopped');
  }
}

module.exports = { SignalAdapter };
