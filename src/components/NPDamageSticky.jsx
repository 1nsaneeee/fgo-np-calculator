import { getSv } from '@/utils/helpers';

export default function NPDamageSticky({ result, servant, config }) {
  if (!result || !servant) {
    return (
      <div className="np-sticky-card">
        <div className="np-sticky-title">NP DAMAGE</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>Select a servant</div>
      </div>
    );
  }

  const npColor = getSv(servant, 'npColor');
  const npKeys = ['np1', 'np2', 'np3', 'np4', 'np5'];
  const npMult = getSv(servant, npKeys[(config.npLevel || 1) - 1]);
  const npColorHex = npColor === 'Buster' ? 'var(--buster)' : npColor === 'Arts' ? 'var(--arts)' : 'var(--quick)';

  return (
    <div className="np-sticky-card">
      <div className="np-sticky-title" style={{ color: npColorHex }}>
        NP DAMAGE · {npColor} · NP{config.npLevel} ({npMult}%)
      </div>
      <div className="np-sticky-values">
        <div className="np-sticky-val">
          <div className="vlabel">MIN</div>
          <div className="vnum min">{result.min.toLocaleString()}</div>
        </div>
        <div className="np-sticky-val">
          <div className="vlabel">AVG</div>
          <div className="vnum avg">{result.avg.toLocaleString()}</div>
        </div>
        <div className="np-sticky-val">
          <div className="vlabel">MAX</div>
          <div className="vnum max">{result.max.toLocaleString()}</div>
        </div>
      </div>
      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 6 }}>
        ATK: {result.totalAtk}
      </div>
    </div>
  );
}
