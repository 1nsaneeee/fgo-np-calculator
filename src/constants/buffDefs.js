export const BUFF_DEFS = [
  {key:'atkUp', label:'攻击力UP%', cap:400, capUnit:'%', group:0},
  {key:'defDown', label:'防御力Down%', cap:100, capUnit:'%', note:'=等效ATK', group:0, groupEnd:true},
  {key:'busterUp', label:'Buster魔放%', cap:400, capUnit:'%', group:1},
  {key:'artsUp', label:'Arts魔放%', cap:400, capUnit:'%', group:1},
  {key:'quickUp', label:'Quick魔放%', cap:400, capUnit:'%', group:1, groupEnd:true},
  {key:'critDmg', label:'暴击威力%', cap:500, capUnit:'%', group:2},
  {key:'starGen', label:'出星率%', cap:300, capUnit:'%', group:2, groupEnd:true},
  {key:'npStrength', label:'宝具威力%', cap:500, capUnit:'%', group:3},
  {key:'npRate', label:'NP获取率%', cap:1000, capUnit:'%', group:3, groupEnd:true},
  {key:'powerMod', label:'C类特攻%', cap:400, capUnit:'%', group:4},
  {key:'flatDmg', label:'固定伤害', cap:100000, capUnit:'', group:4},
];

export const SOURCE_KEYS = ['ce','self','support','enemy','debuff'];

export const SOURCE_LABELS = {
  ce:'礼装CE',
  self:'自身Self',
  support:'助战Support',
  enemy:'敌方Enemy',
  debuff:'减益Debuff'
};

export const CORE_BUFF_KEYS = new Set([
  'atkUp','defDown','busterUp','artsUp','quickUp','npStrength','npRate','powerMod'
]);

export const defaultBuffs = {};
for (const src of SOURCE_KEYS) {
  defaultBuffs[src] = {};
  for (const def of BUFF_DEFS) {
    defaultBuffs[src][def.key] = 0;
  }
}
