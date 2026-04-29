/**
 * Card Draw Probability Engine
 * Calculates probabilities for 5-card hands drawn from a 15-card pool (3 servants × 5 cards).
 * C(15,5) = 3003 possible hands — brute-force enumeration is trivially fast.
 */

export function C(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n - k) k = n - k;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return Math.round(result);
}

export function buildPool(deck1, deck2, deck3) {
  const pool = [];
  for (const ch of deck1) pool.push({ type: ch, servant: 1 });
  for (const ch of deck2) pool.push({ type: ch, servant: 2 });
  for (const ch of deck3) pool.push({ type: ch, servant: 3 });
  return pool;
}

export function enumerateHands(pool) {
  const hands = [];
  const n = pool.length;
  for (let a = 0; a < n - 4; a++)
    for (let b = a + 1; b < n - 3; b++)
      for (let c = b + 1; c < n - 2; c++)
        for (let d = c + 1; d < n - 1; d++)
          for (let e = d + 1; e < n; e++)
            hands.push([pool[a], pool[b], pool[c], pool[d], pool[e]]);
  return hands;
}

export function calcAutoProbs(pool) {
  const hands = enumerateHands(pool);
  const total = hands.length;

  const result = {
    braveChain: { 1: 0, 2: 0, 3: 0 },
    colorChain: { B: 0, A: 0, Q: 0 },
    triColor: { 1: 0, 2: 0, 3: 0 },
  };

  for (const hand of hands) {
    const sCount = { 1: 0, 2: 0, 3: 0 };
    const cCount = { B: 0, A: 0, Q: 0 };
    const sColors = { 1: 0, 2: 0, 3: 0 }; // bitmask: B=1, A=2, Q=4

    for (const card of hand) {
      sCount[card.servant]++;
      cCount[card.type]++;
      sColors[card.servant] |= card.type === 'B' ? 1 : card.type === 'A' ? 2 : 4;
    }

    for (let s = 1; s <= 3; s++) {
      if (sCount[s] >= 3) result.braveChain[s]++;
      if (sColors[s] === 7) result.triColor[s]++; // 1|2|4 = 7 means all three colors
    }
    for (const c of ['B', 'A', 'Q']) {
      if (cCount[c] >= 3) result.colorChain[c]++;
    }
  }

  for (let s = 1; s <= 3; s++) {
    result.braveChain[s] /= total;
    result.triColor[s] /= total;
  }
  for (const c of ['B', 'A', 'Q']) {
    result.colorChain[c] /= total;
  }

  return result;
}

export function parseQuery(queryStr) {
  const str = queryStr.toUpperCase().replace(/[^BAQ123]/g, '');
  const cards = [];
  let i = 0;
  while (i < str.length) {
    const ch = str[i];
    if ('BAQ'.includes(ch) && i + 1 < str.length) {
      const num = parseInt(str[i + 1]);
      if (num >= 1 && num <= 3) {
        cards.push({ type: ch, servant: num });
        i += 2;
        continue;
      }
    }
    i++;
  }
  return cards;
}

export function queryProb(pool, query) {
  if (!query || query.length === 0) return null;

  const hands = enumerateHands(pool);
  const total = hands.length;
  let count = 0;

  // Build query multiset
  const need = {};
  for (const card of query) {
    const key = card.type + card.servant;
    need[key] = (need[key] || 0) + 1;
  }

  for (const hand of hands) {
    const have = {};
    for (const card of hand) {
      const key = card.type + card.servant;
      have[key] = (have[key] || 0) + 1;
    }
    let ok = true;
    for (const key in need) {
      if ((have[key] || 0) < need[key]) { ok = false; break; }
    }
    if (ok) count++;
  }

  return count / total;
}
