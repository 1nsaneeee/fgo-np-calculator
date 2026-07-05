// src/components/SingleDamageDist.jsx
// Single-servant damage distribution — shows best/worst card plays, clear rate, damage range.
import { useState, useMemo } from 'react';
import useStore from '@/store/index';
import { useServant } from '@/hooks/useServant';
import { getSv } from '@/utils/helpers';
import { aggregateBuffs } from '@/utils/calculations';
import { calcAllPlayDamagesDetailed } from '@/utils/damageDistribution';
import DamageHistogram from '@/components/DamageHistogram';

const CARDS = ['B', 'A', 'Q'];
const CARD_COLORS = { B: 'var(--buster)', A: 'var(--arts)', Q: 'var(--quick)' };

function fmtNum(v) { return Math.round(v).toLocaleString(); }

function CardBadge({ type }) {
  return (
    <span className="draw-badge" style={{
      background: CARD_COLORS[type] || '#666', color: '#fff',
      fontWeight: 700, fontSize: '11px', padding: '2px 6px', borderRadius: 3,
    }}>{type}</span>
  );
}

/** Build a 5-card pool from a single servant's deck */
function buildSinglePool(deck, servantId) {
  return (deck || 'BBAAQ').split('').map(ch => ({ type: ch, servant: servantId }));
}

export default function SingleDamageDist() {
  const servant = useServant();
  const config = useStore(s => s.config);
  const buffs = useStore(s => s.buffs);
  const enemy = useStore(s => s.enemy);
  const options = useStore(s => s.options);

  const [hpThreshold, setHpThreshold] = useState(50000);

  // Resolve single-servant data
  const svData = useMemo(() => {
    if (!servant) return null;
    const deck = getSv(servant, 'deck') || 'BBAAQ';
    const svClass = getSv(servant, 'class') || 'Saber';
    const svAttr = getSv(servant, 'attr') || 'Human';
    const atkLv = config.level >= 120 ? getSv(servant, 'atk120')
      : config.level >= 100 ? getSv(servant, 'atk100')
      : getSv(servant, 'atk90');
    const totalAtk = (atkLv || 0) + (config.fou || 0) + (config.ceAtk || 0) + (config.extraAtk || 0);
    return { deck, svClass, svAttr, totalAtk };
  }, [servant, config]);

  // Aggregate buffs
  const agg = useMemo(() => {
    return aggregateBuffs(buffs, servant, options);
  }, [buffs, servant, options]);

  // All possible 3-card plays: P(n,3) from the 5-card deck, deduplicated by card type sequence
  const allPlays = useMemo(() => {
    if (!svData || svData.totalAtk <= 0) return null;
    const pool = buildSinglePool(svData.deck, 1);
    const servantStats = { 1: { totalAtk: svData.totalAtk, svClass: svData.svClass, svAttr: svData.svAttr, npMult: 450, npColor: 'Buster' } };
    const aggs = { 1: agg };
    return calcAllPlayDamagesDetailed(pool, servantStats, aggs, enemy, options);
  }, [svData, agg, enemy, options]);

  // Stats
  const stats = useMemo(() => {
    if (!allPlays || allPlays.length === 0) return null;
    const damages = allPlays.map(p => p.damage);
    const sum = damages.reduce((s, d) => s + d, 0);
    return {
      max: allPlays[0],
      min: allPlays[allPlays.length - 1],
      median: damages[Math.floor(damages.length / 2)],
      mean: Math.floor(sum / damages.length),
      count: allPlays.length,
      kills: allPlays.filter(p => p.damage >= hpThreshold).length,
      handKill: allPlays.length > 0 && allPlays[0].damage >= hpThreshold,  // best play can kill?
    };
  }, [allPlays, hpThreshold]);

  if (!servant) {
    return (
      <div className="section-card">
        <h2 className="panel-title">伤害分布 Damage Distribution</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
          请先从从者列表中选择一位从者
        </p>
      </div>
    );
  }

  if (!allPlays) {
    return (
      <div className="section-card">
        <h2 className="panel-title">伤害分布 Damage Distribution</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
          计算中...
        </p>
      </div>
    );
  }

  return (
    <div className="section-card">
      <h2 className="panel-title">伤害分布 Damage Distribution</h2>

      {/* HP input + stats row */}
      <div className="dist-stats-row" style={{ marginBottom: 'var(--space-md)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
          <label style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>
            敌方血量 Enemy HP
          </label>
          <input
            className="buff-input"
            type="number"
            value={hpThreshold}
            onChange={e => setHpThreshold(Number(e.target.value) || 0)}
            min={0} step={10000}
            style={{ width: 120 }}
          />
        </div>

        <div style={{ width: 1, background: 'var(--border-light)' }} />

        {stats && (
          <>
            <div className="dist-stat-card" style={{ minWidth: 100 }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>致命率(全局)</div>
              <div style={{
                fontSize: 'var(--font-lg)', fontWeight: 800,
                color: (stats.kills / stats.count) >= 0.5 ? 'var(--green)' : 'var(--red)',
              }}>
                {((stats.kills / stats.count) * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {stats.kills} / {stats.count} 种出牌
              </div>
            </div>
            <div className="dist-stat-card" style={{ minWidth: 80 }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>致命率(实际)</div>
              <div style={{
                fontSize: 'var(--font-lg)', fontWeight: 800,
                color: stats.handKill ? 'var(--green)' : 'var(--red)',
              }}>
                {stats.handKill ? '✓ 可击杀' : '✗ 无法击杀'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                最优出牌判定
              </div>
            </div>

            <div className="dist-stat-card" style={{ minWidth: 70 }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>最高 Max</div>
              <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--green)' }}>
                {fmtNum(stats.max.max)}
              </div>
            </div>

            <div className="dist-stat-card" style={{ minWidth: 70 }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>中位 Median</div>
              <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--accent)' }}>
                {fmtNum(stats.median)}
              </div>
            </div>

            <div className="dist-stat-card" style={{ minWidth: 70 }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>最低 Min</div>
              <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--red)' }}>
                {fmtNum(stats.min.min)}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Best / Worst plays */}
      {stats && (
        <div className="dist-best-worst-grid" style={{ marginBottom: 'var(--space-md)' }}>
          <div className="dist-best-card">
            <div className="dist-play-label" style={{ color: 'var(--green)', marginBottom: 4 }}>
              最高伤害 Best Play
            </div>
            <div className="dist-play-damage" style={{ fontSize: 'var(--font-md)', fontWeight: 700, marginBottom: 4 }}>
              {fmtNum(stats.max.damage)} ({fmtNum(stats.max.min)} ~ {fmtNum(stats.max.max)})
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {stats.max.cards.map((c, i) => <CardBadge key={i} type={c.type} />)}
            </div>
          </div>
          <div className="dist-worst-card">
            <div className="dist-play-label" style={{ color: 'var(--red)', marginBottom: 4 }}>
              最低伤害 Worst Play
            </div>
            <div className="dist-play-damage" style={{ fontSize: 'var(--font-md)', fontWeight: 700, marginBottom: 4 }}>
              {fmtNum(stats.min.damage)} ({fmtNum(stats.min.min)} ~ {fmtNum(stats.min.max)})
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {stats.min.cards.map((c, i) => <CardBadge key={i} type={c.type} />)}
            </div>
          </div>
        </div>
      )}

      {/* Top 5 plays */}
      <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)' }}>
        伤害排名 Top 5
      </h3>
      <div style={{ marginBottom: 'var(--space-md)' }}>
        {allPlays.slice(0, 5).map((play, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
            padding: '2px 0', borderBottom: '1px solid var(--border-light)',
            background: play.damage >= hpThreshold ? 'rgba(76,175,80,0.06)' : undefined,
          }}>
            <span style={{ width: 22, fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>#{i + 1}</span>
            <div style={{ display: 'flex', gap: 3 }}>
              {play.cards.map((c, j) => <CardBadge key={j} type={c.type} />)}
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 'var(--font-sm)', fontWeight: 600 }}>
              <span style={{ color: 'var(--blue)' }}>{fmtNum(play.min)}</span>
              <span style={{ color: 'var(--text-muted)', margin: '0 3px' }}>~</span>
              <span style={{ color: 'var(--red)' }}>{fmtNum(play.max)}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Histogram */}
      <DamageHistogram damages={allPlays.map(p => p.damage)} hpThreshold={hpThreshold} />
    </div>
  );
}
