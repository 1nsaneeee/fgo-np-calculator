import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine,
  ResponsiveContainer, Cell,
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
      {hpThreshold > 0 && d.low >= hpThreshold && (
        <div style={{ color: 'var(--green)', fontSize: 'var(--font-xs)', fontWeight: 600 }}>
          超过阈值
        </div>
      )}
    </div>
  );
}

export default function DamageHistogram({ results, hpThreshold }) {
  const data = useMemo(() => {
    if (!results || results.length === 0) return null;
    const { buckets, total } = buildHistogram(results, 1000);
    return buckets.map(b => ({ ...b, total }));
  }, [results]);

  if (!data) return null;

  const maxDamage = data[data.length - 1].high;

  return (
    <div className="section" style={{ marginTop: 'var(--space-md)' }}>
      <h3 className="panel-title">伤害分布图 Damage Distribution</h3>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-md)',
      }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
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
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            />
            {hpThreshold > 0 && (
              <ReferenceLine
                x={hpThreshold}
                stroke="var(--red)"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                ifOverflow="extendDomain"
                label={{
                  value: fmtDmg(hpThreshold),
                  position: 'top',
                  fill: 'var(--red)',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
            )}
            <Bar dataKey="count" radius={[2, 2, 0, 0]} maxBarSize={32}>
              {data.map((entry, i) => {
                // Three-color scheme: blue = fully below, gold = crossing, green = fully above
                const fullyAbove = hpThreshold > 0 && entry.low >= hpThreshold;
                const crossing = hpThreshold > 0 && entry.low < hpThreshold && entry.high > hpThreshold;
                const fill = fullyAbove ? 'var(--green)'
                  : crossing ? 'var(--gold)'
                  : 'var(--accent)';
                const opacity = fullyAbove ? 0.7 : crossing ? 0.6 : 0.5;
                return <Cell key={i} fill={fill} fillOpacity={opacity} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 'var(--space-lg)',
          marginTop: 'var(--space-xs)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)',
        }}>
          <span>0</span>
          <span style={{ flex: 1, textAlign: 'center' }}>伤害区间</span>
          <span>{fmtDmg(maxDamage)}</span>
        </div>
        {hpThreshold > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
            justifyContent: 'center', marginTop: 'var(--space-sm)',
            fontSize: 'var(--font-xs)', color: 'var(--text-muted)', flexWrap: 'wrap',
          }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--green)', borderRadius: 2, opacity: 0.7 }} />
            <span>超过阈值</span>
            <span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--gold)', borderRadius: 2, opacity: 0.6 }} />
            <span>跨越阈值（部分超过）</span>
            <span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--accent)', borderRadius: 2, opacity: 0.5 }} />
            <span>低于阈值</span>
            <span style={{ color: 'var(--red)', fontWeight: 600 }}>— 阈值线 {fmtDmg(hpThreshold)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
