export default function NPDamageResult({ result, servant, onViewDistribution }) {
  if (!result || !servant) return null;

  const d = result.details;
  const range = result.max - result.min;
  const avgPos = range > 0 ? Math.max(0, Math.min(100, ((result.avg - result.min) / range) * 100)) : 50;

  return (
    <div className="section-hero">
      <h2 className="panel-title">NP 伤害</h2>
      <div className="result-row">
        <div className="result-card">
          <div className="result-label">MIN</div>
          <div className="result-value min">{result.min.toLocaleString()}</div>
        </div>
        <div className="result-card">
          <div className="result-label">AVG</div>
          <div className="result-value avg">{result.avg.toLocaleString()}</div>
        </div>
        <div className="result-card">
          <div className="result-label">MAX</div>
          <div className="result-value max">{result.max.toLocaleString()}</div>
        </div>
      </div>

      <div className="np-damage-bar" aria-hidden="true">
        <div className="bar-track">
          <div className="bar-avg-marker" style={{ left: `${avgPos}%` }} />
        </div>
        <div className="bar-legend">
          <span>伤害波动范围</span>
          <span>AVG 落点 {avgPos.toFixed(0)}%</span>
        </div>
      </div>

      {d && (
        <div className="advantage-details">
          <span>
            <span className="adv-label">职阶克制</span>
            {d.svClass} -> {d.enClass} = {d.classAdv.toFixed(1)}&times;
          </span>
          <span>
            <span className="adv-label">阵营补正</span>
            {d.svAttr} -> {d.enAttr} = {d.attrAdv.toFixed(1)}&times;
          </span>
          <span>
            <span className="adv-label">职阶修正</span>
            {d.svClass} &times; {d.classCorr.toFixed(1)}
          </span>
        </div>
      )}

      {onViewDistribution && (
        <div className="np-actions">
          <button className="toggle-btn" onClick={onViewDistribution}>
            查看完整伤害分布 -&gt;
          </button>
        </div>
      )}
    </div>
  );
}
