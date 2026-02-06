const pty = require('@lydell/node-pty');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const { ConfigManager } = require('./config');

const SESSION_DIR = path.join(os.homedir(), '.local/share/opencode/storage/session/global');
const SESSION_MAP_PATH = path.join(os.homedir(), '.config/opencode-bot/session-map.json');

class BridgeCore {
  constructor(config) {
    this.config = config;
    this.opencodePath = ConfigManager.getOpencodePath();
    this.sessionMap = this._loadSessionMap();
    this.activeProcesses = new Map();
  }

  _loadSessionMap() {
    try {
      if (fs.existsSync(SESSION_MAP_PATH)) {
        return JSON.parse(fs.readFileSync(SESSION_MAP_PATH, 'utf8'));
      }
    } catch (e) {
      console.error('Failed to load session map:', e.message);
    }
    return {};
  }

  _saveSessionMap() {
    try {
      fs.mkdirSync(path.dirname(SESSION_MAP_PATH), { recursive: true });
      fs.writeFileSync(SESSION_MAP_PATH, JSON.stringify(this.sessionMap, null, 2));
    } catch (e) {
      console.error('Failed to save session map:', e.message);
    }
  }

  stopProcess(chatId) {
    const proc = this.activeProcesses.get(chatId);
    if (proc) {
      proc.kill();
      this.activeProcesses.delete(chatId);
      return true;
    }
    return false;
  }

  setModel(model) {
    this.config.opencode.defaultModel = model;
    ConfigManager.save(this.config);
  }

  setAgent(agent) {
    this.config.opencode.defaultAgent = agent;
    ConfigManager.save(this.config);
  }

  listAgents() {
    return Object.entries(this.config.agents)
      .filter(([_, info]) => info.enabled)
      .map(([id, info]) => ({ id, ...info }));
  }

  createSession(chatId) {
    const randomId = `ses_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
    this.sessionMap[chatId] = randomId;
    this._saveSessionMap();
    
    const sessionFile = path.join(SESSION_DIR, `${randomId}.json`);
    const now = Date.now();
    const emptySession = {
      id: randomId,
      slug: `bot-${Date.now()}`,
      title: "New Session",
      projectID: "global",
      directory: process.cwd(),
      time: { created: now, updated: now },
      messages: []
    };
    
    fs.mkdirSync(SESSION_DIR, { recursive: true });
    fs.writeFileSync(sessionFile, JSON.stringify(emptySession));
    return randomId;
  }

  getSession(chatId) {
    return this.sessionMap[chatId] || `ses_tg_${String(chatId).replace(/[^a-zA-Z0-9]/g, "")}`;
  }

  listSessions() {
    try {
      return fs.readdirSync(SESSION_DIR)
        .filter(f => f.startsWith('ses_') && f.endsWith('.json'))
        .map(f => f.replace('.json', ''))
        .sort((a, b) => {
          const statA = fs.statSync(path.join(SESSION_DIR, `${a}.json`));
          const statB = fs.statSync(path.join(SESSION_DIR, `${b}.json`));
          return statB.mtimeMs - statA.mtimeMs;
        });
    } catch (e) { return []; }
  }

  async execute(chatId, prompt, adapter, options = {}) {
    const sessionId = options.sessionId || this.getSession(chatId);
    const sessionFile = path.join(SESSION_DIR, `${sessionId}.json`);
    
    let args = ['run', prompt];
    
    if (options.model || this.config.opencode.defaultModel) {
      args.push('--model', options.model || this.config.opencode.defaultModel);
    }
    
    if (options.agent || this.config.opencode.defaultAgent) {
      args.push('--agent', options.agent || this.config.opencode.defaultAgent);
    }

    if (fs.existsSync(sessionFile)) {
      args.push('--session', sessionId);
    } else if (options.createIfMissing !== false) {
      this.createSession(chatId);
      args.push('--session', sessionId);
    }

    return this._spawn(chatId, args, adapter);
  }

  async runCommand(chatId, command, adapter) {
    return this._spawn(chatId, [command], adapter);
  }

  _spawn(chatId, args, adapter) {
    return new Promise((resolve) => {
      this.stopProcess(chatId);

      const ptyProcess = pty.spawn(this.opencodePath, args, {
        name: 'xterm-color',
        cols: 48,
        rows: 30,
        cwd: process.cwd(),
        env: { ...process.env, FORCE_COLOR: '0', TERM: 'xterm' }
      });

      this.activeProcesses.set(chatId, ptyProcess);

      let output = '';
      
      ptyProcess.onData((data) => {
        output += data;
        adapter.onStreamData && adapter.onStreamData(chatId, this._format(output));
      });

      ptyProcess.onExit(({ exitCode }) => {
        this.activeProcesses.delete(chatId);
        resolve({ output, exitCode });
      });

      setTimeout(() => {
        if (this.activeProcesses.get(chatId) === ptyProcess) {
          ptyProcess.kill();
        }
      }, 600000);
    });
  }

  _format(text) {
    return text
      .replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-z]/g, '')
      .replace(/\r/g, '')
      .replace(/INFO/g, 'ℹ️')
      .replace(/WARN/g, '⚠️')
      .replace(/ERROR/g, '❌');
  }
}

module.exports = { BridgeCore };
