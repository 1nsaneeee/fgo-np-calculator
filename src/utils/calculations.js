import { getSv, clamp, getAttributeAdvantage } from './helpers';
import { CLASS_ADVANTAGE, CLASS_CORRECTION, NP_COLOR_CARD_MULT, ENEMY_NP_MOD } from '@/constants/gameData';

export function aggregateBuffs(buffs, servant, options) {
  const keys = ['atkUp','defDown','busterUp','artsUp','quickUp','critDmg','starGen','npStrength','npRate','powerMod','flatDmg'];
  const raw = {};
  const sources = buffs.sources || [];

  for (const k of keys) {
    let val = 0;
    for (const src of sources) {
      val += (src.buffs && src.buffs[k] !== undefined) ? (src.buffs[k] || 0) : 0;
    }
    const sv = servant;
    if (sv) {
      if (k === 'busterUp') val += getSv(sv, 'passiveBuster');
      if (k === 'artsUp') val += getSv(sv, 'passiveArts');
      if (k === 'quickUp') val += getSv(sv, 'passiveQuick');
      if (k === 'critDmg') val += getSv(sv, 'passiveCrit');
      if (k === 'flatDmg') val += getSv(sv, 'passiveFlat');
      if (k === 'npRate') val += getSv(sv, 'passiveNpGen');
      if (k === 'npStrength') val += getSv(sv, 'passiveNpStrength');
    }
    raw[k] = val;
  }

  const agg = {};
  agg.atkUp = clamp(raw.atkUp, 400);
  agg.defDown = clamp(raw.defDown, 100);
  agg.busterUp = clamp(raw.busterUp, 400);
  agg.artsUp = clamp(raw.artsUp, 400);
  agg.quickUp = clamp(raw.quickUp, 400);
  agg.critDmg = clamp(raw.critDmg, 500);
  agg.starGen = clamp(raw.starGen, 300);
  agg.npStrength = clamp(raw.npStrength, 500);
  agg.npRate = clamp(raw.npRate, 1000);
  agg.powerMod = clamp(raw.powerMod, 400);
  agg.flatDmg = clamp(raw.flatDmg, 100000);

  return agg;
}

export function calcNPDamage(servant, config, buffs, enemy, options) {
  if (!servant) return {min:0, avg:0, max:0};

  const sv = servant;
  const agg = aggregateBuffs(buffs, sv, options);

  const atkLv = config.level >= 120 ? getSv(sv, 'atk120')
    : config.level >= 100 ? getSv(sv, 'atk100')
    : getSv(sv, 'atk90');
  const totalAtk = atkLv + (config.fou || 0) + (config.ceAtk || 0) + (config.extraAtk || 0);

  const npLev = config.npLevel || 1;
  const npKeys = ['np1','np2','np3','np4','np5'];
  const npMult = getSv(sv, npKeys[npLev-1]) || 0;
  const npColor = getSv(sv, 'npColor');

  const svClass = getSv(sv, 'class');
  const enClass = enemy.class || 'Saber';
  const classAdv = (CLASS_ADVANTAGE[svClass] && CLASS_ADVANTAGE[svClass][enClass]) || 1;

  const svAttr = getSv(sv, 'attr') || 'Human';
  const enAttr = enemy.attr || 'Human';
  const attrAdv = getAttributeAdvantage(svAttr, enAttr);

  const classCorr = CLASS_CORRECTION[svClass] || 1;

  const npCardMult = NP_COLOR_CARD_MULT[npColor] || 1;

  let colorBuff = 0;
  if (npColor === 'Buster') colorBuff = agg.busterUp;
  else if (npColor === 'Arts') colorBuff = agg.artsUp;
  else if (npColor === 'Quick') colorBuff = agg.quickUp;

  const netEnemyDef = clamp((enemy.def || 0) - agg.defDown, 100);
  const defMultiplier = 1 - netEnemyDef / 100;

  const atkUp = agg.atkUp / 100;
  const npStrength = agg.npStrength / 100;
  const powerMod = agg.powerMod / 100;

  const baseDmg = 0.23 * totalAtk * (npMult / 100) * npCardMult
    * (1 + colorBuff / 100)
    * (1 + atkUp)
    * classAdv * attrAdv * classCorr
    * defMultiplier
    * (1 + npStrength + powerMod);

  const minDmg = Math.floor(baseDmg * 0.9 + agg.flatDmg);
  const avgDmg = Math.floor(baseDmg * 1.0 + agg.flatDmg);
  const maxDmg = Math.floor(baseDmg * 1.099 + agg.flatDmg);

  return {
    min: minDmg,
    avg: avgDmg,
    max: maxDmg,
    totalAtk,
    details: {
      svClass, enClass, classAdv, attrAdv, classCorr,
      npMult, npCardMult, colorBuff, atkUp, netEnemyDef,
      npStrength, powerMod, enemyDef: enemy.def, baseDmg,
      agg
    }
  };
}

function calcNPGainPerHit(servant, buffs, enemy, options, isNP, cardType, position, firstCardType) {
  if (!servant) return 0;
  const sv = servant;
  const agg = aggregateBuffs(buffs, sv, options);

  const npColor = getSv(sv, 'npColor');
  const npRate = getSv(sv, 'npRate');

  const effectiveType = isNP ? npColor : (cardType || 'Arts');
  const cardCoef = {Arts:3, Quick:1, Buster:0, Extra:1};
  const baseCardValue = isNP ? (cardCoef[npColor] || 0) : (cardCoef[effectiveType] || 0);

  const posMult = position === 'first' ? 1.0 : position === 'second' ? 1.5 : position === 'third' ? 2.0 : 1.0;

  let firstCardArtsBonus = 0;
  if (!isNP && position !== 'first' && firstCardType === 'Arts') {
    firstCardArtsBonus = 1;
  }

  const cardValue = baseCardValue * posMult + firstCardArtsBonus;

  let colorBuff = 0;
  if (effectiveType === 'Buster') colorBuff = agg.busterUp;
  else if (effectiveType === 'Arts') colorBuff = agg.artsUp;
  else if (effectiveType === 'Quick') colorBuff = agg.quickUp;

  const enClass = enemy.class || 'Saber';
  const enemyMod = ENEMY_NP_MOD[enClass] || 1;

  const overkillMult = (options && options.overkill) ? 1.5 : 1;
  const critMult = (options && options.isCrit) ? 2 : 1;

  const perHit = npRate * cardValue
    * (1 + colorBuff / 100)
    * enemyMod
    * (1 + agg.npRate / 100)
    * overkillMult
    * critMult;

  return Math.max(0, perHit);
}

export function calcNPGainForCard(servant, buffs, enemy, options, cardType, position, firstCardType) {
  if (!servant) return 0;
  const sv = servant;
  const hits = cardType === 'Buster' ? getSv(sv, 'bHits')
    : cardType === 'Arts' ? getSv(sv, 'aHits')
    : cardType === 'Quick' ? getSv(sv, 'qHits')
    : cardType === 'Extra' ? getSv(sv, 'eHits') : 0;

  if (hits === 0) return 0;

  const isNP = (cardType === getSv(sv, 'npColor'));
  const perHit = calcNPGainPerHit(servant, buffs, enemy, options, isNP, cardType, position, firstCardType);

  return Math.floor(perHit * hits * 100) / 100;
}

export function calcCardDamage(servant, config, buffs, enemy, options, cardType, position, firstCardType) {
  if (!servant || cardType === 'NP') return 0;
  const sv = servant;
  const agg = aggregateBuffs(buffs, sv, options);

  const totalAtk = getSv(sv, 'atk90') + (config.fou || 0) + (config.ceAtk || 0) + (config.extraAtk || 0);

  const cardDmgCoef = {Arts:1, Quick:0.8, Buster:1.5, Extra:1};
  const dmgCoef = cardDmgCoef[cardType] || 1;

  const posBonus = position === 'first' ? 1 : position === 'second' ? 1.2 : 1.4;
  const firstCardBusterBonus = (firstCardType === 'Buster') ? 0.5 : 0;

  let colorBuff = 0;
  if (cardType === 'Buster') colorBuff = agg.busterUp;
  else if (cardType === 'Arts') colorBuff = agg.artsUp;
  else if (cardType === 'Quick') colorBuff = agg.quickUp;

  const svClass = getSv(sv, 'class');
  const classAdv = (CLASS_ADVANTAGE[svClass] && CLASS_ADVANTAGE[svClass][enemy.class]) || 1;
  const classCorr = CLASS_CORRECTION[svClass] || 1;
  const attrAdv = getAttributeAdvantage(getSv(sv, 'attr') || 'Human', enemy.attr || 'Human');
  const defMultiplier = 1 - clamp((enemy.def || 0) - agg.defDown, 100) / 100;

  const critMult = (options && options.isCrit) ? 2 : 1;
  let critBuff = 0;
  if (options && options.isCrit) {
    critBuff = agg.critDmg;
    if (cardType === 'Buster') critBuff += getSv(sv, 'passiveBusterCrit');
    if (cardType === 'Arts') critBuff += getSv(sv, 'passiveArtsCrit');
    if (cardType === 'Quick') critBuff += getSv(sv, 'passiveQuickCrit');
    critBuff = clamp(critBuff, 500);
  }

  const dmg = 0.23 * totalAtk * dmgCoef * (1 + posBonus)
    * (1 + firstCardBusterBonus)
    * (1 + colorBuff / 100)
    * (1 + agg.atkUp / 100)
    * (1 + agg.powerMod / 100)
    * (critMult + critBuff / 100)
    * classAdv * attrAdv * classCorr
    * defMultiplier;

  return Math.floor(dmg);
}

function calcStarPerHit(servant, buffs, enemy, options, cardType, position, firstCardType) {
  if (!servant) return 0;
  const sv = servant;
  const agg = aggregateBuffs(buffs, sv, options);

  const baseStarRate = getSv(sv, 'starRate');

  const firstPos = position === 'first' ? 0 : (position === 'second' ? 1 : 2);
  const starValues = {
    Quick: 80 + 50 * firstPos,
    Buster: 10 + 5 * firstPos,
    Arts: 0,
    Extra: 100
  };
  const cardStarValue = starValues[cardType] || 0;

  let colorBuff = 0;
  if (cardType === 'Buster') colorBuff = agg.busterUp;
  else if (cardType === 'Arts') colorBuff = agg.artsUp;
  else if (cardType === 'Quick') colorBuff = agg.quickUp;

  const overkillBonus = (options && options.overkill) ? 30 : 0;
  const quickFirstBonus = (firstCardType === 'Quick' && position !== 'first') ? 20 : 0;

  const starRate = baseStarRate * 100
    + cardStarValue * (1 + colorBuff / 100)
    + agg.starGen
    + overkillBonus
    + quickFirstBonus;

  return clamp(starRate, 300) / 100;
}

export function calcStars(servant, buffs, enemy, options, cardType, position, firstCardType) {
  if (!servant) return {floor:0, expected:0, ceil:0};
  const sv = servant;
  const hits = cardType === 'Buster' ? getSv(sv, 'bHits')
    : cardType === 'Arts' ? getSv(sv, 'aHits')
    : cardType === 'Quick' ? getSv(sv, 'qHits')
    : cardType === 'Extra' ? getSv(sv, 'eHits') : 0;
  if (hits === 0) return {floor:0, expected:0, ceil:0};

  const perHit = calcStarPerHit(servant, buffs, enemy, options, cardType, position, firstCardType);
  return {
    floor: Math.floor(perHit) * hits,
    expected: Math.round(perHit * hits * 10) / 10,
    ceil: Math.min(3, Math.ceil(perHit)) * hits
  };
}

export function calc3TValues(servant, config, buffs, enemy, options) {
  if (!servant) return [];

  const sv = servant;
  const deck = getSv(sv, 'deck');
  const npColor = getSv(sv, 'npColor');

  const bCount = (deck.match(/B/g) || []).length;
  const aCount = (deck.match(/A/g) || []).length;
  const qCount = (deck.match(/Q/g) || []).length;

  const results = [];
  for (let turn = 1; turn <= 3; turn++) {
    const npDmg = calcNPDamage(servant, config, buffs, enemy, options);
    const npGainNP = calcNPGainForCard(servant, buffs, enemy, options, npColor, 'third');

    let totalNPGain = npGainNP;
    if (aCount > 0) totalNPGain += calcNPGainForCard(servant, buffs, enemy, options, 'Arts', 'second') * aCount;
    if (qCount > 0) totalNPGain += calcNPGainForCard(servant, buffs, enemy, options, 'Quick', 'second') * qCount;

    results.push({
      turn,
      npDmg,
      npGain: totalNPGain,
      totalDmg: npDmg.avg
    });
  }
  return results;
}
