import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { calcClearRate } from '@/utils/damageDistribution';

function fmtDmg(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 10000) return (n / 1000).toFixed(0) + 'k';
  return n.toLocaleString();
}

function fmtPct(v) { return v.toFixed(0) + '%'; }

function CustomTooltip({ active, payload, hpThreshold }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  const above = hpThreshold > 0 && d.damage >= hpThreshold;
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: 'var(--space-sm) var(--space-md)',
      fontSize: 'var(--font-sm)',
      boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', marginBottom: 2 }}>
        第 {d.rank} 种出牌 · 百分位 {fmtPct(d.pct)}
      </div>
      <div style={{ fontWeight: 700, color: 'var(--text)' }}>
        {d.damage.toLocaleString()}
      </div>
      {above && (
        <div style={{ color: 'var(--green)', fontSize: 'var(--font-xs)', fontWeight: 600 }}>
          超过阈值
        </div>
      )}
    </div>
  );
}

export default function DamageHistogram({ damages, hpThreshold }) {
  // Build exact sorted CDF — every P(15,3) play is an individual data point
  const data = useMemo(() => {
    if (!damages || damages.length === 0) return null;
    const sorted = [...damages].sort((a, b) => a - b);
    return sorted.map((d, i) => ({
      rank: i + 1,
      damage: d,
      pct: ((i + 1) / sorted.length) * 100,
    }));
  }, [damages]);

  const passCount = useMemo(() => {
    if (!damages || hpThreshold <= 0) return 0;
    return damages.filter(d => d >= hpThreshold).length;
  }, [damages, hpThreshold]);

  const clearRate = useMemo(() => {
    if (!damages || damages.length === 0) return 0;
    return passCount / damages.length;
  }, [damages, passCount]);

  if (!data) return null;

  return (
    <div className="section" style={{ marginTop: 'var(--space-md)' }}>
      <h3 className="panel-title">伤害分布 Damage CDF</h3>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-md)',
      }}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
            <XAxis
              dataKey="pct"
              type="number"
              domain={[0, 100]}
              tickFormatter={fmtPct}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
              tickCount={6}
              label={{ value: '累计百分位', position: 'insideBottom', offset: -4, fontSize: 10, fill: 'var(--text-muted)' }}
            />
            <YAxis
              dataKey="damage"
              type="number"
              tickFormatter={fmtDmg}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
              width={48}
              domain={['dataMin', 'dataMax']}
            />
            <Tooltip content={<CustomTooltip hpThreshold={hpThreshold} />} />
            {hpThreshold > 0 && (
              <ReferenceLine
                y={hpThreshold}
                stroke="var(--red)"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                ifOverflow="extendDomain"
                label={{
                  value: fmtDmg(hpThreshold),
                  position: 'right',
                  fill: 'var(--red)',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="damage"
              stroke="var(--accent)"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-lg)',
          justifyContent: 'center', marginTop: 'var(--space-sm)',
          fontSize: 'var(--font-xs)', color: 'var(--text-muted)', flexWrap: 'wrap',
        }}>
          <span>总出牌: <b style={{ color: 'var(--text)' }}>{(damages || []).length.toLocaleString()}</b></span>
          {hpThreshold > 0 && (
            <>
              <span>超过 {fmtDmg(hpThreshold)}: <b style={{ color: 'var(--green)' }}>{passCount.toLocaleString()}</b></span>
              <span>通关率: <b style={{ color: 'var(--green)' }}>{(clearRate * 100).toFixed(1)}%</b></span>
            </>
          )}
          <span style={{ color: 'var(--red)' }}>— 阈值线 {fmtDmg(hpThreshold)}</span>
        </div>
      </div>
    </div>
  );
}
