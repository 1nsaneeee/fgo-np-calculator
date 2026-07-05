/**
 * Damage Distribution Engine
 * Enumerates all 3003 possible 5-card hands and calculates damage
 * for the best/worst 3-card ordering within each hand.
 */
import { enumerateHands } from './cardDraw';
import { clamp, getAttributeAdvantage } from './helpers';
import { CLASS_ADVANTAGE, CLASS_CORRECTION, NP_COLOR_CARD_MULT } from '@/constants/gameData';

const CARD_DMG_COEF = { Arts: 1, Quick: 0.8, Buster: 1.5 };
const TYPE_MAP = { B: 'Buster', A: 'Arts', Q: 'Quick' };

/**
 * Simplified single-card damage calculation.
 * Matches the formula in calcCardDamage() but uses raw parameters.
 */
function calcCardDmgRaw({
  totalAtk, cardType, position, firstCardType,
  svClass, svAttr, aggs, servantIndex, enemy, options
}) {
  const buffs = aggs[servantIndex];
  const normalizedType = TYPE_MAP[cardType] || cardType;
  const normalizedFirst = TYPE_MAP[firstCardType] || firstCardType;

  const dmgCoef = CARD_DMG_COEF[normalizedType] || 1;
  const posBonus = position === 0 ? 1 : position === 1 ? 1.2 : 1.4;
  const firstBusterBonus = (position > 0 && normalizedFirst === 'Buster') ? 0.5 : 0;

  let colorBuff = 0;
  if (normalizedType === 'Buster') colorBuff = buffs.busterUp;
  else if (normalizedType === 'Arts') colorBuff = buffs.artsUp;
  else if (normalizedType === 'Quick') colorBuff = buffs.quickUp;

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
function calcNPDmgRaw({ totalAtk, npMult, npColor, svClass, svAttr, aggs, servantIndex, enemy }) {
  const buffs = aggs[servantIndex];
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
export function findBestAndWorstPlays(hand, servantStats, aggs, enemy, options) {
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
              aggs,
              servantIndex: card.servant,
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
              aggs,
              servantIndex: card.servant,
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
 * @param {Object} aggs - buff objects keyed by servant index {1,2,3}
 * @param {Object} enemy - { class, attr, def }
 * @param {Object} options - { isCrit, overkill }
 * @returns {Array} [{ hand, maxDamage, minDamage, bestPlay, worstPlay }]
 */
export function calcDamageDistribution(pool, servantStats, aggs, enemy, options) {
  const hands = enumerateHands(pool);
  const results = [];

  for (const hand of hands) {
    const { max, min } = findBestAndWorstPlays(hand, servantStats, aggs, enemy, options);
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
 * Enumerate ALL 3-card plays (with ordering) from the full card pool.
 * P(n,3) = n×(n-1)×(n-2) plays — ~2730 for a 15-card pool.
 * Each play is an exact damage value; returns them sorted ascending.
 * No "best of hand" indirection — every possible 3-card sequence is a data point.
 */
export function calcAllPlayDamages(pool, servantStats, aggs, enemy, options) {
  const n = pool.length;
  const damages = [];
  const seen = new Set(); // dedup key: type+servant sequence

  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      if (b === a) continue;
      for (let c = 0; c < n; c++) {
        if (c === a || c === b) continue;

        const cards = [pool[a], pool[b], pool[c]];
        // Skip duplicate card sequences (e.g. two B cards from same servant)
        const key = cards.map(c => c.type + c.servant).join('');
        if (seen.has(key)) continue;
        seen.add(key);
        const firstCard = cards[0];
        const firstType = firstCard.type === 'NP'
          ? (firstCard.npColor || 'Buster')
          : firstCard.type;
        let totalDmg = 0;

        for (let pos = 0; pos < 3; pos++) {
          const card = cards[pos];
          const st = servantStats[card.servant];

          if (card.type === 'NP') {
            totalDmg += calcNPDmgRaw({
              totalAtk: st.totalAtk, npMult: st.npMult || 450,
              npColor: card.npColor || st.npColor || 'Buster',
              svClass: st.svClass, svAttr: st.svAttr, aggs, servantIndex: card.servant, enemy,
            });
          } else {
            totalDmg += calcCardDmgRaw({
              totalAtk: st.totalAtk, cardType: card.type, position: pos,
              firstCardType: firstType, svClass: st.svClass, svAttr: st.svAttr,
              aggs, servantIndex: card.servant, enemy, options,
            });
          }
        }
        damages.push(totalDmg);
      }
    }
  }

  damages.sort((a, b) => a - b);
  return damages;
}

/**
 * Enumerate ALL 3-card plays (with ordering) from the full card pool,
 * returning detailed card info and damage range for each sequence.
 * P(n,3) = n×(n-1)×(n-2) plays — ~2730 for a 15-card pool.
 * Each play includes card details, average/min/max damage, and chain info.
 * Results are sorted by damage descending (highest damage first).
 *
 * @param {Array} pool - card pool from buildPool()
 * @param {Object} servantStats - { 1: {totalAtk, svClass, svAttr, npMult, npColor}, ... }
 * @param {Object} aggs - buff objects keyed by servant index {1,2,3}
 * @param {Object} enemy - { class, attr, def }
 * @param {Object} options - { isCrit, overkill }
 * @returns {Array<{cards: Array, damage: number, min: number, max: number, firstType: string, hasNP: boolean}>}
 */
export function calcAllPlayDamagesDetailed(pool, servantStats, aggs, enemy, options) {
  const n = pool.length;
  const results = [];

  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      if (b === a) continue;
      for (let c = 0; c < n; c++) {
        if (c === a || c === b) continue;

        const cards = [pool[a], pool[b], pool[c]];
        const firstCard = cards[0];
        const firstType = firstCard.type === 'NP'
          ? (firstCard.npColor || 'Buster')
          : firstCard.type;
        let totalDmg = 0;
        let hasNP = false;

        for (let pos = 0; pos < 3; pos++) {
          const card = cards[pos];
          const st = servantStats[card.servant];

          if (card.type === 'NP') {
            hasNP = true;
            totalDmg += calcNPDmgRaw({
              totalAtk: st.totalAtk, npMult: st.npMult || 450,
              npColor: card.npColor || st.npColor || 'Buster',
              svClass: st.svClass, svAttr: st.svAttr, aggs, servantIndex: card.servant, enemy,
            });
          } else {
            totalDmg += calcCardDmgRaw({
              totalAtk: st.totalAtk, cardType: card.type, position: pos,
              firstCardType: firstType, svClass: st.svClass, svAttr: st.svAttr,
              aggs, servantIndex: card.servant, enemy, options,
            });
          }
        }

        results.push({
          cards: cards.map(c => ({ type: c.type, servant: c.servant })),
          damage: totalDmg,
          min: Math.floor(totalDmg * 0.9),
          max: Math.floor(totalDmg * 1.099),
          firstType,
          hasNP,
        });
      }
    }
  }

  results.sort((a, b) => b.damage - a.damage);

  // Collapse duplicate card sequences (e.g. two B cards from same servant → same type+servant key)
  // and track multiplicity for weighted probability calculations.
  const seen = new Map();
  const collapsed = [];
  for (const p of results) {
    const key = p.cards.map(c => c.type + c.servant).join('');
    const existing = seen.get(key);
    if (existing) {
      existing.multiplicity++;
    } else {
      const entry = { ...p, multiplicity: 1 };
      seen.set(key, entry);
      collapsed.push(entry);
    }
  }
  return collapsed;
}

/**
 * Build histogram buckets from distribution results.
 * Uses maxDamage for each hand.
 * Bucket boundaries align to multiples of targetWidth (default 1000) so labels
 * are always clean: [12000,13000), [13000,14000), etc.
 * @param {number} hpThreshold — if > 0, each bucket gets an aboveCount of hands >= threshold
 */
export function buildHistogram(results, targetWidth = 1000, hpThreshold = 0) {
  const damages = results.map(r => r.maxDamage);
  const maxVal = Math.max(...damages);
  const minVal = Math.min(...damages);

  // Align start down to nearest targetWidth multiple, end up
  let start = Math.floor(minVal / targetWidth) * targetWidth;
  let end   = Math.ceil(maxVal / targetWidth) * targetWidth;
  let width = targetWidth;

  // Clamp bucket count: at least 5, at most 60
  let n = (end - start) / width;
  while (n < 5)  { width = Math.max(1, Math.floor(width / 2)); start = Math.floor(minVal / width) * width; end = Math.ceil(maxVal / width) * width; n = (end - start) / width; }
  while (n > 60) { width = width * 2;                       start = Math.floor(minVal / width) * width; end = Math.ceil(maxVal / width) * width; n = (end - start) / width; }
  const numBuckets = n;

  const buckets = [];
  for (let i = 0; i < numBuckets; i++) {
    const low = start + i * width;
    buckets.push({ low, high: low + width, count: 0, aboveCount: 0 });
  }

  // Assign each damage value to its bucket
  for (const dmg of damages) {
    const idx = Math.min(numBuckets - 1, Math.floor((dmg - start) / width));
    buckets[idx].count++;
    if (hpThreshold > 0 && dmg >= hpThreshold) {
      buckets[idx].aboveCount++;
    }
  }

  return { buckets, total: results.length, minVal, maxVal, numBuckets };
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
 * Calculate weighted pass rate: for each unique card sequence, weight its kill probability
 * by how many pool-level permutations it represents, then divide by total permutations.
 * Accounts for both card draw probability AND per-sequence damage variance.
 *
 * @param {Array} detailed - results from calcAllPlayDamagesDetailed (with multiplicity)
 * @param {number} totalPermutations - P(n,3) = n×(n-1)×(n-2), total pool permutations
 * @param {number} hpThreshold - enemy HP
 * @returns {{ weighted: number, unweighted: number }} pass rates
 */
export function calcWeightedPassRate(detailed, totalPermutations, hpThreshold) {
  if (!detailed || detailed.length === 0 || hpThreshold <= 0 || !totalPermutations) {
    return { weighted: 0, unweighted: 0 };
  }
  let weightedPass = 0;
  let unweightedPass = 0;
  for (const seq of detailed) {
    // Per-sequence kill rate: fraction of random damage range above HP
    const range = seq.max - seq.min;
    let killRate = 0;
    if (range > 0) {
      killRate = Math.max(0, Math.min(1, (seq.max - hpThreshold) / range));
    } else {
      killRate = seq.damage >= hpThreshold ? 1 : 0;
    }
    weightedPass += seq.multiplicity * killRate;
    unweightedPass += killRate;
  }
  return {
    weighted: weightedPass / totalPermutations,
    unweighted: unweightedPass / detailed.length,
  };
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
