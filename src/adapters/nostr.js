const { SimplePool, getPublicKey, nip04 } = require('nostr-tools');

class NostrAdapter {
  constructor(config, core) {
    this.config = config;
    this.core = core;
    this.privateKey = config.privateKey;
    this.relays = config.relays || ['wss://relay.damus.io', 'wss://relay.nostr.band'];
    this.pool = new SimplePool();
    this.messages = {};
    
    try {
      this.publicKey = getPublicKey(this.privateKey);
    } catch (err) {
      console.error('Invalid Nostr private key');
    }
  }

  async setupHandlers() {
    console.log('⚡ Nostr adapter initialized');
    console.log(`Public Key: ${this.publicKey?.slice(0, 16)}...`);
    
    this.subscribeToEvents();
  }

  subscribeToEvents() {
    const sub = this.pool.sub(this.relays, [
      {
        kinds: [4],
        '#p': [this.publicKey],
        since: Math.floor(Date.now() / 1000)
      }
    ]);

    sub.on('event', async (event) => {
      try {
        const plaintext = await nip04.decrypt(this.privateKey, event.pubkey, event.content);
        await this.handleMessage(event.pubkey, plaintext);
      } catch (err) {
        console.error('Failed to decrypt Nostr message:', err.message);
      }
    });
  }

  async handleMessage(pubkey, text) {
    if (text.startsWith('!')) {
      await this.handleCommand(pubkey, text);
      return;
    }

    await this.sendDirectMessage(pubkey, '⏳ Processing...');
    this.messages[pubkey] = { pubkey };

    await this.core.execute(pubkey, text, this);
  }

  async handleCommand(pubkey, text) {
    const command = text.slice(1).split(' ')[0].toLowerCase();
    
    switch (command) {
      case 'menu':
        await this.showMenu(pubkey);
        break;
      case 'new':
        const sessionId = this.core.createSession(pubkey);
        await this.sendDirectMessage(pubkey, `🆕 New session: ${sessionId}`);
        break;
      default:
        await this.sendDirectMessage(pubkey, 'Unknown command. Try: !menu, !new');
    }
  }

  async showMenu(pubkey) {
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

    await this.sendDirectMessage(pubkey, menuText);
  }

  async sendDirectMessage(pubkey, text) {
    try {
      const ciphertext = await nip04.encrypt(this.privateKey, pubkey, text.slice(0, 4000));
      
      const event = {
        kind: 4,
        created_at: Math.floor(Date.now() / 1000),
        tags: [['p', pubkey]],
        content: ciphertext,
        pubkey: this.publicKey
      };
      
      await this.pool.publish(this.relays, event);
    } catch (err) {
      console.error('Failed to send Nostr message:', err.message);
      throw err;
    }
  }

  async onStreamData(pubkey, text) {
    const msgData = this.messages[pubkey];
    if (!msgData) return;

    await this.sendDirectMessage(pubkey, text.slice(0, 4000));
  }

  async start() {
    await this.setupHandlers();
    console.log('✅ Nostr adapter started');
  }

  async stop() {
    this.pool.close(this.relays);
    console.log('Nostr adapter stopped');
  }
}

module.exports = { NostrAdapter };
