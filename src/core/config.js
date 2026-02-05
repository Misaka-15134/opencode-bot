const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_DIR = path.join(os.homedir(), '.config/opencode-bot');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const SUPPORTED_PLATFORMS = {
  telegram: {
    name: 'Telegram',
    icon: '📱',
    description: 'Popular messaging app with bot API',
    requiredFields: ['token'],
    optionalFields: ['allowedUsers', 'allowedGroups']
  },
  discord: {
    name: 'Discord',
    icon: '🎮',
    description: 'Gaming and community platform',
    requiredFields: ['token'],
    optionalFields: ['guildId', 'allowedChannels']
  },
  slack: {
    name: 'Slack',
    icon: '💼',
    description: 'Business messaging platform',
    requiredFields: ['token', 'signingSecret'],
    optionalFields: ['appToken', 'socketMode']
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: '💬',
    description: 'Popular messaging via WhatsApp Web',
    requiredFields: ['sessionName'],
    optionalFields: ['headless', 'qrTimeout']
  },
  signal: {
    name: 'Signal',
    icon: '🔒',
    description: 'Privacy-focused messaging',
    requiredFields: ['phoneNumber', 'signalCliPath'],
    optionalFields: []
  },
  matrix: {
    name: 'Matrix',
    icon: '🔷',
    description: 'Decentralized chat protocol',
    requiredFields: ['homeserver', 'userId', 'accessToken'],
    optionalFields: ['deviceId']
  },
  mattermost: {
    name: 'Mattermost',
    icon: '📋',
    description: 'Open source Slack alternative',
    requiredFields: ['url', 'token'],
    optionalFields: ['team', 'channel']
  },
  googlechat: {
    name: 'Google Chat',
    icon: '💬',
    description: 'Google Workspace messaging',
    requiredFields: ['serviceAccountKey', 'spaceId'],
    optionalFields: []
  },
  msteams: {
    name: 'Microsoft Teams',
    icon: '🔷',
    description: 'Microsoft 365 messaging',
    requiredFields: ['appId', 'appPassword'],
    optionalFields: ['tenantId']
  },
  line: {
    name: 'LINE',
    icon: '📱',
    description: 'Popular in Japan and Asia',
    requiredFields: ['channelAccessToken', 'channelSecret'],
    optionalFields: []
  },
  zalo: {
    name: 'Zalo',
    icon: '💬',
    description: 'Popular in Vietnam',
    requiredFields: ['oaId', 'oaSecret'],
    optionalFields: []
  },
  imessage: {
    name: 'iMessage',
    icon: '💬',
    description: 'Apple messaging (macOS only)',
    requiredFields: ['appleId'],
    optionalFields: ['password']
  },
  bluebubbles: {
    name: 'BlueBubbles',
    icon: '🔵',
    description: 'iMessage bridge for non-Apple devices',
    requiredFields: ['serverUrl', 'password'],
    optionalFields: []
  },
  nextcloud: {
    name: 'Nextcloud Talk',
    icon: '☁️',
    description: 'Self-hosted video and chat',
    requiredFields: ['serverUrl', 'username', 'token'],
    optionalFields: ['roomToken']
  },
  nostr: {
    name: 'Nostr',
    icon: '⚡',
    description: 'Decentralized social protocol',
    requiredFields: ['privateKey'],
    optionalFields: ['relays']
  },
  twitch: {
    name: 'Twitch',
    icon: '📺',
    description: 'Live streaming chat',
    requiredFields: ['clientId', 'clientSecret', 'channel'],
    optionalFields: []
  },
  tlon: {
    name: 'Tlon',
    icon: '🌐',
    description: 'Urbit-based messaging',
    requiredFields: ['ship', 'code'],
    optionalFields: []
  }
};

class ConfigManager {
  static load() {
    if (!fs.existsSync(CONFIG_FILE)) {
      return this.createDefault();
    }
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  }

  static createDefault() {
    const defaultConfig = {
      platforms: [],
      opencode: {
        path: 'opencode',
        defaultModel: 'google/antigravity-gemini-3-flash',
        defaultAgent: null
      },
      agents: {
        sisyphus: { name: 'Sisyphus', description: 'Task executor', enabled: true },
        hephaestus: { name: 'Hephaestus', description: 'Code crafter', enabled: true },
        prometheus: { name: 'Prometheus', description: 'Planner', enabled: true },
        oracle: { name: 'Oracle', description: 'Consultant', enabled: true },
        metis: { name: 'Metis', description: 'Pre-planning consultant', enabled: true },
        momus: { name: 'Momus', description: 'Quality reviewer', enabled: true }
      },
      features: {
        autoSave: true,
        streamOutput: true,
        typingIndicator: true,
        maxOutputLength: 3500
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

  static getSupportedPlatforms() {
    return SUPPORTED_PLATFORMS;
  }

  static addPlatform(config, platformType, settings) {
    const platformDef = SUPPORTED_PLATFORMS[platformType];
    if (!platformDef) throw new Error(`Unknown platform: ${platformType}`);
    
    for (const field of platformDef.requiredFields) {
      if (!settings[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    config.platforms = config.platforms.filter(p => p.type !== platformType);
    
    config.platforms.push({
      type: platformType,
      enabled: true,
      ...settings
    });
    
    ConfigManager.save(config);
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

module.exports = { ConfigManager, SUPPORTED_PLATFORMS, CONFIG_DIR, CONFIG_FILE };
