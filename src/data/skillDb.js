// Skill database for meta support servants
// Each skill has effects that map to buffKeys used in the buff system
// duration = number of turns the buff lasts (3 = this turn + 2 more)
// npCharge = flat NP% granted to target (party = split among party members)

export const SKILL_DB = {
  // Artoria Caster (Alter Ego) — ID 504600
  504600: {
    name: '阿尔托莉雅·卡斯特',
    skills: [
      {
        id: 'castoria_s1',
        name: '希望的魅力 B',
        effects: [
          { buffKey: 'atkUp', value: 20, duration: 3 },
          { buffKey: 'npRate', value: 30, duration: 3 }
        ],
        npCharge: 0,
        cooldown: 7,
      },
      {
        id: 'castoria_s2',
        name: '湖之加护 A',
        effects: [
          { buffKey: 'npStrength', value: 20, duration: 3 },
        ],
        npCharge: 20,
        cooldown: 7,
      },
      {
        id: 'castoria_s3',
        name: '选定之剑 EX',
        effects: [
          { buffKey: 'artsUp', value: 50, duration: 3 },
        ],
        npCharge: 0,
        cooldown: 7,
      },
    ],
  },

  // Koyanskaya of Light (Assassin) — ID 704600
  704600: {
    name: '光之高扬斯卡娅',
    skills: [
      {
        id: 'koyan_s1',
        name: '杀戮技巧（人）A',
        effects: [
          { buffKey: 'busterUp', value: 50, duration: 3 },
        ],
        npCharge: 0,
        cooldown: 7,
      },
      {
        id: 'koyan_s2',
        name: '支配之缝 A',
        effects: [],
        npCharge: 50,
        cooldown: 8,
      },
      {
        id: 'koyan_s3',
        name: '军略（兽）A',
        effects: [
          { buffKey: 'busterUp', value: 50, duration: 1 },
          { buffKey: 'npStrength', value: 30, duration: 1 },
        ],
        npCharge: 0,
        cooldown: 7,
      },
    ],
  },

  // Scathach-Skadi (Caster) — ID 202600
  202600: {
    name: '斯卡哈·斯卡蒂',
    skills: [
      {
        id: 'skadi_s1',
        name: '原初之卢恩',
        effects: [
          { buffKey: 'quickUp', value: 50, duration: 3 },
        ],
        npCharge: 0,
        cooldown: 8,
      },
      {
        id: 'skadi_s2',
        name: '冰之睿智 B',
        effects: [
          { buffKey: 'defDown', value: 30, duration: 3 },
        ],
        npCharge: 0,
        cooldown: 7,
      },
      {
        id: 'skadi_s3',
        name: '大神睿智 B+',
        effects: [
          { buffKey: 'quickUp', value: 50, duration: 3 },
          { buffKey: 'critDmg', value: 100, duration: 3 },
        ],
        npCharge: 50,
        cooldown: 7,
      },
    ],
  },

  // Scathach-Skadi (Ruler) — ID 204900
  204900: {
    name: '斯卡哈·斯卡蒂（裁定者）',
    skills: [
      {
        id: 'rskadi_s1',
        name: '冬之睿智 B+',
        effects: [
          { buffKey: 'quickUp', value: 30, duration: 3 },
          { buffKey: 'busterUp', value: 30, duration: 3 },
          { buffKey: 'artsUp', value: 30, duration: 3 },
        ],
        npCharge: 0,
        cooldown: 8,
      },
      {
        id: 'rskadi_s2',
        name: '夏之睿智 B+',
        effects: [
          { buffKey: 'atkUp', value: 20, duration: 3 },
          { buffKey: 'critDmg', value: 50, duration: 3 },
        ],
        npCharge: 0,
        cooldown: 7,
      },
      {
        id: 'rskadi_s3',
        name: '女神之微笑 A+',
        effects: [
          { buffKey: 'quickUp', value: 50, duration: 3 },
        ],
        npCharge: 50,
        cooldown: 7,
      },
    ],
  },

  // Oberon (Pretender) — ID 704800
  704800: {
    name: '奥伯龙',
    skills: [
      {
        id: 'oberon_s1',
        name: '夜之帷幕 EX',
        effects: [
          { buffKey: 'npStrength', value: 30, duration: 3 },
          { buffKey: 'busterUp', value: 20, duration: 3 },
        ],
        npCharge: 0,
        cooldown: 8,
      },
      {
        id: 'oberon_s2',
        name: '早钟 EX',
        effects: [],
        npCharge: 50,
        cooldown: 8,
      },
      {
        id: 'oberon_s3',
        name: '梦之终结 EX',
        effects: [
          { buffKey: 'busterUp', value: 100, duration: 1 },
          { buffKey: 'npStrength', value: 100, duration: 1 },
        ],
        npCharge: 0,
        cooldown: 10,
      },
    ],
  },

  // Merlin (Caster) — ID 300900
  300900: {
    name: '梅林',
    skills: [
      {
        id: 'merlin_s1',
        name: '梦幻的领导力 A',
        effects: [
          { buffKey: 'atkUp', value: 20, duration: 3 },
        ],
        npCharge: 20,
        cooldown: 7,
      },
      {
        id: 'merlin_s2',
        name: '幻术 A',
        effects: [
          { buffKey: 'busterUp', value: 50, duration: 3 },
        ],
        npCharge: 0,
        cooldown: 8,
      },
      {
        id: 'merlin_s3',
        name: '英雄塑造 EX',
        effects: [
          { buffKey: 'busterUp', value: 50, duration: 3 },
          { buffKey: 'critDmg', value: 100, duration: 1 },
        ],
        npCharge: 0,
        cooldown: 7,
      },
    ],
  },

  // Lady Avalon (Pretender) — ID 305300
  305300: {
    name: '阿瓦隆女士',
    skills: [
      {
        id: 'lavalon_s1',
        name: '理想之少女 A',
        effects: [
          { buffKey: 'atkUp', value: 20, duration: 3 },
        ],
        npCharge: 20,
        cooldown: 7,
      },
      {
        id: 'lavalon_s2',
        name: '湖之守护 C',
        effects: [
          { buffKey: 'artsUp', value: 50, duration: 3 },
        ],
        npCharge: 0,
        cooldown: 8,
      },
      {
        id: 'lavalon_s3',
        name: '命运之乐士 EX',
        effects: [
          { buffKey: 'artsUp', value: 50, duration: 3 },
          { buffKey: 'npRate', value: 50, duration: 3 },
        ],
        npCharge: 0,
        cooldown: 7,
      },
    ],
  },

  // Zhuge Liang (El-Melloi II) — ID 103100
  103100: {
    name: '诸葛孔明',
    skills: [
      {
        id: 'waver_s1',
        name: '鉴识眼 A',
        effects: [
          { buffKey: 'critDmg', value: 50, duration: 3 },
        ],
        npCharge: 30,
        cooldown: 7,
      },
      {
        id: 'waver_s2',
        name: '军师的忠言 A+',
        effects: [
          { buffKey: 'defDown', value: 30, duration: 3 },
        ],
        npCharge: 10,
        cooldown: 7,
      },
      {
        id: 'waver_s3',
        name: '军师的指挥 A+',
        effects: [
          { buffKey: 'atkUp', value: 30, duration: 3 },
        ],
        npCharge: 10,
        cooldown: 7,
      },
    ],
  },

  // Tamamo-no-Mae (Caster) — ID 301100
  301100: {
    name: '玉藻前',
    skills: [
      {
        id: 'tamamo_s1',
        name: '呪術 EX',
        effects: [],
        npCharge: 0,
        cooldown: 7,
      },
      {
        id: 'tamamo_s2',
        name: '変化 A',
        effects: [
          { buffKey: 'defDown', value: 30, duration: 3 },
        ],
        npCharge: 0,
        cooldown: 7,
      },
      {
        id: 'tamamo_s3',
        name: '狐之婚嫁 EX',
        effects: [
          { buffKey: 'artsUp', value: 50, duration: 3 },
          { buffKey: 'npRate', value: 50, duration: 3 },
        ],
        npCharge: 0,
        cooldown: 7,
      },
    ],
  },

  // Xu Fu (Alter Ego) — ID 303300
  303300: {
    name: '徐福',
    skills: [
      {
        id: 'xufu_s1',
        name: '方术 A',
        effects: [
          { buffKey: 'artsUp', value: 30, duration: 3 },
          { buffKey: 'npRate', value: 20, duration: 3 },
        ],
        npCharge: 0,
        cooldown: 7,
      },
      {
        id: 'xufu_s2',
        name: '医術 B',
        effects: [],
        npCharge: 20,
        cooldown: 7,
      },
      {
        id: 'xufu_s3',
        name: '仙道 B',
        effects: [
          { buffKey: 'atkUp', value: 20, duration: 3 },
        ],
        npCharge: 10,
        cooldown: 7,
      },
    ],
  },
};

// Helper: get skills for a servant by Atlas ID
export function getSkillsForServant(servantId) {
  return SKILL_DB[servantId] || null;
}

// Helper: list all servants with skill data
export function getSkillServants() {
  return Object.entries(SKILL_DB).map(([id, data]) => ({
    id: Number(id),
    name: data.name,
    skillCount: data.skills.length,
  }));
}
