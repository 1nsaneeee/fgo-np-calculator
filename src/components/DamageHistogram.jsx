import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { buildHistogram } from '@/utils/damageDistribution';

function fmtDmg(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 10000) return (n / 1000).toFixed(0) + 'k';
  return n.toLocaleString();
}

function CustomTooltip({ active, payload, hpThreshold }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
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
        {fmtDmg(d.low)} – {fmtDmg(d.high)}
      </div>
      <div style={{ fontWeight: 700, color: 'var(--text)' }}>
        {d.count} 种 ({((d.count / d.total) * 100).toFixed(1)}%)
      </div>
    </div>
  );
}

export default function DamageHistogram({ results, hpThreshold }) {
  const data = useMemo(() => {
    if (!results || results.length === 0) return null;
    const { buckets, total } = buildHistogram(results, 1000, hpThreshold);
    return buckets.map(b => ({ ...b, total }));
  }, [results, hpThreshold]);

  if (!data) return null;

  return (
    <div className="section" style={{ marginTop: 'var(--space-md)' }}>
      <h3 className="panel-title">伤害分布图 Damage Distribution</h3>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-md)',
      }}>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 12, right: 8, bottom: 4, left: 0 }}>
            <defs>
              <linearGradient id="fillBelow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="fillAbove" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--green)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--green)" stopOpacity={0.06} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="low"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(v) => fmtDmg(v)}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
              minTickGap={28}
              tickCount={10}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
              width={32}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip hpThreshold={hpThreshold} />}
            />
            {/* Full distribution — accent/blue */}
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--accent)"
              strokeWidth={1.5}
              fill="url(#fillBelow)"
              isAnimationActive={false}
            />
            {/* Above-threshold overlay — green */}
            {hpThreshold > 0 && (
              <Area
                type="monotone"
                dataKey="aboveCount"
                stroke="none"
                fill="url(#fillAbove)"
                isAnimationActive={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
        {hpThreshold > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
            justifyContent: 'center', marginTop: 'var(--space-sm)',
            fontSize: 'var(--font-xs)', color: 'var(--text-muted)', flexWrap: 'wrap',
          }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--green)', borderRadius: 2, opacity: 0.4 }} />
            <span>超过 {fmtDmg(hpThreshold)}</span>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--accent)', borderRadius: 2, opacity: 0.25 }} />
            <span>低于 {fmtDmg(hpThreshold)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
