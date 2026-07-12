import { useMemo, useState } from 'react';
import { useServant } from '@/hooks/useServant';
import useStore from '@/store/index';
import { calc3TValues } from '@/utils/calculations';

export default function ThreeTResult() {
  const servant = useServant();
  const config = useStore((s) => s.config);
  const buffs = useStore((s) => s.buffs);
  const enemy = useStore((s) => s.enemy);
  const options = useStore((s) => s.options);

  const [breakHP, setBreakHP] = useState('');

  const results = useMemo(() => {
    if (!servant) return [];
    return calc3TValues(servant, config, buffs, enemy, options);
  }, [servant, config, buffs, enemy, options]);

  if (!servant) return null;

  const totalDmg = results.reduce((s, r) => s + r.npDmg.avg, 0);
  const totalNp = results.reduce((s, r) => s + r.npGain, 0);
  const hp = parseInt(breakHP) || 0;
  const canKill = hp > 0 && totalDmg >= hp;

  return (
    <div className="section">
      <h2 className="panel-title">3T 连发模拟</h2>

      <div className="loop-summary">
        <div className="loop-summary-stat">
          <span className="loop-summary-label">3T 总伤害</span>
          <span className="loop-summary-value">{totalDmg.toLocaleString()}</span>
        </div>
        <div className="loop-summary-stat">
          <span className="loop-summary-label">总 NP 回收</span>
          <span className="loop-summary-value">{totalNp.toFixed(1)}%</span>
        </div>
        <div className="loop-hp-input">
          <label className="loop-summary-label">敌方 HP</label>
          <div className="break-bar-row">
            <input
              className="buff-input break-bar-input"
              type="number"
              value={breakHP}
              onChange={(e) => setBreakHP(e.target.value)}
              placeholder="0"
              min="0"
            />
            {hp > 0 && (
              <span className={'break-bar-result' + (canKill ? ' high' : ' low')}>
                {canKill ? '✓ 可击杀' : '✗ 无法击杀'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="loop-row">
        {results.map((r, i) => (
          <div key={i} className="loop-card">
            <div className="loop-turn">T{r.turn}</div>
            <div className="loop-dmg">{r.npDmg.avg.toLocaleString()}</div>
            <div className="loop-np">NP 回收 {r.npGain.toFixed(1)}%</div>
            <div className={r.npGain >= 100 ? 'loop-ok' : 'loop-fail'}>
              {r.npGain >= 100 ? '✓ 可连发' : '✗ 需补NP'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
