// src/components/NPDamageResult.jsx - 极简结果展示
export default function NPDamageResult({ result, servant, onViewDistribution }) {
  if (!result || !servant) return null;

  const d = result.details;
  const range = result.max - result.min;
  const avgPos = range > 0 ? Math.max(0, Math.min(100, ((result.avg - result.min) / range) * 100)) : 50;

  return (
    <div className="section-card">
      <h2 className="panel-title">NP 伤害</h2>
      
      {/* 伤害数值 */}
      <div className="result-row">
        <div className="result-card">
          <div className="result-label">最小</div>
          <div className="result-value min">{result.min.toLocaleString()}</div>
        </div>
        <div className="result-card">
          <div className="result-label">平均</div>
          <div className="result-value avg">{result.avg.toLocaleString()}</div>
        </div>
        <div className="result-card">
          <div className="result-label">最大</div>
          <div className="result-value max">{result.max.toLocaleString()}</div>
        </div>
      </div>

      {/* 伤害波动条 */}
      <div className="np-damage-bar" aria-hidden="true">
        <div className="bar-track">
          <div className="bar-avg-marker" style={{ left: `${avgPos}%` }} />
        </div>
        <div className="bar-legend">
          <span>最小</span>
          <span>平均 {avgPos.toFixed(0)}%</span>
          <span>最大</span>
        </div>
      </div>

      {/* 克制详情 */}
      {d && (
        <div className="advantage-details">
          <div className="adv-row">
            <span className="adv-label">职阶克制</span>
            <span className="adv-value">{d.svClass} → {d.enClass} = {d.classAdv.toFixed(1)}×</span>
          </div>
          <div className="adv-row">
            <span className="adv-label">阵营补正</span>
            <span className="adv-value">{d.svAttr} → {d.enAttr} = {d.attrAdv.toFixed(1)}×</span>
          </div>
          <div className="adv-row">
            <span className="adv-label">职阶修正</span>
            <span className="adv-value">{d.svClass} × {d.classCorr.toFixed(1)}</span>
          </div>
        </div>
      )}

      {/* 查看分布按钮 */}
      {onViewDistribution && (
        <div className="np-actions">
          <button className="btn" onClick={onViewDistribution}>
            查看完整伤害分布 →
          </button>
        </div>
      )}
    </div>
  );
}
