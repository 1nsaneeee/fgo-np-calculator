export default function NPDamageResult({ result, servant }) {
  if (!result || !servant) return null;

  const d = result.details;

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
      {d && (
        <div className="advantage-details">
          <span>
            <span className="adv-label">职阶克制</span>
            {d.svClass} → {d.enClass} = {d.classAdv.toFixed(1)}&times;
          </span>
          <span>
            <span className="adv-label">阵营补正</span>
            {d.svAttr} → {d.enAttr} = {d.attrAdv.toFixed(1)}&times;
          </span>
          <span>
            <span className="adv-label">职阶修正</span>
            {d.svClass} &times; {d.classCorr.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
}
