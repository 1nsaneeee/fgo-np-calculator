/**
 * Damage Distribution Engine
 * Enumerates all 3003 possible 5-card hands and calculates damage
 * for the best/worst 3-card ordering within each hand.
 */
import { enumerateHands } from './cardDraw';
import { clamp, getAttributeAdvantage } from './helpers';
import { CLASS_ADVANTAGE, CLASS_CORRECTION, NP_COLOR_CARD_MULT } from '@/constants/gameData';

const CARD_DMG_COEF = { Arts: 1, Quick: 0.8, Buster: 1.5 };

/**
 * Simplified single-card damage calculation.
 * Matches the formula in calcCardDamage() but uses raw parameters.
 */
function calcCardDmgRaw({
  totalAtk, cardType, position, firstCardType,
  svClass, svAttr, buffs, enemy, options
}) {
  const dmgCoef = CARD_DMG_COEF[cardType] || 1;
  const posBonus = position === 0 ? 1 : position === 1 ? 1.2 : 1.4;
  const firstBusterBonus = (position > 0 && firstCardType === 'Buster') ? 0.5 : 0;

  let colorBuff = 0;
  if (cardType === 'Buster') colorBuff = buffs.busterUp;
  else if (cardType === 'Arts') colorBuff = buffs.artsUp;
  else if (cardType === 'Quick') colorBuff = buffs.quickUp;

  const classAdv = (CLASS_ADVANTAGE[svClass] && CLASS_ADVANTAGE[svClass][enemy.class]) || 1;
  const classCorr = CLASS_CORRECTION[svClass] || 1;
  const attrAdv = getAttributeAdvantage(svAttr, enemy.attr || 'Human');
  const defMultiplier = 1 - clamp((enemy.def || 0) - (buffs.defDown || 0), 100) / 100;

  const critMult = (options && options.isCrit) ? 2 : 1;
  let critBuff = 0;
  if (options && options.isCrit) {
    critBuff = (buffs.critDmg || 0) + (buffs.busterCritDmg || 0)
      + (buffs.artsCritDmg || 0) + (buffs.quickCritDmg || 0);
    critBuff = clamp(critBuff, 500);
  }

  const baseDmg = 0.23 * totalAtk * dmgCoef * (1 + posBonus)
    * (1 + firstBusterBonus)
    * (1 + colorBuff / 100)
    * (1 + (buffs.atkUp || 0) / 100)
    * (1 + (buffs.powerMod || 0) / 100)
    * (critMult + critBuff / 100)
    * classAdv * attrAdv * classCorr
    * defMultiplier
    * (1 + (buffs.independentMod || 0) / 100);

  return Math.floor(baseDmg);
}

/**
 * Simplified NP damage calculation using raw parameters.
 * Mirrors calcNPDamage() in calculations.js.
 */
function calcNPDmgRaw({ totalAtk, npMult, npColor, svClass, svAttr, buffs, enemy }) {
  const npCardMult = NP_COLOR_CARD_MULT[npColor] || 1;

  let colorBuff = 0;
  if (npColor === 'Buster') colorBuff = buffs.busterUp || 0;
  else if (npColor === 'Arts') colorBuff = buffs.artsUp || 0;
  else if (npColor === 'Quick') colorBuff = buffs.quickUp || 0;

  const classAdv = (CLASS_ADVANTAGE[svClass] && CLASS_ADVANTAGE[svClass][enemy.class]) || 1;
  const classCorr = CLASS_CORRECTION[svClass] || 1;
  const attrAdv = getAttributeAdvantage(svAttr, enemy.attr || 'Human');
  const defMultiplier = 1 - clamp((enemy.def || 0) - (buffs.defDown || 0), 100) / 100;

  const atkUp = (buffs.atkUp || 0) / 100;
  const npStrength = (buffs.npStrength || 0) / 100;
  const powerMod = (buffs.powerMod || 0) / 100;

  const baseDmg = 0.23 * totalAtk * (npMult / 100) * npCardMult
    * (1 + colorBuff / 100)
    * (1 + atkUp)
    * classAdv * attrAdv * classCorr
    * defMultiplier
    * (1 + npStrength + powerMod)
    * (1 + (buffs.independentMod || 0) / 100);

  return Math.floor(baseDmg) + (buffs.flatDmg || 0);
}

/**
 * For a 5-card hand, try all P(5,3) = 60 possible 3-card orderings.
 * NP cards use calcNPDmgRaw (no position / first-card bonus).
 * The first card's color (or NP color) determines the chain bonus.
 * Returns { max: {damage, cards}, min: {damage, cards} }.
 */
export function findBestAndWorstPlays(hand, servantStats, buffs, enemy, options) {
  let maxR = { damage: -Infinity, cards: null };
  let minR = { damage: Infinity, cards: null };

  // 5 cards, pick 3 with order → 60 permutations
  const indices = [0, 1, 2, 3, 4];
  for (let a = 0; a < 5; a++) {
    for (let b = 0; b < 5; b++) {
      if (b === a) continue;
      for (let c = 0; c < 5; c++) {
        if (c === a || c === b) continue;

        const cards = [hand[a], hand[b], hand[c]];
        // First card's effective color: NP cards use their npColor as chain bonus source
        const firstCard = cards[0];
        const firstType = firstCard.type === 'NP'
          ? (firstCard.npColor || 'Buster')
          : firstCard.type;
        let totalDmg = 0;

        for (let i = 0; i < 3; i++) {
          const card = cards[i];
          const st = servantStats[card.servant];

          if (card.type === 'NP') {
            totalDmg += calcNPDmgRaw({
              totalAtk: st.totalAtk,
              npMult: st.npMult || 450,
              npColor: card.npColor || st.npColor || 'Buster',
              svClass: st.svClass,
              svAttr: st.svAttr,
              buffs,
              enemy,
            });
          } else {
            totalDmg += calcCardDmgRaw({
              totalAtk: st.totalAtk,
              cardType: card.type,
              position: i,
              firstCardType: firstType,
              svClass: st.svClass,
              svAttr: st.svAttr,
              buffs,
              enemy,
              options
            });
          }
        }

        if (totalDmg > maxR.damage) maxR = { damage: totalDmg, cards };
        if (totalDmg < minR.damage) minR = { damage: totalDmg, cards };
      }
    }
  }

  return { max: maxR, min: minR };
}

/**
 * Calculate damage distribution across all possible 5-card hands.
 *
 * @param {Array} pool - 15-card pool from buildPool()
 * @param {Object} servantStats - { 1: {totalAtk, svClass, svAttr}, 2: {...}, 3: {...} }
 * @param {Object} buffs - aggregated buff object
 * @param {Object} enemy - { class, attr, def }
 * @param {Object} options - { isCrit, overkill }
 * @returns {Array} [{ hand, maxDamage, minDamage, bestPlay, worstPlay }]
 */
export function calcDamageDistribution(pool, servantStats, buffs, enemy, options) {
  const hands = enumerateHands(pool);
  const results = [];

  for (const hand of hands) {
    const { max, min } = findBestAndWorstPlays(hand, servantStats, buffs, enemy, options);
    results.push({
      hand,
      maxDamage: max.damage,
      minDamage: min.damage,
      bestPlay: max.cards,
      worstPlay: min.cards
    });
  }

  return results;
}

/**
 * Build histogram buckets from distribution results.
 * Uses maxDamage for each hand.
 */
export function buildHistogram(results, numBuckets = 40) {
  const damages = results.map(r => r.maxDamage);
  const maxVal = Math.max(...damages);
  const minVal = Math.min(...damages);
  const range = (maxVal - minVal) || 1;
  const bucketWidth = range / numBuckets;

  const buckets = [];
  for (let i = 0; i < numBuckets; i++) {
    const low = minVal + i * bucketWidth;
    const high = low + bucketWidth;
    buckets.push({ low: Math.floor(low), high: Math.floor(high), count: 0 });
  }

  for (const dmg of damages) {
    const idx = Math.min(numBuckets - 1, Math.floor((dmg - minVal) / bucketWidth));
    buckets[idx].count++;
  }

  const maxCount = Math.max(...buckets.map(b => b.count), 1);

  return { buckets, total: results.length, minVal, maxVal, maxCount };
}

/**
 * Calculate clear rate: fraction of hands whose max damage >= hpThreshold.
 */
export function calcClearRate(results, hpThreshold) {
  if (!results || results.length === 0) return 0;
  const pass = results.filter(r => r.maxDamage >= hpThreshold).length;
  return pass / results.length;
}

/**
 * Format a card for display: "B1" = Buster from servant 1.
 */
export function formatCard(card) {
  if (!card) return '?';
  return card.type + card.servant;
}

/**
 * Format a 3-card play for display.
 */
export function formatPlay(cards) {
  if (!cards) return '';
  return cards.map(c => formatCard(c)).join(' → ');
}
