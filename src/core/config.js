const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_DIR = path.join(os.homedir(), '.config/opencode-bot');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

class ConfigManager {
  static load() {
    if (!fs.existsSync(CONFIG_FILE)) {
      return this.createDefault();
    }
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  }

  static createDefault() {
    const defaultConfig = {
      platforms: [
        {
          type: 'telegram',
          enabled: false,
          token: '',
          allowedUsers: []
        }
      ],
      opencode: {
        path: 'opencode',
        defaultModel: 'google/antigravity-gemini-3-flash',
        defaultAgent: null
      },
      agents: {
        sisyphus: { name: 'Sisyphus', description: 'Task executor', enabled: true },
        hephaestus: { name: 'Hephaestus', description: 'Code crafter', enabled: true },
        prometheus: { name: 'Prometheus', description: 'Planner', enabled: true },
        oracle: { name: 'Oracle', description: 'Consultant', enabled: true }
      }
    };
    
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }

  static save(config) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  }

  static getOpencodePath() {
    const paths = [
      path.join(os.homedir(), '.opencode/bin/opencode'),
      '/usr/local/bin/opencode',
      '/usr/bin/opencode'
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
    return 'opencode';
  }
}

module.exports = { ConfigManager, CONFIG_DIR, CONFIG_FILE };
