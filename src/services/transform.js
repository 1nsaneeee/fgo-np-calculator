// src/services/transform.js
import servantNames from '@/translations/servant-names.json';
import servantNamesById from '@/translations/servant-names-by-id.json';

export const CLASS_MAP = {
  saber: 'Saber', archer: 'Archer', lancer: 'Lancer', rider: 'Rider',
  caster: 'Caster', assassin: 'Assassin', berserker: 'Berserker',
  ruler: 'Ruler', avenger: 'Avenger', alterEgo: 'Alterego',
  moonCancer: 'MoonCancer', foreigner: 'Foreigner', pretender: 'Pretender',
  shielder: 'Shielder', beast: 'Beast',
  beastEresh: 'Beast', unBeastOlgaMarie: 'Beast',
};

const CARD_TO_COLOR = { '1': 'Arts', '2': 'Buster', '3': 'Quick' };
const CARD_TO_CHAR = { '1': 'A', '2': 'B', '3': 'Q' };

function translateName(jpName, svId) {
  if (svId && servantNamesById[svId]) return servantNamesById[svId];
  return servantNames[jpName] || jpName;
}

function getNpColor(nps) {
  if (!nps || !nps.length) return 'Buster';
  return CARD_TO_COLOR[nps[0].card] || 'Buster';
}

function buildDeck(cards) {
  if (!cards) return 'BBAAQ';
  return cards.map(c => CARD_TO_CHAR[c] || 'B').join('');
}

function getHitCounts(hitsDist) {
  const getLen = (i) => (hitsDist && hitsDist[i] ? hitsDist[i].length : 0);
  return {
    bHits: getLen('2'),
    aHits: getLen('1'),
    qHits: getLen('3'),
    eHits: getLen('4'),
  };
}

function getAtkAtLevel(s, level) {
  if (!s.atkGrowth) return s.atkMax || 0;
  const idx = Math.min(level - 1, s.atkGrowth.length - 1);
  return s.atkGrowth[idx] || s.atkMax || 0;
}

function getNpMultipliers(nps) {
  if (!nps || !nps.length) return { np1: 0, np2: 0, np3: 0, np4: 0, np5: 0 };
  const funcs = nps[0].functions || [];
  const damageFunc = funcs.find(f => f.funcType && f.funcType.startsWith('damageNp'));
  if (!damageFunc) return { np1: 0, np2: 0, np3: 0, np4: 0, np5: 0 };
  const getVal = (arr, i) => (arr[i] ? arr[i].Value / 10 : 0);
  return {
    np1: getVal(damageFunc.svals, 0),
    np2: getVal(damageFunc.svals, 1),
    np3: getVal(damageFunc.svals, 2),
    np4: getVal(damageFunc.svals, 3),
    np5: getVal(damageFunc.svals, 4),
  };
}

function getPassives(classPassive) {
  const result = {
    passiveBuster: 0, passiveArts: 0, passiveQuick: 0,
    passiveCrit: 0, passiveNpGen: 0, passiveFlat: 0, passiveNpStrength: 0,
    passiveBusterCrit: 0, passiveArtsCrit: 0, passiveQuickCrit: 0,
  };
  if (!classPassive) return result;

  for (const ps of classPassive) {
    const funcs = ps.functions || [];
    for (const f of funcs) {
      const val = (f.svals && f.svals[0]) ? f.svals[0].Value / 10 : 0;
      switch (f.funcType) {
        case 'addCommandCardAtk':
          if (f.svt?.name?.includes('Buster')) result.passiveBuster += val;
          else if (f.svt?.name?.includes('Arts')) result.passiveArts += val;
          else if (f.svt?.name?.includes('Quick')) result.passiveQuick += val;
          break;
        case 'addCriticalDamage':
          result.passiveCrit += val;
          break;
        case 'addNpGain':
          result.passiveNpGen += val;
          break;
        case 'addNpStrength':
          result.passiveNpStrength += val;
          break;
      }
    }
  }
  return result;
}

/**
 * Extract skill buff effects from nice servant data.
 * Active skills use funcType "addState"/"addStateShort" with actual buff type in buffs[].type.
 * Direct effects (gainNp, gainStar) have no buffs array.
 * Returns structured skill data compatible with the TurnSimulator interface.
 */
function getSkillBuffs(nice) {
  if (!nice.skills) return [];

  // Card type mapping from buff.ckSelfIndv[0].id
  const CARD_TYPE_MAP = { 4001: 'artsUp', 4002: 'busterUp', 4003: 'quickUp' };

  // Deduplicate: only keep the highest-priority version of each skill num (1,2,3)
  const skillMap = new Map();
  for (const skill of nice.skills) {
    const num = skill.num;
    if (num < 1 || num > 3) continue;
    const existing = skillMap.get(num);
    if (!existing || (skill.priority || 0) >= (existing.priority || 0)) {
      skillMap.set(num, skill);
    }
  }

  const result = [];
  for (let num = 1; num <= 3; num++) {
    const skill = skillMap.get(num);
    if (!skill) {
      result.push({ id: `api_${nice.id}_s${num}`, name: '—', effects: [], npCharge: 0, cooldown: 0 });
      continue;
    }

    const effects = [];
    let npCharge = 0;

    for (const f of (skill.functions || [])) {
      // svals[0] = level 1 values (index = skillLevel - 1)
      const sv = (f.svals && f.svals[0]) || {};

      if (f.funcType === 'gainNp') {
        // Value is in permille: 5000 = 50% NP charge
        npCharge += Math.round((sv.Value || 0) / 100);
        continue;
      }

      if (f.funcType !== 'addState' && f.funcType !== 'addStateShort') continue;

      const duration = sv.Turn || 1;

      for (const buff of (f.buffs || [])) {
        const val = Math.round((sv.Value || 0) / 10); // permille → percentage

        switch (buff.type) {
          case 'upAtk':
            effects.push({ buffKey: 'atkUp', value: val, duration });
            break;
          case 'upCommandall':
            // Card type from buff.ckSelfIndv[0].id: 4001=Arts, 4002=Buster, 4003=Quick
            const cardIndv = buff.ckSelfIndv?.[0]?.id;
            const buffKey = CARD_TYPE_MAP[cardIndv];
            if (buffKey) effects.push({ buffKey, value: val, duration });
            break;
          case 'upNpdamage':
            effects.push({ buffKey: 'npStrength', value: val, duration });
            break;
          case 'upCriticaldamage':
            effects.push({ buffKey: 'critDmg', value: val, duration });
            break;
          case 'upCriticalpoint':
            effects.push({ buffKey: 'starGen', value: val, duration });
            break;
          case 'upDamage':
            effects.push({ buffKey: 'powerMod', value: val, duration });
            break;
        }
      }
    }

    // Cooldown at skill level 10
    const cooldown = (skill.coolDown?.length >= 10) ? skill.coolDown[9] : (skill.coolDown?.[0] || 7);

    result.push({
      id: `api_${nice.id}_s${num}`,
      name: skill.name || `Skill ${num}`,
      effects,
      npCharge,
      cooldown,
    });
  }
  return result;
}

export function transformNiceToCalc(nice) {
  const nameJp = nice.originalName || nice.name;
  const hits = getHitCounts(nice.hitsDistribution);
  const npMults = getNpMultipliers(nice.noblePhantasms);
  const passives = getPassives(nice.classPassive);

  let npRate = 0.5;
  if (nice.noblePhantasms?.[0]?.npGain) {
    const ng = nice.noblePhantasms[0].npGain;
    npRate = (ng.arts?.[0] || ng.buster?.[0] || 86) / 100;
  }

  const starRate = (nice.starGen || 100) / 1000;
  const skills = getSkillBuffs(nice);

  return {
    id: nice.id,
    name: translateName(nameJp, nice.id),
    nameEn: nice.ruby || nice.name,
    class: CLASS_MAP[nice.className] || nice.className,
    attr: (nice.attribute || 'human').charAt(0).toUpperCase() + (nice.attribute || 'human').slice(1),
    npColor: getNpColor(nice.noblePhantasms),
    npRate,
    npHits: (nice.noblePhantasms?.[0]?.npDistribution || []).length || 1,
    ...hits,
    starRate,
    deck: buildDeck(nice.cards),
    atk90: getAtkAtLevel(nice, 90),
    atk100: getAtkAtLevel(nice, 100),
    atk120: getAtkAtLevel(nice, 120),
    ...npMults,
    ...passives,
    skills,
    _face: nice.extraAssets?.faces?.ascension?.['1'] || '',
    _rarity: nice.rarity || 1,
  };
}
