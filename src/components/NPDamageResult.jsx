export default function NPDamageResult({ result, servant }) {
  if (!result || !servant) return null;

  return (
    <div className="section-hero">
      <h2 className="panel-title">NP Damage</h2>
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
    </div>
  );
}
