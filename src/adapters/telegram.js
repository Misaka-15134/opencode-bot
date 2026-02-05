const { Bot, InlineKeyboard } = require('grammy');

class TelegramAdapter {
  constructor(config, core) {
    this.config = config;
    this.core = core;
    this.bot = new Bot(config.token);
    this.messages = {};
    this.setupHandlers();
  }

  setupHandlers() {
    this.bot.command('start', (ctx) => this.handleStart(ctx));
    this.bot.command('menu', (ctx) => this.showMenu(ctx, 'main'));
    this.bot.command('new', (ctx) => this.handleNewSession(ctx));
    
    this.bot.on('callback_query:data', (ctx) => this.handleCallback(ctx));
    this.bot.on('message:text', (ctx) => this.handleMessage(ctx));
  }

  async handleStart(ctx) {
    await ctx.reply('🚀 OpenCode Bot Online\n\nUse /menu to access the control panel.');
  }

  async handleNewSession(ctx) {
    const sessionId = this.core.createSession(ctx.chat.id);
    await ctx.reply(`🆕 New session: \`${sessionId}\``, { parse_mode: 'Markdown' });
  }

  async showMenu(ctx, page, isEdit = false) {
    const keyboard = new InlineKeyboard();
    let text = '';
    const currentModel = this.core.config.opencode.defaultModel?.split('/').pop() || 'default';
    const currentAgent = this.core.config.opencode.defaultAgent || 'none';

    if (page === 'main') {
      text = `*🎮 Control Center*\nModel: \`${currentModel}\`\nAgent: \`${currentAgent}\``;
      keyboard
        .text('🧠 Models', 'nav:models').text('🤖 Agents', 'nav:agents').row()
        .text('💬 Sessions', 'nav:sessions').text('🛠 Tools', 'nav:tools').row()
        .text('📊 Stats', 'cmd:stats');
    } else if (page === 'models') {
      text = '*🧠 Select Model*';
      keyboard
        .text('✨ Flash', 'model:google/antigravity-gemini-3-flash')
        .text('🧠 Pro', 'model:google/antigravity-gemini-3-pro').row()
        .text('🔙 Back', 'nav:main');
    } else if (page === 'agents') {
      const agents = this.core.listAgents();
      text = '*🤖 Select Agent*';
      
      if (agents.length === 0) {
        text += '\n\n⚠️ No agents found. Install oh-my-opencode to use agents.';
        keyboard.text('🔙 Back', 'nav:main');
      } else {
        agents.forEach(agent => {
          keyboard.text(agent.name, `agent:${agent.id}`).row();
        });
        keyboard.text('❌ No Agent', 'agent:null').row()
          .text('🔙 Back', 'nav:main');
      }
    } else if (page === 'sessions') {
      const sessions = this.core.listSessions().slice(0, 5);
      const current = this.core.getSession(ctx.chat.id);
      text = `*💬 Sessions*\nCurrent: \`${current}\``;
      
      keyboard.text('🆕 New', 'act:new').row();
      sessions.forEach(s => {
        const label = s === current ? `✅ ${s.slice(0, 20)}` : s.slice(0, 20);
        keyboard.text(label, `sess:${s}`).row();
      });
      keyboard.text('🔙 Back', 'nav:main');
    } else if (page === 'tools') {
      text = '*🛠 System Tools*';
      keyboard
        .text('🩺 Doctor', 'cmd:doctor')
        .text('📦 Plugins', 'cmd:plugins').row()
        .text('🔑 Auth', 'cmd:auth')
        .text('⚙️ Config', 'cmd:config').row()
        .text('🔙 Back', 'nav:main');
    }

    const options = { reply_markup: keyboard, parse_mode: 'Markdown' };
    if (isEdit) {
      await ctx.editMessageText(text, options).catch(() => {});
    } else {
      await ctx.reply(text, options);
    }
  }

  async handleCallback(ctx) {
    const data = ctx.callbackQuery.data;
    await ctx.answerCallbackQuery().catch(() => {});

    if (data.startsWith('nav:')) {
      await this.showMenu(ctx, data.split(':')[1], true);
    } else if (data.startsWith('model:')) {
      this.core.setModel(data.split(':')[1]);
      await ctx.answerCallbackQuery({ text: 'Model updated' });
      await this.showMenu(ctx, 'main', true);
    } else if (data.startsWith('agent:')) {
      const agent = data.split(':')[1];
      this.core.setAgent(agent === 'null' ? null : agent);
      await ctx.answerCallbackQuery({ text: `Agent: ${agent}` });
      await this.showMenu(ctx, 'main', true);
    } else if (data.startsWith('sess:')) {
      const sessionId = data.split(':')[1];
      this.core.sessionMap[ctx.chat.id] = sessionId;
      await ctx.answerCallbackQuery({ text: 'Session switched' });
      await this.showMenu(ctx, 'sessions', true);
    } else if (data === 'act:new') {
      this.core.createSession(ctx.chat.id);
      await ctx.answerCallbackQuery({ text: 'New session created' });
      await this.showMenu(ctx, 'sessions', true);
    } else if (data.startsWith('cmd:')) {
      const cmd = data.split(':')[1];
      await this.runCommand(ctx, cmd);
    }
  }

  async handleMessage(ctx) {
    const text = ctx.message.text.trim();
    if (text.startsWith('/')) return;

    await ctx.replyWithChatAction('typing');
    
    const msg = await ctx.reply('⏳ Processing...');
    this.messages[ctx.chat.id] = msg;

    await this.core.execute(ctx.chat.id, text, this);
  }

  async runCommand(ctx, command) {
    await ctx.replyWithChatAction('typing');
    const msg = await ctx.reply(`Running ${command}...`);
    
    const { output } = await this.core.runCommand(ctx.chat.id, command, this);
    
    await ctx.api.editMessageText(
      ctx.chat.id, 
      msg.message_id,
      '```\n' + output.slice(0, 3500) + '\n```',
      { parse_mode: 'Markdown' }
    );
  }

  onStreamData(chatId, text) {
    const msg = this.messages[chatId];
    if (!msg) return;
    
    const formatted = '```\n' + text.slice(-3500) + '\n```';
    this.bot.api.editMessageText(chatId, msg.message_id, formatted, { parse_mode: 'Markdown' })
      .catch(() => {});
  }

  async start() {
    await this.bot.api.deleteWebhook({ drop_pending_updates: true });
    this.bot.start();
  }
}

module.exports = { TelegramAdapter };
