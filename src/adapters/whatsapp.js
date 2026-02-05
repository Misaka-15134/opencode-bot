const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

class WhatsAppAdapter {
  constructor(config, core) {
    this.config = config;
    this.core = core;
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: config.sessionName || 'whatsapp-session'
      }),
      puppeteer: {
        headless: config.headless !== false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });
    this.messages = {};
    this.ready = false;
  }

  setupHandlers() {
    this.client.on('qr', (qr) => {
      console.log('📱 WhatsApp QR Code:');
      qrcode.generate(qr, { small: true });
      console.log('Scan this QR code with your WhatsApp app');
    });

    this.client.on('ready', () => {
      console.log('✅ WhatsApp client is ready');
      this.ready = true;
    });

    this.client.on('message_create', async (msg) => {
      if (msg.fromMe) return;
      await this.handleMessage(msg);
    });

    this.client.on('disconnected', (reason) => {
      console.log('❌ WhatsApp disconnected:', reason);
      this.ready = false;
    });
  }

  async handleMessage(msg) {
    const text = msg.body.trim();
    const chatId = msg.from;

    if (text.startsWith('!')) {
      await this.handleCommand(msg, text);
      return;
    }

    const thinkingMsg = await msg.reply('⏳ Processing...');
    this.messages[chatId] = { msg: thinkingMsg };

    await this.core.execute(chatId, text, this);
  }

  async handleCommand(msg, text) {
    const command = text.slice(1).split(' ')[0].toLowerCase();
    
    switch (command) {
      case 'menu':
        await this.showMenu(msg);
        break;
      case 'new':
        const sessionId = this.core.createSession(msg.from);
        await msg.reply(`🆕 New session: \`${sessionId}\``);
        break;
      default:
        await msg.reply('Unknown command. Try: !menu, !new');
    }
  }

  async showMenu(msg) {
    const currentModel = this.core.config.opencode.defaultModel?.split('/').pop() || 'default';
    const currentAgent = this.core.config.opencode.defaultAgent || 'none';

    const menuText = `
🎮 *OpenCode Bot Control Center*

Model: \`${currentModel}\`
Agent: \`${currentAgent}\`

Commands:
• \`!new\` - Create new session
• \`!menu\` - Show this menu

Or just send a message to chat with OpenCode!
    `.trim();

    await msg.reply(menuText);
  }

  onStreamData(chatId, text) {
    const msgData = this.messages[chatId];
    if (!msgData) return;

    const formatted = '```\n' + text.slice(-4000) + '\n```';
    
    msgData.msg.edit(formatted).catch(() => {});
  }

  async start() {
    this.setupHandlers();
    await this.client.initialize();
  }

  async stop() {
    await this.client.destroy();
  }
}

module.exports = { WhatsAppAdapter };
