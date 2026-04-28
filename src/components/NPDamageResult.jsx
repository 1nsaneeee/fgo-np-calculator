import { getSv } from '@/utils/helpers';
import { NP_COLOR_CARD_MULT } from '@/constants/gameData';

export default function NPDamageResult({ result, servant, config, buffs, enemy, options }) {
  if (!result || !servant) return null;

  const agg = result.details?.agg;
  const svClass = getSv(servant, 'class');
  const npColor = getSv(servant, 'npColor');
  const npKeys = ['np1', 'np2', 'np3', 'np4', 'np5'];
  const npMult = getSv(servant, npKeys[(config.npLevel || 1) - 1]);

  return (
    <div className="section-card">
      <h2 className="panel-title">NP Damage Detail</h2>
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
      {agg && (
        <div style={{ marginTop: 10, fontSize: 'var(--font-sm)', color: 'var(--text-muted)', lineHeight: 1.8 }}>
          <div>总ATK: {result.totalAtk} | 宝具倍率: {npMult}% | 色卡x{NP_COLOR_CARD_MULT[npColor]}</div>
          <div>克制: {svClass}&rarr;{enemy.class} x{result.details.classAdv.toFixed(1)} | 阵营: x{result.details.attrAdv.toFixed(2)} | 补正: x{result.details.classCorr}</div>
          <div>ATK Buff: +{Math.round(agg.atkUp)}% | DEF Down: {Math.round(agg.defDown)}% | {npColor}魔放: +{Math.round(npColor === 'Buster' ? agg.busterUp : npColor === 'Arts' ? agg.artsUp : agg.quickUp)}%</div>
          <div>宝威: +{Math.round(agg.npStrength)}% | 特攻: +{Math.round(agg.powerMod)}% | 固定: +{Math.round(agg.flatDmg)}</div>
          <div>敌方防御: {enemy.def}% (减伤x{Math.round((1 - enemy.def / 100) * 100)}%)</div>
        </div>
      )}
    </div>
  );
}
