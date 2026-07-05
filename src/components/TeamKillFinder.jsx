import { useState, useMemo } from 'react';
import { calcAllPlayDamagesDetailed } from '@/utils/damageDistribution';

const fmtNum = (v) => Math.round(v).toLocaleString();

function CardBadge({ type, servant }) {
  const colorMap = { B: 'var(--buster)', A: 'var(--arts)', Q: 'var(--quick)', NP: 'var(--gold)' };
  return (
    <span className="draw-badge" style={{
      background: colorMap[type] || 'var(--text-muted)',
      color: '#fff',
      fontWeight: 700,
      fontSize: '11px',
      padding: '2px 6px',
      borderRadius: 3,
    }}>
      {type}<sub style={{ fontSize: 8, opacity: 0.8 }}>{servant}</sub>
    </span>
  );
}

function SequenceRow({ seq, rank, isKill, hpThreshold }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
      padding: 'var(--space-xs) var(--space-sm)',
      borderBottom: '1px solid var(--border-light)',
      background: isKill ? 'rgba(76, 175, 80, 0.08)' : undefined,
    }}>
      <span style={{ width: 28, fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
        #{rank}
      </span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {seq.cards.map((c, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CardBadge type={c.type} servant={c.servant} />
            {i < seq.cards.length - 1 && <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{'->'}</span>}
          </span>
        ))}
      </div>
      <span style={{ marginLeft: 'auto', fontSize: 'var(--font-sm)', fontWeight: 600, whiteSpace: 'nowrap' }}>
        <span style={{ color: 'var(--blue)' }}>{fmtNum(seq.min)}</span>
        <span style={{ color: 'var(--text-muted)', margin: '0 2px' }}>~</span>
        <span style={{ color: 'var(--red)' }}>{fmtNum(seq.max)}</span>
      </span>
    </div>
  );
}

export default function TeamKillFinder({ pool, servantStats, aggs, enemy, options }) {
  const [hpThreshold, setHpThreshold] = useState(100000);
  const [showCount, setShowCount] = useState(10);

  // Compute all detailed results
  const allSequences = useMemo(() => {
    if (!pool || pool.length === 0) return null;
    return calcAllPlayDamagesDetailed(pool, servantStats, aggs, enemy, options);
  }, [pool, servantStats, aggs, enemy, options]);

  // Filter by HP threshold (using damage = average damage)
  const killSequences = useMemo(() => {
    if (!allSequences) return [];
    return allSequences.filter(s => s.damage >= hpThreshold);
  }, [allSequences, hpThreshold]);

  // Top sequences (shown when no HP filter active)
  const topSequences = useMemo(() => {
    if (!allSequences) return [];
    return allSequences.slice(0, showCount);
  }, [allSequences, showCount]);

  if (!allSequences) {
    return (
      <div className="section-card">
        <h2 className="panel-title">击杀查询 Kill Finder</h2>
        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-md)' }}>
          请先配置完整的三人组队
        </div>
      </div>
    );
  }

  return (
    <div className="section-card">
      <h2 className="panel-title">击杀查询 Kill Finder</h2>

      {/* HP input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
        <label style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
          目标 HP
        </label>
        <input
          className="buff-input"
          type="number"
          style={{ width: 120 }}
          value={hpThreshold}
          onChange={(e) => setHpThreshold(Number(e.target.value) || 0)}
          min={0}
          step={10000}
        />
        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
          共 {allSequences.length.toLocaleString()} 种出牌 &middot; 致命 {killSequences.length} 种
        </span>
      </div>

      {/* Kill sequences */}
      {killSequences.length > 0 && (
        <>
          <h3 style={{ fontSize: 'var(--font-sm)', color: 'var(--green)', fontWeight: 700, marginBottom: 'var(--space-xs)', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
            致命牌型 (伤害 &ge; {fmtNum(hpThreshold)})
            <span style={{ fontWeight: 400, fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
              共 {killSequences.length} 种
            </span>
          </h3>
          <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 'var(--space-md)' }}>
            {killSequences.slice(0, Math.min(20, showCount)).map((seq, i) => (
              <SequenceRow key={i} seq={seq} rank={i + 1} isKill={true} hpThreshold={hpThreshold} />
            ))}
            {killSequences.length > Math.min(20, showCount) && (
              <button className="toggle-btn" onClick={() => setShowCount(prev => prev + 10)} style={{ width: '100%', marginTop: 'var(--space-xs)' }}>
                显示更多 ({Math.min(killSequences.length, showCount + 10)} / {killSequences.length})
              </button>
            )}
          </div>
        </>
      )}

      {/* Top sequences by damage */}
      <h3 style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>
        最高伤害 Top {Math.min(showCount, topSequences.length)}
      </h3>
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {topSequences.map((seq, i) => (
          <SequenceRow key={i} seq={seq} rank={i + 1} isKill={seq.damage >= hpThreshold} hpThreshold={hpThreshold} />
        ))}
      </div>
      {allSequences.length > showCount && (
        <button className="toggle-btn" onClick={() => setShowCount(prev => prev + 10)} style={{ width: '100%', marginTop: 'var(--space-xs)' }}>
          显示更多 ({Math.min(allSequences.length, showCount + 10)} / {allSequences.length})
        </button>
      )}

      {/* Stats summary */}
      <div style={{ marginTop: 'var(--space-sm)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
        最高伤害: {fmtNum(allSequences[0]?.max || 0)} &middot; 最低伤害: {fmtNum(allSequences[allSequences.length - 1]?.min || 0)} &middot; 致命率: {((killSequences.length / allSequences.length) * 100).toFixed(1)}%
      </div>
    </div>
  );
}
