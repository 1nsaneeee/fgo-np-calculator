import { useState, useMemo } from 'react';
import { useServant } from '@/hooks/useServant';
import { getSv } from '@/utils/helpers';
import { buildPool } from '@/utils/cardDraw';
import { aggregateBuffs } from '@/utils/calculations';
import {
  calcDamageDistribution,
  calcClearRate,
} from '@/utils/damageDistribution';
import { CLASS_LIST } from '@/constants/gameData';
import useStore from '@/store/index';

const DEFAULT_DECK = 'BBAAQ';
const DEFAULT_ATK = 10000;

function validateDeck(raw) {
  return raw.toUpperCase().replace(/[^BAQ]/g, '').slice(0, 5);
}

function fmtDmg(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
  if (n >= 10000) return (n / 1000).toFixed(0) + 'k';
  return n.toLocaleString();
}

function pct(v) {
  return (v * 100).toFixed(2) + '%';
}

function DeckBadges({ deck }) {
  if (!deck || deck.length !== 5) return null;
  return (
    <div className="draw-pool">
      {deck.split('').map((ch, i) => (
        <span key={i} className={'draw-badge draw-badge-' + ch}>{ch}</span>
      ))}
    </div>
  );
}

export default function DamageDistPanel() {
  const servant = useServant();
  const buffs = useStore((s) => s.buffs);
  const enemy = useStore((s) => s.enemy);
  const options = useStore((s) => s.options);
  const config = useStore((s) => s.config);

  // Derive S3 defaults from current servant
  const svAtk = useMemo(() => {
    if (!servant) return DEFAULT_ATK;
    const baseAtk = config.level >= 120 ? getSv(servant, 'atk120')
      : config.level >= 100 ? getSv(servant, 'atk100')
      : getSv(servant, 'atk90');
    return baseAtk + (config.fou || 0) + (config.ceAtk || 0) + (config.extraAtk || 0);
  }, [servant, config]);

  const svDeck = useMemo(() => {
    return servant ? getSv(servant, 'deck') || DEFAULT_DECK : DEFAULT_DECK;
  }, [servant]);

  const svClass = useMemo(() => {
    return servant ? getSv(servant, 'class') || 'Berserker' : 'Berserker';
  }, [servant]);

  const defaultAttr = useMemo(() => {
    return servant ? getSv(servant, 'attr') || 'Human' : 'Human';
  }, [servant]);

  // 3 servant decks
  const [deck1, setDeck1] = useState('BBAAQ');
  const [deck2, setDeck2] = useState('BBAAQ');
  const [deck3, setDeck3] = useState(svDeck);

  // 3 servant ATK values
  const [atk1, setAtk1] = useState(DEFAULT_ATK);
  const [atk2, setAtk2] = useState(DEFAULT_ATK);
  const [atk3, setAtk3] = useState(svAtk);

  // 3 servant classes
  const [cls1, setCls1] = useState(svClass);
  const [cls2, setCls2] = useState(svClass);
  const [cls3, setCls3] = useState(svClass);

  // Enemy HP threshold
  const [hpThreshold, setHpThreshold] = useState(100000);

  const allValid = deck1.length === 5 && deck2.length === 5 && deck3.length === 5
    && atk1 > 0 && atk2 > 0 && atk3 > 0;

  // Aggregate buffs
  const agg = useMemo(() => {
    return aggregateBuffs(buffs, servant, options);
  }, [buffs, servant, options]);

  // Build pool
  const pool = useMemo(() => {
    if (!allValid) return null;
    return buildPool(deck1, deck2, deck3);
  }, [deck1, deck2, deck3, allValid]);

  // Servant stats for distribution
  const servantStats = useMemo(() => ({
    1: { totalAtk: atk1, svClass: cls1, svAttr: defaultAttr },
    2: { totalAtk: atk2, svClass: cls2, svAttr: defaultAttr },
    3: { totalAtk: atk3, svClass: cls3, svAttr: defaultAttr }
  }), [atk1, atk2, atk3, cls1, cls2, cls3, defaultAttr]);

  // Calculate distribution
  const distResult = useMemo(() => {
    if (!pool) return null;
    return calcDamageDistribution(pool, servantStats, agg, enemy, options);
  }, [pool, servantStats, agg, enemy, options]);

  // Clear rate
  const clearRate = useMemo(() => {
    if (!distResult) return null;
    return calcClearRate(distResult, hpThreshold);
  }, [distResult, hpThreshold]);

  // Find overall max/min
  const extremes = useMemo(() => {
    if (!distResult) return null;
    let best = distResult[0];
    let worst = distResult[0];
    for (const r of distResult) {
      if (r.maxDamage > best.maxDamage) best = r;
      if (r.minDamage < worst.minDamage) worst = r;
    }
    return { best, worst };
  }, [distResult]);

  // Stats
  const stats = useMemo(() => {
    if (!distResult) return null;
    const damages = distResult.map(r => r.maxDamage);
    damages.sort((a, b) => a - b);
    const sum = damages.reduce((s, d) => s + d, 0);
    return {
      median: damages[Math.floor(damages.length / 2)],
      mean: Math.floor(sum / damages.length),
      p25: damages[Math.floor(damages.length * 0.25)],
      p75: damages[Math.floor(damages.length * 0.75)]
    };
  }, [distResult]);

  // ── Servant config cards ──
  const servantConfigs = [
    { label: '从者1 S1', deck: deck1, setDeck: setDeck1, atk: atk1, setAtk: setAtk1, cls: cls1, setCls: setCls1 },
    { label: '从者2 S2', deck: deck2, setDeck: setDeck2, atk: atk2, setAtk: setAtk2, cls: cls2, setCls: setCls2 },
    { label: '从者3 S3 (当前)', deck: deck3, setDeck: setDeck3, atk: atk3, setAtk: setAtk3, cls: cls3, setCls: setCls3 },
  ];

  return (
    <div className="section">
      <h2 className="panel-title">伤害分布 Damage Distribution</h2>

      {/* Servant config grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
        {servantConfigs.map((s) => (
          <div key={s.label} style={{ padding: 'var(--space-sm)', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
              {s.label}
            </div>
            {/* Deck */}
            <input
              className="buff-input"
              style={{ width: '100%', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: 2 }}
              value={s.deck}
              onChange={(e) => s.setDeck(validateDeck(e.target.value))}
              maxLength={5}
              placeholder="BBAAQ"
            />
            <DeckBadges deck={s.deck} />
            {/* ATK + Class row */}
            <div style={{ display: 'flex', gap: 'var(--space-xs)', marginTop: 'var(--space-sm)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: 1 }}>ATK</div>
                <input
                  className="buff-input"
                  style={{ width: '100%' }}
                  type="number"
                  value={s.atk}
                  onChange={(e) => s.setAtk(Number(e.target.value) || 0)}
                  min={0}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: 1 }}>职阶</div>
                <select
                  className="buff-input"
                  style={{ width: '100%', fontSize: 'var(--font-xs)', padding: '5px 4px' }}
                  value={s.cls}
                  onChange={(e) => s.setCls(e.target.value)}
                >
                  {CLASS_LIST.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="dist-stats-row" style={{
        display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto auto', gap: 'var(--space-sm)',
        alignItems: 'stretch', marginBottom: 'var(--space-md)',
        padding: 'var(--space-sm)', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)'
      }}>
        {/* HP Input */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 130 }}>
          <label style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>
            敌方血量 Enemy HP
          </label>
          <input
            className="buff-input"
            style={{ width: 130 }}
            type="number"
            value={hpThreshold}
            onChange={(e) => setHpThreshold(Number(e.target.value) || 0)}
            min={0}
            step={10000}
          />
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: 'var(--border-light)' }} />

        {/* Clear Rate Card */}
        {clearRate !== null && (
          <div className="dist-stat-card" style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            padding: 'var(--space-xs) var(--space-md)', minWidth: 120
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 1 }}>通关率</div>
            <div style={{
              fontSize: 'var(--font-xl)', fontWeight: 800,
              color: clearRate >= 0.8 ? 'var(--green)' : clearRate >= 0.5 ? 'var(--gold)' : 'var(--red)'
            }}>{pct(clearRate)}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {distResult.filter(r => r.maxDamage >= hpThreshold).length} / {distResult.length} 种
            </div>
          </div>
        )}

        {/* Median */}
        {stats && (
          <div className="dist-stat-card" style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            padding: 'var(--space-xs) var(--space-md)', minWidth: 80
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 1 }}>中位数 Median</div>
            <div style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: 'var(--accent)' }}>{fmtDmg(stats.median)}</div>
          </div>
        )}

        {/* Mean */}
        {stats && (
          <div className="dist-stat-card" style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            padding: 'var(--space-xs) var(--space-md)', minWidth: 80
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 1 }}>均值 Avg</div>
            <div style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: 'var(--text-secondary)' }}>{fmtDmg(stats.mean)}</div>
          </div>
        )}

        {/* P25–P75 */}
        {stats && (
          <div className="dist-stat-card" style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            padding: 'var(--space-xs) var(--space-md)', minWidth: 90
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 1 }}>P25 – P75</div>
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {fmtDmg(stats.p25)} – {fmtDmg(stats.p75)}
            </div>
          </div>
        )}
      </div>

      {/* Best/Worst plays */}
      {extremes && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
          <div style={{ padding: 'var(--space-sm)', background: 'var(--green-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--green)' }}>
            <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--green)', marginBottom: 'var(--space-xs)' }}>
              最高伤害 Best Play
            </div>
            <div style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--text)', marginBottom: 'var(--space-xs)' }}>
              {fmtDmg(extremes.best.maxDamage)}
            </div>
            <div className="draw-pool">
              {extremes.best.bestPlay && extremes.best.bestPlay.map((card, i) => (
                <span key={i} className={'draw-badge draw-badge-' + card.type}>
                  {card.type}<sub>{card.servant}</sub>
                </span>
              ))}
            </div>
          </div>
          <div style={{ padding: 'var(--space-sm)', background: 'var(--red-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--red)' }}>
            <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--red)', marginBottom: 'var(--space-xs)' }}>
              最低伤害 Worst Play
            </div>
            <div style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--text)', marginBottom: 'var(--space-xs)' }}>
              {fmtDmg(extremes.worst.minDamage)}
            </div>
            <div className="draw-pool">
              {extremes.worst.worstPlay && extremes.worst.worstPlay.map((card, i) => (
                <span key={i} className={'draw-badge draw-badge-' + card.type}>
                  {card.type}<sub>{card.servant}</sub>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {!allValid && (
        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-sm)' }}>
          请先选择从者并配置好3个从者的牌型（各5张B/A/Q），从者3的ATK/牌型/职阶默认从当前选中的从者获取。
        </div>
      )}
    </div>
  );
}
