const { Client, GatewayIntentBits, Partials } = require('discord.js');

class DiscordAdapter {
  constructor(config, core) {
    this.config = config;
    this.core = core;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
      ],
      partials: [Partials.Channel]
    });
    this.messages = {};
  }

  setupHandlers() {
    this.client.on('ready', () => {
      console.log(`✅ Discord bot logged in as ${this.client.user.tag}`);
    });

    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;
      
      const text = message.content.trim();
      if (text.startsWith('!')) {
        await this.handleCommand(message, text);
        return;
      }

      await this.handleMessage(message);
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isButton()) return;
      await this.handleButton(interaction);
    });
  }

  async handleCommand(message, text) {
    const command = text.slice(1).split(' ')[0].toLowerCase();
    
    switch (command) {
      case 'menu':
        await this.showMenu(message.channel);
        break;
      case 'new':
        const sessionId = this.core.createSession(message.channel.id);
        await message.reply(`🆕 New session: \`${sessionId}\``);
        break;
      case 'models':
        await this.showModels(message.channel);
        break;
      case 'agents':
        await this.showAgents(message.channel);
        break;
      default:
        await message.reply('Unknown command. Try: !menu, !new, !models, !agents');
    }
  }

  async handleMessage(message) {
    const channelId = message.channel.id;
    
    const thinkingMsg = await message.reply('⏳ Processing...');
    this.messages[channelId] = { message: thinkingMsg, original: message };

    await this.core.execute(channelId, message.content, this);
  }

  async showMenu(channel) {
    const currentModel = this.core.config.opencode.defaultModel?.split('/').pop() || 'default';
    const currentAgent = this.core.config.opencode.defaultAgent || 'none';

    const menuText = `
🎮 **OpenCode Bot Control Center**

Model: \`${currentModel}\`
Agent: \`${currentAgent}\`

Commands:
• \`!new\` - Create new session
• \`!models\` - Switch model
• \`!agents\` - Switch agent
• \`!menu\` - Show this menu

Or just send a message to chat with OpenCode!
    `.trim();

    await channel.send(menuText);
  }

  async showModels(channel) {
    const models = [
      { id: 'google/antigravity-gemini-3-flash', name: '✨ Gemini Flash' },
      { id: 'google/antigravity-gemini-3-pro', name: '🧠 Gemini Pro' },
      { id: 'anthropic/claude-sonnet-4-20250506', name: '🟣 Claude 3.5 Sonnet' },
      { id: 'anthropic/claude-opus-4-20250506', name: '🟣 Claude 4 Opus' },
      { id: 'deepseek/deepseek-chat', name: '🔵 DeepSeek V3' },
      { id: 'deepseek/deepseek-reasoner', name: '🔵 DeepSeek R1' },
      { id: 'kimi-coding/k2p5', name: '🌙 Kimi K2.5' },
      { id: 'qwen/qwen-plus', name: '🌸 Qwen Plus' },
      { id: 'qwen/qwen-max', name: '🚀 Qwen Max' },
      { id: 'glm-4', name: '📊 GLM-4' },
      { id: 'glm-4v', name: '🖼️ GLM-4V' },
      { id: 'minimax/abab6.5s-chat', name: '⚡ MiniMax' }
    ];

    let text = '🧠 **Select Model**\n\n';
    models.forEach((m, i) => {
      text += `${i + 1}. ${m.name}\n`;
    });
    text += '\nReply with the number to switch.';

    const msg = await channel.send(text);
    
    const filter = m => !isNaN(m.content) && m.content >= 1 && m.content <= models.length;
    const collector = channel.createMessageCollector({ filter, max: 1, time: 60000 });

    collector.on('collect', async (m) => {
      const idx = parseInt(m.content) - 1;
      const model = models[idx];
      this.core.setModel(model.id);
      await channel.send(`✅ Model switched to: ${model.name}`);
    });
  }

  async showAgents(channel) {
    const agents = this.core.listAgents();
    
    if (agents.length === 0) {
      await channel.send('⚠️ No agents found.');
      return;
    }

    let text = '🤖 **Select Agent**\n\n';
    agents.forEach((a, i) => {
      text += `${i + 1}. **${a.name}** - ${a.description}\n`;
    });
    text += '\nReply with the number to switch, or "none" to disable.';

    await channel.send(text);
  }

  async handleButton(interaction) {
    await interaction.deferUpdate();
  }

  onStreamData(channelId, text, final = false) {
    const msgData = this.messages[channelId];
    if (!msgData) return;

    const content = final ? text : text + '\n\n⏳ Processing...';
    const formatted = '```\n' + content.slice(0, 1900) + '\n```';
    
    msgData.message.edit(formatted).catch(() => {});
  }

  async start() {
    this.setupHandlers();
    await this.client.login(this.config.token);
  }

  async stop() {
    await this.client.destroy();
  }
}

module.exports = { DiscordAdapter };
