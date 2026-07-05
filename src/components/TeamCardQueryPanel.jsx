// src/components/TeamCardQueryPanel.jsx
// Card query with damage display for the team planner page.
// Shows card draw probabilities + simplified damage range for query sequences.
import { useState, useMemo } from 'react';
import useStore from '@/store/index';
import { Button } from '@mui/material';
import { buildPool, parseQuery, queryProb } from '@/utils/cardDraw';
import { aggregateBuffs } from '@/utils/calculations';
import { getSv, clamp, getAttributeAdvantage } from '@/utils/helpers';
import { CLASS_ADVANTAGE, CLASS_CORRECTION } from '@/constants/gameData';
import { SERVANT_DB } from '@/data/servantDb';

// ── Helpers ──

const pct = (v) => (v * 100).toFixed(1) + '%';
const fmtNum = (v) => Math.round(v).toLocaleString();

function findServantById(id, slots) {
  // Priority: check team slots for _resolvedServant (cached API data)
  if (slots) {
    for (const slot of slots) {
      if (slot._resolvedServant && slot.servantId === id) return slot._resolvedServant;
    }
  }
  // Fall back to SERVANT_DB
  return SERVANT_DB.find((s) => s[0] === id) || null;
}

/**
 * Simplified per-card damage calculation matching calcCardDmgRaw / calcCardDamage formula.
 * Returns { baseDmg, min, avg, max }.
 */
function calcCardDmgForQuery({
  totalAtk, cardType, position, firstCardType,
  agg, svClass, svAttr, enemy, options,
}) {
  const TYPE_MAP = { B: 'Buster', A: 'Arts', Q: 'Quick' };
  const normalizedType = TYPE_MAP[cardType] || cardType;
  const normalizedFirst = TYPE_MAP[firstCardType] || firstCardType;

  const dmgCoef = { Arts: 1, Quick: 0.8, Buster: 1.5 }[normalizedType] || 1;
  const posBonus = position === 0 ? 1 : position === 1 ? 1.2 : 1.4;
  const firstBusterBonus = (position > 0 && normalizedFirst === 'Buster') ? 0.5 : 0;

  let colorBuff = 0;
  if (normalizedType === 'Buster') colorBuff = agg.busterUp;
  else if (normalizedType === 'Arts') colorBuff = agg.artsUp;
  else if (normalizedType === 'Quick') colorBuff = agg.quickUp;

  const classAdv = (CLASS_ADVANTAGE[svClass] && CLASS_ADVANTAGE[svClass][enemy.class]) || 1;
  const classCorr = CLASS_CORRECTION[svClass] || 1;
  const attrAdv = getAttributeAdvantage(svAttr, enemy.attr || 'Human');
  const defMultiplier = 1 - clamp((enemy.def || 0) - (agg.defDown || 0), 100) / 100;

  const critMult = (options && options.isCrit) ? 2 : 1;
  let critBuff = 0;
  if (options && options.isCrit) {
    critBuff = (agg.critDmg || 0) + (agg.busterCritDmg || 0)
      + (agg.artsCritDmg || 0) + (agg.quickCritDmg || 0);
    critBuff = clamp(critBuff, 500);
  }

  const baseDmg = 0.23 * totalAtk * dmgCoef * (1 + posBonus)
    * (1 + firstBusterBonus)
    * (1 + colorBuff / 100)
    * (1 + (agg.atkUp || 0) / 100)
    * (1 + (agg.powerMod || 0) / 100)
    * (critMult + critBuff / 100)
    * classAdv * attrAdv * classCorr
    * defMultiplier
    * (1 + (agg.independentMod || 0) / 100);

  return {
    baseDmg,
    min: Math.floor(baseDmg * 0.9),
    avg: Math.floor(baseDmg),
    max: Math.floor(baseDmg * 1.099),
  };
}

// ── Presets ──

const CARD_PRESETS = [
  { label: 'S1武勇链', query: 'B1B1B1', color: 'error' },
  { label: 'S2武勇链', query: 'B2B2B2', color: 'error' },
  { label: 'S3武勇链', query: 'B3B3B3', color: 'error' },
  { label: 'S3Arts链', query: 'A3A3A3', color: 'primary' },
  { label: 'S3Quick链', query: 'Q3Q3Q3', color: 'success' },
];

// ── Sub-component: Query result card ──

function QueryResultDisplay({ query, pool, servantStats, aggs, enemy, options }) {
  const prob = useMemo(() => {
    if (!pool || !query || query.length === 0) return null;
    return queryProb(pool, query);
  }, [pool, query]);

  const damage = useMemo(() => {
    if (!query || query.length === 0) return null;
    const firstCard = query[0];
    if (!firstCard) return null;
    const firstType = firstCard.type;

    let totalMin = 0;
    let totalAvg = 0;
    let totalMax = 0;
    const cardInfos = [];

    for (let i = 0; i < query.length; i++) {
      const card = query[i];
      const si = card.servant;
      const st = servantStats[si];
      if (!st) continue;

      const d = calcCardDmgForQuery({
        totalAtk: st.totalAtk,
        cardType: card.type,
        position: i,
        firstCardType: firstType,
        agg: aggs[si],
        svClass: st.svClass,
        svAttr: st.svAttr,
        enemy,
        options,
      });

      totalMin += d.min;
      totalAvg += d.avg;
      totalMax += d.max;
      cardInfos.push({ card, ...d });
    }

    return { min: totalMin, avg: totalAvg, max: totalMax, cards: cardInfos };
  }, [query, servantStats, aggs, enemy, options]);

  // Detect color chain (3+ cards of same color)
  const chainInfo = useMemo(() => {
    if (!query || query.length < 3) return null;
    const counts = {};
    for (const c of query) {
      counts[c.type] = (counts[c.type] || 0) + 1;
    }
    const chains = [];
    for (const [t, n] of Object.entries(counts)) {
      if (n >= 3) chains.push(t);
    }
    return chains.length > 0 ? chains : null;
  }, [query]);

  if (!query || query.length === 0) return null;

  return (
    <div style={{
      marginTop: 'var(--space-md)', padding: 'var(--space-md)',
      background: 'var(--surface-alt)', borderRadius: 'var(--radius)',
      border: '1px solid var(--border)',
    }}>
      {/* Card sequence as badges */}
      <div className="draw-pool" style={{ marginBottom: 'var(--space-sm)' }}>
        {query.map((card, i) => (
          <span key={i} className={'draw-badge draw-badge-' + card.type}>
            {card.type}<sub>{card.servant}</sub>
          </span>
        ))}
      </div>

      {/* Probability */}
      {prob !== null && (
        <div style={{ fontSize: 'var(--font-sm)', marginBottom: 'var(--space-xs)' }}>
          <span style={{ color: 'var(--text-muted)', marginRight: 'var(--space-sm)' }}>概率:</span>
          <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{pct(prob)}</span>
        </div>
      )}

      {/* Damage range */}
      {damage && (
        <div style={{ fontSize: 'var(--font-sm)', marginBottom: 'var(--space-xs)' }}>
          <span style={{ color: 'var(--text-muted)', marginRight: 'var(--space-sm)' }}>伤害:</span>
          <span style={{ color: 'var(--blue)', fontWeight: 700 }}>{fmtNum(damage.min)}</span>
          <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>~</span>
          <span style={{ color: 'var(--red)', fontWeight: 700 }}>{fmtNum(damage.max)}</span>
          <span style={{ color: 'var(--text-muted)', marginLeft: 'var(--space-xs)' }}>
            (avg <span style={{ fontWeight: 700, color: 'var(--green)' }}>{fmtNum(damage.avg)}</span>)
          </span>
        </div>
      )}

      {/* Color chain badge */}
      {chainInfo && (
        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
          色卡链:{' '}
          {chainInfo.map((c, idx) => {
            const name = { B: 'Buster', A: 'Arts', Q: 'Quick' }[c];
            const colorVar = { B: 'var(--buster)', A: 'var(--arts)', Q: 'var(--quick)' }[c];
            return (
              <span key={c}>
                {idx > 0 && ' + '}
                <span style={{ color: colorVar, fontWeight: 600 }}>{name} 3+</span>
              </span>
            );
          })}
          {' '}✓
        </div>
      )}
    </div>
  );
}

// ── Main component ──

export default function TeamCardQueryPanel() {
  const team = useStore((s) => s.team);
  const [queryStr, setQueryStr] = useState('');
  const query = useMemo(() => parseQuery(queryStr), [queryStr]);

  // Resolve all 3 team servants, compute stats and aggs, build card pool
  const { servantStats, aggs, pool, hasTeam } = useMemo(() => {
    const stats = {};
    const buffs = {};
    const decks = {};
    let hasAny = false;

    for (let i = 0; i < 3; i++) {
      const slot = team.servants[i];
      const si = i + 1;
      let sv = null;

      if (slot.isCustom && slot.customServant) {
        sv = slot.customServant;
        hasAny = true;
      } else if (slot.servantId) {
        sv = findServantById(slot.servantId, team.servants);
        if (sv) hasAny = true;
      }

      if (sv) {
        const config = slot.config || {};
        const atkLv = config.level >= 120
          ? getSv(sv, 'atk120')
          : config.level >= 100
            ? getSv(sv, 'atk100')
            : getSv(sv, 'atk90');

        stats[si] = {
          totalAtk: (atkLv || 0) + (config.fou || 0) + (config.ceAtk || 0) + (config.extraAtk || 0),
          svClass: getSv(sv, 'class') || 'Saber',
          svAttr: getSv(sv, 'attr') || 'Human',
        };

        buffs[si] = aggregateBuffs(
          slot.buffs || { sources: [] },
          sv,
          team.options || {},
        );

        decks[si] = getSv(sv, 'deck') || 'BBAAQ';
      }
    }

    // Build card pool (only when all 3 have decks, even if they're empty fill)
    let cardPool = null;
    const d1 = decks[1] || '';
    const d2 = decks[2] || '';
    const d3 = decks[3] || '';
    if (hasAny && d1.length === 5 && d2.length === 5 && d3.length === 5) {
      cardPool = buildPool(d1, d2, d3);
    }

    return { servantStats: stats, aggs: buffs, pool: cardPool, hasTeam: hasAny };
  }, [team]);

  return (
    <div className="section-card">
      <h2 className="panel-title">牌型查询 Card Query</h2>

      {!hasTeam && (
        <div style={{
          fontSize: 'var(--font-sm)', color: 'var(--text-muted)',
          padding: 'var(--space-md)', textAlign: 'center',
        }}>
          请先在组队配置中选择从者
        </div>
      )}

      {hasTeam && (
        <>
          {/* Preset buttons */}
          <div className="preset-row" style={{ marginBottom: 'var(--space-sm)' }}>
            {CARD_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                size="small"
                variant="outlined"
                color={preset.color}
                onClick={() => setQueryStr(preset.query)}
                sx={{
                  fontSize: 'var(--font-xs)', py: 0.25, px: 1,
                  minWidth: 'auto', lineHeight: 1.4,
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Query input */}
          <div className="draw-query">
            <input
              className="buff-input"
              style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '1px' }}
              value={queryStr}
              onChange={(e) => setQueryStr(
                e.target.value.toUpperCase().replace(/[^BAQ123]/g, ''),
              )}
              placeholder="例: A3A3A3  B1B2Q3"
            />
          </div>

          <div style={{
            fontSize: 'var(--font-xs)', color: 'var(--text-muted)',
            marginTop: 'var(--space-xs)',
          }}>
            字母=卡色(B/A/Q) 数字=从者编号(1/2/3)　例: A3A3A3 = 从者3的3张Arts
          </div>

          {/* Query result */}
          <QueryResultDisplay
            query={query}
            pool={pool}
            servantStats={servantStats}
            aggs={aggs}
            enemy={team.enemy}
            options={team.options}
          />
        </>
      )}
    </div>
  );
}
