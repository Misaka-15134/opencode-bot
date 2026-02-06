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
    this.bot.command('stop', async (ctx) => {
      if (this.core.stopProcess(ctx.chat.id)) {
        await ctx.reply('🛑 <b>Process Terminated</b>', { parse_mode: 'HTML' });
      } else {
        await ctx.reply('⚠️ No active process to stop.');
      }
    });
    
    this.bot.on('callback_query:data', (ctx) => this.handleCallback(ctx));
    this.bot.on('message:text', (ctx) => this.handleMessage(ctx));
  }

  async handleStart(ctx) {
    await ctx.reply('🚀 <b>OpenCode Bot Online</b>\n\nUse /menu to access the control panel.', { parse_mode: 'HTML' });
  }

  async handleNewSession(ctx) {
    const sessionId = this.core.createSession(ctx.chat.id);
    await ctx.reply(`🆕 <b>New session:</b> \u003ccode\u003e${sessionId}\u003c/code\u003e`, { parse_mode: 'HTML' });
  }

  async showMenu(ctx, page, isEdit = false) {
    const keyboard = new InlineKeyboard();
    const settings = this.core.getSettings(ctx.chat.id);
    const currentModel = this.core.config.opencode.defaultModel?.split('/').pop() || 'default';
    const currentAgent = this.core.config.opencode.defaultAgent || 'none';
    const session = this.core.getSession(ctx.chat.id);
    let text = '';

    if (page === 'main') {
      text = `🎮 <b>OpenCode Control</b>\n\nSession: \u003ccode\u003e${session}\u003c/code\u003e\nModel: \u003ccode\u003e${currentModel}\u003c/code\u003e\nAgent: \u003ccode\u003e${currentAgent}\u003c/code\u003e\nThinking: \u003ccode\u003e${settings.thinkingMode ? 'Shown' : 'Hidden'}\u003c/code\u003e`;
      keyboard
        .text('🧠 Models', 'nav:models').text('🤖 Agents', 'nav:agents').row()
        .text('💬 Sessions', 'nav:sessions').text('🛠 Tools', 'nav:tools').row()
        .text(settings.thinkingMode ? '🙈 Hide Thinking' : '👁 Show Thinking', 'toggle:thinking').row()
        .text('📊 Stats', 'cmd:stats').text('⏹ Stop', 'cmd:stop');
    } else if (page === 'models') {
      text = '🧠 <b>Select Model</b>';
      keyboard
        .text('✨ Flash', 'model:google/antigravity-gemini-3-flash')
        .text('🧠 Pro', 'model:google/antigravity-gemini-3-pro').row()
        .text('🟣 Claude 3.5', 'model:anthropic/claude-sonnet-4-20250506')
        .text('🟣 Claude 4', 'model:anthropic/claude-opus-4-20250506').row()
        .text('🔵 DeepSeek', 'model:deepseek/deepseek-chat').row()
        .text('🔙 Back', 'nav:main');
    } else if (page === 'agents') {
      const agents = this.core.listAgents();
      text = '🤖 <b>Select Agent</b>';
      
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
      text = '💬 <b>Sessions</b>';
      
      keyboard.text('🆕 New Session', 'act:new').row();
      sessions.forEach(s => {
        const label = s === current ? `✅ ${s.slice(0, 20)}` : s.slice(0, 20);
        keyboard.text(label, `sess:${s}`).row();
      });
      keyboard.text('🔙 Back', 'nav:main');
    } else if (page === 'tools') {
      text = '🛠 <b>System Tools</b>';
      keyboard
        .text('🩺 Doctor', 'cmd:doctor')
        .text('📦 Plugins', 'cmd:plugins').row()
        .text('🔑 Auth', 'cmd:auth')
        .text('⚙️ Config', 'cmd:config').row()
        .text('🔙 Back', 'nav:main');
    }

    if (isEdit) {
      await ctx.editMessageText(text, { reply_markup: keyboard, parse_mode: 'HTML' }).catch(() => {});
    } else {
      await ctx.reply(text, { reply_markup: keyboard, parse_mode: 'HTML' });
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
      this.core._saveSessionMap();
      await ctx.answerCallbackQuery({ text: 'Session switched' });
      await this.showMenu(ctx, 'sessions', true);
    } else if (data === 'act:new') {
      this.core.createSession(ctx.chat.id);
      await ctx.answerCallbackQuery({ text: 'New session created' });
      await this.showMenu(ctx, 'sessions', true);
    } else if (data === 'toggle:thinking') {
      const mode = this.core.toggleThinking(ctx.chat.id);
      await ctx.answerCallbackQuery({ text: `Thinking: ${mode ? 'ON' : 'OFF'}` });
      await this.showMenu(ctx, 'main', true);
    } else if (data.startsWith('cmd:')) {
      const cmd = data.split(':')[1];
      if (cmd === 'stop') {
        if (this.core.stopProcess(ctx.chat.id)) {
          await ctx.reply('🛑 <b>Process Terminated</b>', { parse_mode: 'HTML' });
        } else {
          await ctx.reply('⚠️ No active process to stop.');
        }
      } else {
        await this.runCommand(ctx, cmd);
      }
    }
  }

  async handleMessage(ctx) {
    const text = ctx.message.text.trim();
    if (text.startsWith('/')) {
      const cmd = text.substring(1);
      const knownCommands = ['start', 'menu', 'new', 'stop'];
      if (knownCommands.includes(cmd.split(' ')[0])) return;
      
      ctx.replyWithChatAction('typing').catch(() => {});
      return this.core.runCommand(ctx.chat.id, cmd, this);
    }

    await ctx.replyWithChatAction('typing');
    
    const msg = await ctx.reply('⏳ <i>Initializing...</i>', { parse_mode: 'HTML' });
    this.messages[ctx.chat.id] = { message_id: msg.message_id, chat_id: ctx.chat.id };

    await this.core.execute(ctx.chat.id, text, this);
  }

  async runCommand(ctx, command) {
    await ctx.replyWithChatAction('typing');
    const msg = await ctx.reply(`Running ${command}...`);
    this.messages[ctx.chat.id] = { message_id: msg.message_id, chat_id: ctx.chat.id };
    
    await this.core.runCommand(ctx.chat.id, command, this);
  }

  onStreamData(chatId, text, final = false) {
    const msg = this.messages[chatId];
    if (!msg) return;
    
    const content = final ? text : text + '\n\n▌';
    this.bot.api.editMessageText(
      msg.chat_id, 
      msg.message_id,
      `\u003cpre\u003e${content}\u003c/pre\u003e`,
      { parse_mode: 'HTML' }
    ).catch((e) => {
      if (e.description?.includes('too long')) {
        this.bot.api.editMessageText(
          msg.chat_id,
          msg.message_id,
          `\u003cpre\u003e...Output too long, showing end...\n\n${content.slice(-3000)}\u003c/pre\u003e`,
          { parse_mode: 'HTML' }
        ).catch(() => {});
      }
    });
  }

  async start() {
    await this.bot.api.deleteWebhook({ drop_pending_updates: true });
    this.bot.start();
    console.log('Telegram Bridge OS v18 Online.');
  }
}

module.exports = { TelegramAdapter };
