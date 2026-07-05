import { useState, useMemo } from 'react';
import { useServant } from '@/hooks/useServant';
import { getSv } from '@/utils/helpers';
import { buildPool } from '@/utils/cardDraw';
import { aggregateBuffs } from '@/utils/calculations';
import {
  calcDamageDistribution,
  calcClearRate,
  calcAllPlayDamages,
} from '@/utils/damageDistribution';
import { CLASS_LIST } from '@/constants/gameData';
import DamageHistogram from '@/components/DamageHistogram';
import useStore from '@/store/index';

const DEFAULT_DECK = 'BBAAQ';
const DEFAULT_ATK = 10000;

function validateDeck(raw) {
  return raw.toUpperCase().replace(/[^BAQ]/g, '').slice(0, 5);
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

  // NP config per servant
  const svNpColor = useMemo(() => {
    return servant ? (getSv(servant, 'npColor') || 'Buster') : 'Buster';
  }, [servant]);
  const svNpMult = useMemo(() => {
    if (!servant) return 300;
    const npLev = Math.min(5, Math.max(1, config.npLevel || 1));
    const npKeys = ['np1', 'np2', 'np3', 'np4', 'np5'];
    return getSv(servant, npKeys[npLev - 1]) || 300;
  }, [servant, config.npLevel]);

  const [npEnabled1, setNpEnabled1] = useState(false);
  const [npEnabled2, setNpEnabled2] = useState(false);
  const [npEnabled3, setNpEnabled3] = useState(false);
  const [npMult1, setNpMult1] = useState(300);
  const [npMult2, setNpMult2] = useState(300);
  const [npMult3, setNpMult3] = useState(svNpMult);
  const [npColor1, setNpColor1] = useState('Buster');
  const [npColor2, setNpColor2] = useState('Buster');
  const [npColor3, setNpColor3] = useState(svNpColor);

  // Enemy HP threshold
  const [hpThreshold, setHpThreshold] = useState(100000);

  const allValid = deck1.length === 5 && deck2.length === 5 && deck3.length === 5
    && atk1 > 0 && atk2 > 0 && atk3 > 0;

  // Aggregate buffs
  const agg = useMemo(() => {
    return aggregateBuffs(buffs, servant, options);
  }, [buffs, servant, options]);

  const aggs = useMemo(() => ({ 1: agg, 2: agg, 3: agg }), [agg]);

  // NP config for buildPool
  const npConfigs = useMemo(() => ({
    1: { enabled: npEnabled1, npColor: npColor1 },
    2: { enabled: npEnabled2, npColor: npColor2 },
    3: { enabled: npEnabled3, npColor: npColor3 },
  }), [npEnabled1, npEnabled2, npEnabled3, npColor1, npColor2, npColor3]);

  // Build pool
  const pool = useMemo(() => {
    if (!allValid) return null;
    return buildPool(deck1, deck2, deck3, npConfigs);
  }, [deck1, deck2, deck3, npConfigs, allValid]);

  // Servant stats for distribution
  const servantStats = useMemo(() => ({
    1: { totalAtk: atk1, svClass: cls1, svAttr: defaultAttr, npMult: npMult1, npColor: npColor1 },
    2: { totalAtk: atk2, svClass: cls2, svAttr: defaultAttr, npMult: npMult2, npColor: npColor2 },
    3: { totalAtk: atk3, svClass: cls3, svAttr: defaultAttr, npMult: npMult3, npColor: npColor3 }
  }), [atk1, atk2, atk3, cls1, cls2, cls3, defaultAttr, npMult1, npMult2, npMult3, npColor1, npColor2, npColor3]);

  // Calculate distribution
  const distResult = useMemo(() => {
    if (!pool) return null;
    return calcDamageDistribution(pool, servantStats, aggs, enemy, options);
  }, [pool, servantStats, aggs, enemy, options]);

  // All possible 3-card plays (P(n,3) = n×(n-1)×(n-2)), each an exact damage value
  const allDamages = useMemo(() => {
    if (!pool) return null;
    return calcAllPlayDamages(pool, servantStats, aggs, enemy, options);
  }, [pool, servantStats, aggs, enemy, options]);

  // Clear rate — exact, computed from all play damages
  const clearRate = useMemo(() => {
    if (!allDamages || allDamages.length === 0) return null;
    const pass = hpThreshold > 0 ? allDamages.filter(d => d >= hpThreshold).length : 0;
    return pass / allDamages.length;
  }, [allDamages, hpThreshold]);

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
    { label: '从者1 S1', deck: deck1, setDeck: setDeck1, atk: atk1, setAtk: setAtk1, cls: cls1, setCls: setCls1,
      npEnabled: npEnabled1, setNpEnabled: setNpEnabled1, npMult: npMult1, setNpMult: setNpMult1, npColor: npColor1, setNpColor: setNpColor1 },
    { label: '从者2 S2', deck: deck2, setDeck: setDeck2, atk: atk2, setAtk: setAtk2, cls: cls2, setCls: setCls2,
      npEnabled: npEnabled2, setNpEnabled: setNpEnabled2, npMult: npMult2, setNpMult: setNpMult2, npColor: npColor2, setNpColor: setNpColor2 },
    { label: '从者3 S3 (当前)', deck: deck3, setDeck: setDeck3, atk: atk3, setAtk: setAtk3, cls: cls3, setCls: setCls3,
      npEnabled: npEnabled3, setNpEnabled: setNpEnabled3, npMult: npMult3, setNpMult: setNpMult3, npColor: npColor3, setNpColor: setNpColor3 },
  ];

  return (
    <div className="section">
      <h2 className="panel-title">伤害分布 Damage Distribution</h2>

      {/* Servant config grid */}
      <div className="sv-config-grid">
        {servantConfigs.map((s) => (
          <div key={s.label} className="sv-config-card">
            <div className="dist-config-label">
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
            <div className="dist-config-row">
              <div className="dist-config-field">
                <div className="dist-config-sub-label">ATK</div>
                <input
                  className="buff-input"
                  style={{ width: '100%' }}
                  type="number"
                  value={s.atk}
                  onChange={(e) => s.setAtk(Number(e.target.value) || 0)}
                  min={0}
                />
              </div>
              <div className="dist-config-field">
                <div className="dist-config-sub-label">职阶</div>
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
            {/* NP config row */}
            <div className="dist-np-row">
              <div style={{ flex: '0 0 auto' }}>
                <label style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', marginBottom: 1 }}>
                  <input
                    type="checkbox"
                    checked={s.npEnabled}
                    onChange={(e) => s.setNpEnabled(e.target.checked)}
                    style={{ cursor: 'pointer', margin: 0 }}
                  />
                  NP
                </label>
              </div>
              <div style={{ flex: 1, opacity: s.npEnabled ? 1 : 0.4 }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: 1 }}>倍率%</div>
                <input
                  className="buff-input"
                  style={{ width: '100%' }}
                  type="number"
                  value={s.npMult}
                  onChange={(e) => s.setNpMult(Number(e.target.value) || 0)}
                  disabled={!s.npEnabled}
                  min={0}
                  step={50}
                />
              </div>
              <div style={{ flex: '0 0 64px', opacity: s.npEnabled ? 1 : 0.4 }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: 1 }}>色</div>
                <select
                  className="buff-input"
                  style={{ width: '100%', fontSize: 'var(--font-xs)', padding: '5px 2px' }}
                  value={s.npColor}
                  onChange={(e) => s.setNpColor(e.target.value)}
                  disabled={!s.npEnabled}
                >
                  <option value="Buster">B</option>
                  <option value="Arts">A</option>
                  <option value="Quick">Q</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="dist-stats-row">
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
          <div className="dist-stat-card" style={{ minWidth: 120 }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 1 }}>通关率</div>
            <div style={{
              fontSize: 'var(--font-xl)', fontWeight: 800,
              color: clearRate >= 0.8 ? 'var(--green)' : clearRate >= 0.5 ? 'var(--gold)' : 'var(--red)'
            }}>{pct(clearRate)}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {allDamages ? allDamages.filter(d => d >= hpThreshold).length : 0} / {allDamages ? allDamages.length : 0} 种
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
            <div style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: 'var(--accent)' }}>{stats.median.toLocaleString()}</div>
          </div>
        )}

        {/* Mean */}
        {stats && (
          <div className="dist-stat-card" style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            padding: 'var(--space-xs) var(--space-md)', minWidth: 80
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 1 }}>均值 Avg</div>
            <div style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: 'var(--text-secondary)' }}>{stats.mean.toLocaleString()}</div>
          </div>
        )}

        {/* P25–P75 */}
        {stats && (
          <div className="dist-stat-card" style={{ minWidth: 80 }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 1 }}>P25 – P75</div>
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {stats.p25.toLocaleString()} – {stats.p75.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Best/Worst plays */}
      {extremes && (
        <div className="dist-best-worst-grid">
          <div className="dist-best-card">
            <div className="dist-play-label" style={{ color: 'var(--green)' }}>
              最高伤害 Best Play
            </div>
            <div className="dist-play-damage">
              {extremes.best.maxDamage.toLocaleString()}
            </div>
            <div className="draw-pool">
              {extremes.best.bestPlay && extremes.best.bestPlay.map((card, i) => (
                <span key={i} className={'draw-badge draw-badge-' + card.type}>
                  {card.type}<sub>{card.servant}</sub>
                </span>
              ))}
            </div>
          </div>
          <div className="dist-worst-card">
            <div className="dist-play-label" style={{ color: 'var(--red)' }}>
              最低伤害 Worst Play
            </div>
            <div className="dist-play-damage">
              {extremes.worst.minDamage.toLocaleString()}
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

      {/* Damage histogram */}
      {allDamages && (
        <DamageHistogram damages={allDamages} hpThreshold={hpThreshold} />
      )}

      {!allValid && (
        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-sm)' }}>
          请先选择从者并配置好3个从者的牌型（各5张B/A/Q），从者3的ATK/牌型/职阶默认从当前选中的从者获取。
        </div>
      )}
    </div>
  );
}
