import { useMemo } from 'react';
import { useServant } from '@/hooks/useServant';
import useStore from '@/store/index';
import { calc3TValues } from '@/utils/calculations';

export default function ThreeTResult() {
  const servant = useServant();
  const config = useStore((s) => s.config);
  const buffs = useStore((s) => s.buffs);
  const enemy = useStore((s) => s.enemy);
  const options = useStore((s) => s.options);

  const results = useMemo(() => {
    if (!servant) return [];
    return calc3TValues(servant, config, buffs, enemy, options);
  }, [servant, config, buffs, enemy, options]);

  if (!servant) return null;

  return (
    <div className="section-prominent">
      <h2 className="panel-title">3T Loop</h2>
      <div className="loop-row">
        {results.map((r, i) => (
          <div key={i} className="loop-card">
            <div className="loop-turn">T{r.turn}</div>
            <div className="loop-dmg">{r.npDmg.avg.toLocaleString()}</div>
            <div className="loop-np">NP回 {r.npGain.toFixed(1)}%</div>
            <div className={r.npGain >= 100 ? 'loop-ok' : 'loop-fail'}>
              {r.npGain >= 100 ? '\u2713 可连发' : '\u2717 需补NP'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
