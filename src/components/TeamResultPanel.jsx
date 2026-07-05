import { useState, useMemo } from 'react';
import useStore from '@/store/index';
import { getSv } from '@/utils/helpers';
import { buildPool } from '@/utils/cardDraw';
import { aggregateBuffs } from '@/utils/calculations';
import {
  calcDamageDistribution,
  calcAllPlayDamages,
  calcAllPlayDamagesDetailed,
  calcClearRate,
  calcWeightedPassRate,
  formatCard,
} from '@/utils/damageDistribution';
import DamageHistogram from '@/components/DamageHistogram';
import TeamKillFinder from '@/components/TeamKillFinder';
import { SERVANT_DB } from '@/data/servantDb';

function pct(v) {
  return (v * 100).toFixed(1) + '%';
}

function CardBadge({ card }) {
  if (!card) return null;
  const cls = card.type === 'NP' ? 'draw-badge-NP' : 'draw-badge-' + card.type;
  return (
    <span className={'draw-badge ' + cls}>
      {card.type}<sub>{card.servant}</sub>
    </span>
  );
}

function DeckBadges({ deck }) {
  if (!deck || deck.length !== 5) return null;
  return (
    <div className="draw-pool">
      {deck.split('').map((ch, i) => (
        <span key={i} className={'draw-badge draw-badge-' + ch}>{ch}</span>
      ))}
    </div>
  );
}

/**
 * Resolve servant data for a team slot.
 * Looks up from servantList by ID, or uses customServant directly.
 */
function resolveServant(slot, servantList) {
  if (!slot) return null;
  if (slot.isCustom && slot.customServant) return slot.customServant;
  // Priority: cached resolved data > servantList (API basic data) > SERVANT_DB fallback
  if (slot._resolvedServant) return slot._resolvedServant;
  if (!slot.servantId) return null;
  // Try servantList (API basic data) first — note: may not have full calculation data
  const fromList = servantList.find(s => s.id === slot.servantId);
  if (fromList) return fromList;
  // Fall back to SERVANT_DB
  return SERVANT_DB.find(s => s[0] === slot.servantId) || null;
}

/**
 * Compute total ATK for a servant slot based on config.
 */
function getTotalAtk(sv, config) {
  if (!sv) return null;
  const baseAtk = config.level >= 120 ? getSv(sv, 'atk120')
    : config.level >= 100 ? getSv(sv, 'atk100')
    : getSv(sv, 'atk90');
  return baseAtk + (config.fou || 0) + (config.ceAtk || 0) + (config.extraAtk || 0);
}

export default function TeamResultPanel() {
  const team = useStore((s) => s.team);
  const servantList = useStore((s) => s.servantList);
  const slots = team?.servants || [];
  const enemy = team?.enemy || { class: 'Saber', attr: 'Human', def: 0 };
  const options = team?.options || { isCrit: false, overkill: false };

  // Local state: HP threshold
  const [hpThreshold, setHpThreshold] = useState(100000);

  // NP toggle per servant (local state since teamSlice doesn't have it)
  const [npEnabled, setNpEnabled] = useState([false, false, true]);

  // ── Resolve servant data ──
  const servants = useMemo(() => {
    return slots.map((slot) => resolveServant(slot, servantList));
  }, [slots, servantList]);

  const hasAnyServant = useMemo(() => {
    return servants.some(s => s !== null);
  }, [servants]);

  // ── Atlas IDs and names for summary (keeps S1/S2/S3 stable even before selection) ──
  const servantIds = useMemo(() => {
    return slots.map(s => s?.servantId ?? null);
  }, [slots]);

  // ── Total ATK per servant ──
  const totalAtks = useMemo(() => {
    return slots.map((slot, i) => {
      const sv = servants[i];
      if (!sv) return null;
      return getTotalAtk(sv, slot.config);
    });
  }, [slots, servants]);

  // ── Decks ──
  const decks = useMemo(() => {
    return servants.map(sv => {
      if (!sv) return null;
      return getSv(sv, 'deck') || 'BBAAQ';
    });
  }, [servants]);

  // ── Classes ──
  const classes = useMemo(() => {
    return servants.map(sv => sv ? (getSv(sv, 'class') || 'Berserker') : null);
  }, [servants]);

  // ── Attributes ──
  const attrs = useMemo(() => {
    return servants.map(sv => sv ? (getSv(sv, 'attr') || 'Human') : null);
  }, [servants]);

  // ── NP colors ──
  const npColors = useMemo(() => {
    return servants.map(sv => sv ? (getSv(sv, 'npColor') || 'Buster') : 'Buster');
  }, [servants]);

  // ── NP multipliers ──
  const npMults = useMemo(() => {
    return slots.map((slot, i) => {
      const sv = servants[i];
      if (!sv) return 300;
      const npLev = Math.min(5, Math.max(1, slot.config.npLevel || 1));
      const npKeys = ['np1', 'np2', 'np3', 'np4', 'np5'];
      return getSv(sv, npKeys[npLev - 1]) || 300;
    });
  }, [slots, servants]);

  // ── Aggregate buffs per servant ──
  const aggrs = useMemo(() => {
    return slots.map((slot, i) => {
      const sv = servants[i];
      const buffs = slot.buffs || { sources: [] };
      // aggregateBuffs handles null servant gracefully (skips passives)
      return aggregateBuffs(buffs, sv, options);
    });
  }, [slots, servants, options]);

  // ── Build aggs object for distribution engine (1-indexed) ──
  const aggs = useMemo(() => ({
    1: aggrs[0] || { atkUp: 0, busterUp: 0, artsUp: 0, quickUp: 0, defDown: 0,
      critDmg: 0, busterCritDmg: 0, artsCritDmg: 0, quickCritDmg: 0,
      starGen: 0, npStrength: 0, npRate: 0, powerMod: 0, independentMod: 0, flatDmg: 0 },
    2: aggrs[1] || { atkUp: 0, busterUp: 0, artsUp: 0, quickUp: 0, defDown: 0,
      critDmg: 0, busterCritDmg: 0, artsCritDmg: 0, quickCritDmg: 0,
      starGen: 0, npStrength: 0, npRate: 0, powerMod: 0, independentMod: 0, flatDmg: 0 },
    3: aggrs[2] || { atkUp: 0, busterUp: 0, artsUp: 0, quickUp: 0, defDown: 0,
      critDmg: 0, busterCritDmg: 0, artsCritDmg: 0, quickCritDmg: 0,
      starGen: 0, npStrength: 0, npRate: 0, powerMod: 0, independentMod: 0, flatDmg: 0 },
  }), [aggrs]);

  // ── NP config for buildPool ──
  const npConfigs = useMemo(() => ({
    1: { enabled: npEnabled[0], npColor: npColors[0] },
    2: { enabled: npEnabled[1], npColor: npColors[1] },
    3: { enabled: npEnabled[2], npColor: npColors[2] },
  }), [npEnabled, npColors]);

  // Check all 3 decks are valid
  const allDecksValid = useMemo(() => {
    return decks[0] && decks[1] && decks[2]
      && decks[0].length === 5 && decks[1].length === 5 && decks[2].length === 5;
  }, [decks]);

  const allAtksValid = useMemo(() => {
    return totalAtks[0] && totalAtks[1] && totalAtks[2]
      && totalAtks[0] > 0 && totalAtks[1] > 0 && totalAtks[2] > 0;
  }, [totalAtks]);

  const allValid = allDecksValid && allAtksValid;

  // ── Build card pool ──
  const pool = useMemo(() => {
    if (!allValid) return null;
    return buildPool(decks[0], decks[1], decks[2], npConfigs);
  }, [decks, npConfigs, allValid]);

  // ── Servant stats object for distribution engine ──
  const servantStats = useMemo(() => {
    if (!allValid) return null;
    return {
      1: { totalAtk: totalAtks[0], svClass: classes[0], svAttr: attrs[0],
        npMult: npMults[0], npColor: npColors[0] },
      2: { totalAtk: totalAtks[1], svClass: classes[1], svAttr: attrs[1],
        npMult: npMults[1], npColor: npColors[1] },
      3: { totalAtk: totalAtks[2], svClass: classes[2], svAttr: attrs[2],
        npMult: npMults[2], npColor: npColors[2] },
    };
  }, [allValid, totalAtks, classes, attrs, npMults, npColors]);

  // ── Distribution (hand-level) — for best/worst plays, stats ──
  const distResult = useMemo(() => {
    if (!pool || !servantStats) return null;
    return calcDamageDistribution(pool, servantStats, aggs, enemy, options);
  }, [pool, servantStats, aggs, enemy, options]);

  // ── All 3-card play damages (P(n,3) granularity) — for histogram ──
  const allDamages = useMemo(() => {
    if (!pool || !servantStats) return null;
    return calcAllPlayDamages(pool, servantStats, aggs, enemy, options);
  }, [pool, servantStats, aggs, enemy, options]);

  // ── Clear rate (exact, from all play damages) ──
  const clearRate = useMemo(() => {
    if (!allDamages || allDamages.length === 0 || hpThreshold <= 0) return null;
    const pass = allDamages.filter(d => d >= hpThreshold).length;
    return pass / allDamages.length;
  }, [allDamages, hpThreshold]);

  // ── Detailed plays (with multiplicity) + weighted pass rate ──
  const detailedPlays = useMemo(() => {
    if (!pool || !servantStats) return null;
    return calcAllPlayDamagesDetailed(pool, servantStats, aggs, enemy, options);
  }, [pool, servantStats, aggs, enemy, options]);

  const totalPerms = useMemo(() => {
    const n = pool?.length || 0;
    return n * (n - 1) * (n - 2); // P(n,3)
  }, [pool]);

  const fitPassRate = useMemo(() => {
    if (!detailedPlays || hpThreshold <= 0) return null;
    return calcWeightedPassRate(detailedPlays, totalPerms, hpThreshold);
  }, [detailedPlays, totalPerms, hpThreshold]);

  // ── Hand-based clear rate (per-hand best play) ──
  const handClearRate = useMemo(() => {
    if (!distResult || distResult.length === 0 || hpThreshold <= 0) return null;
    return calcClearRate(distResult, hpThreshold);
  }, [distResult, hpThreshold]);

  // ── Overall best/worst extremes across all hands ──
  const extremes = useMemo(() => {
    if (!distResult || distResult.length === 0) return null;
    let best = distResult[0];
    let worst = distResult[0];
    for (const r of distResult) {
      if (r.maxDamage > best.maxDamage) best = r;
      if (r.minDamage < worst.minDamage) worst = r;
    }
    return { best, worst };
  }, [distResult]);

  // ── Stats (median, mean, P25, P75) from hand-level max damages ──
  const stats = useMemo(() => {
    if (!distResult) return null;
    const damages = distResult.map(r => r.maxDamage);
    damages.sort((a, b) => a - b);
    const sum = damages.reduce((s, d) => s + d, 0);
    return {
      median: damages[Math.floor(damages.length / 2)],
      mean: Math.floor(sum / damages.length),
      p25: damages[Math.floor(damages.length * 0.25)],
      p75: damages[Math.floor(damages.length * 0.75)],
    };
  }, [distResult]);

  // ── Empty state ──
  if (!hasAnyServant) {
    return (
      <div className="section-card">
        <h2 className="panel-title">伤害分布 Damage Distribution</h2>
        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', padding: 'var(--space-md) 0' }}>
          请先配置三从者
        </div>
      </div>
    );
  }

  return (
    <div className="section-card">
      <h2 className="panel-title">伤害分布 Damage Distribution</h2>

      {/* ── Team summary ── */}
      <div style={{
        background: 'var(--surface-alt)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: 'var(--space-sm) var(--space-md)',
        marginBottom: 'var(--space-md)',
        display: 'flex',
        gap: 'var(--space-md)',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 'var(--font-xs)',
        color: 'var(--text-muted)',
      }}>
        {slots.map((slot, i) => {
          const sv = servants[i];
          const name = sv ? getSv(sv, 'name') : '—';
          const lv = slot.config.level || 90;
          const np = slot.config.npLevel || 1;
          return (
            <div key={i} style={{
              flex: '1 1 150px',
              minWidth: 120,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}>
              <div style={{ fontWeight: 700 }}>
                S{i + 1}: <span style={{ color: 'var(--text)' }}>{name}</span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
                <span>
                  Lv<span style={{ color: 'var(--text)', fontWeight: 600 }}>{lv}</span>
                  {' '}NP<span style={{ color: 'var(--text)', fontWeight: 600 }}>{np}</span>
                </span>
                <DeckBadges deck={decks[i]} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '10px' }}>
                <input
                  type="checkbox"
                  checked={npEnabled[i]}
                  onChange={(e) => {
                    const next = [...npEnabled];
                    next[i] = e.target.checked;
                    setNpEnabled(next);
                  }}
                  style={{ margin: 0, cursor: 'pointer' }}
                  id={`team-np-toggle-${i}`}
                />
                <label htmlFor={`team-np-toggle-${i}`} style={{ cursor: 'pointer' }}>
                  NP入池 {npColors[i]}
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Stats Row ── */}
      {allValid && (
        <div className="dist-stats-row">
          {/* HP Input */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 130 }}>
            <label style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>
              敌方血量 Enemy HP
            </label>
            <input
              className="buff-input"
              style={{ width: 130 }}
              type="number"
              value={hpThreshold}
              onChange={(e) => setHpThreshold(Number(e.target.value) || 0)}
              min={0}
              step={10000}
            />
          </div>

          {/* Divider */}
          <div style={{ width: 1, background: 'var(--border-light)' }} />

          {/* Clear Rate */}
          {clearRate !== null && (
            <div className="dist-stat-card" style={{ minWidth: 120 }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 1 }}>通关率(全局)</div>
              <div style={{
                fontSize: 'var(--font-xl)', fontWeight: 800,
                color: clearRate >= 0.8 ? 'var(--green)' : clearRate >= 0.5 ? 'var(--gold)' : 'var(--red)'
              }}>{pct(clearRate)}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {allDamages ? allDamages.filter(d => d >= hpThreshold).length : 0} / {allDamages ? allDamages.length : 0} 种
              </div>
            </div>
          )}
          {handClearRate !== null && fitPassRate !== null && (
            <div className="dist-stat-card" style={{ minWidth: 140 }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 1 }}>通关率(拟合)</div>
              <div style={{
                fontSize: 'var(--font-xl)', fontWeight: 800,
                color: fitPassRate.weighted >= 0.8 ? 'var(--green)' : fitPassRate.weighted >= 0.5 ? 'var(--gold)' : 'var(--red)'
              }}>{pct(fitPassRate.weighted)}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                出牌概率 × 击破率
              </div>
            </div>
          )}

          {/* Median */}
          {stats && (
            <div className="dist-stat-card">
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 1 }}>中位数 Median</div>
              <div style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: 'var(--accent)' }}>{stats.median.toLocaleString()}</div>
            </div>
          )}

          {/* Mean */}
          {stats && (
            <div className="dist-stat-card">
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 1 }}>均值 Avg</div>
              <div style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: 'var(--text-secondary)' }}>{stats.mean.toLocaleString()}</div>
            </div>
          )}

          {/* P25–P75 */}
          {stats && (
            <div className="dist-stat-card">
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 1 }}>P25 – P75</div>
              <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {stats.p25.toLocaleString()} – {stats.p75.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Best/Worst Plays ── */}
      {extremes && (
        <div className="dist-best-worst-grid">
          <div className="dist-best-card">
            <div className="dist-play-label" style={{ color: 'var(--green)' }}>
              最优出牌 Best Play
            </div>
            <div className="dist-play-damage">
              {extremes.best.maxDamage.toLocaleString()}
            </div>
            <div className="draw-pool">
              {extremes.best.bestPlay && extremes.best.bestPlay.map((card, i) => (
                <CardBadge key={i} card={card} />
              ))}
            </div>
          </div>
          <div className="dist-worst-card">
            <div className="dist-play-label" style={{ color: 'var(--red)' }}>
              最劣出牌 Worst Play
            </div>
            <div className="dist-play-damage">
              {extremes.worst.minDamage.toLocaleString()}
            </div>
            <div className="draw-pool">
              {extremes.worst.worstPlay && extremes.worst.worstPlay.map((card, i) => (
                <CardBadge key={i} card={card} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Damage Histogram ── */}
      {allDamages && allDamages.length > 0 && (
        <DamageHistogram damages={allDamages} hpThreshold={hpThreshold} />
      )}

      {/* ── Kill Finder ── */}
      <TeamKillFinder
        pool={pool}
        servantStats={servantStats}
        aggs={aggs}
        enemy={enemy}
        options={options}
      />
    </div>
  );
}
