export const PRESETS = {
  '黑杯Lv100': { ce: { npStrength: 80 }, ceAtk: 2400 },
  '满破黑杯': { ce: { npStrength: 80 } },
  '双C呆+黑杯': { ce: { npStrength: 80 }, ceAtk: 2400, support: { artsUp: 100, npRate: 60, atkUp: 40 } },
  '双杀狐+黑杯': { ce: { npStrength: 80 }, ceAtk: 2400, support: { busterUp: 100, busterCritDmg: 100, atkUp: 40, npRate: 50 } },
  '双RBA+绿': { ce: { npStrength: 60 }, support: { quickUp: 100, busterCritDmg: 200, atkUp: 40, npRate: 30 } },
  '奥伯龙3技能': { self: { busterUp: 50, npStrength: 50, atkUp: 20 } },
};

export const PRESET_COLORS = {
  '黑杯Lv100': 'preset-general',
  '满破黑杯': 'preset-general',
  '双C呆+黑杯': 'preset-arts',
  '双杀狐+黑杯': 'preset-buster',
  '双RBA+绿': 'preset-quick',
  '奥伯龙3技能': 'preset-buster',
};
