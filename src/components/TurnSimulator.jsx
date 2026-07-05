import { useState, useMemo } from 'react';
import useStore from '@/store/index';
import { getSv } from '@/utils/helpers';
import { SKILL_DB, getSkillsForServant } from '@/data/skillDb';
import { aggregateBuffs } from '@/utils/calculations';
import { buildPool } from '@/utils/cardDraw';
import { calcAllPlayDamages } from '@/utils/damageDistribution';
import { BUFF_DEFS } from '@/constants/buffDefs';
import { SERVANT_DB } from '@/data/servantDb';

/** Get skills from resolved servant data (API) with SKILL_DB fallback */
function getServantSkills(sv, servantId) {
  if (sv?.skills?.length > 0) return { skills: sv.skills };
  if (servantId) return getSkillsForServant(servantId);
  return null;
}

/** Resolve servant data from list by ID or customServant */
function resolveServant(slot, servantList) {
  if (!slot) return null;
  if (slot.isCustom && slot.customServant) return slot.customServant;
  // Priority: cached resolved data > servantList (API basic data) > SERVANT_DB fallback
  if (slot._resolvedServant) return slot._resolvedServant;
  if (!slot.servantId) return null;
  // Try servantList (API basic data) first — note: may not have full calculation data
  const fromList = servantList.find(s => s.id === slot.servantId);
  if (fromList) return fromList;
  // Fall back to SERVANT_DB
  return SERVANT_DB.find(s => s[0] === slot.servantId) || null;
}

/** Compute total ATK from config */
function getTotalAtk(sv, config) {
  if (!sv) return 0;
  const baseAtk = config.level >= 120 ? getSv(sv, 'atk120')
    : config.level >= 100 ? getSv(sv, 'atk100')
    : getSv(sv, 'atk90');
  return baseAtk + (config.fou || 0) + (config.ceAtk || 0) + (config.extraAtk || 0);
}

/**
 * Compute what buff values are active for a servant on a given turn,
 * merging all activated skill effects from ALL servants (party-wide simplification).
 * Returns a flat buffs object { atkUp: 30, artsUp: 50, ... }
 */
function computeSkillBuffs(turn, team, servants) {
  const active = {};
  const BUFF_KEYS = BUFF_DEFS.map(d => d.key);

  for (let si = 0; si < 3; si++) {
    const s = team.servants[si];
    if (!s || !s.servantId) continue;
    const servantSkills = getServantSkills(servants[si], s.servantId);
    if (!servantSkills) continue;

    for (let ski = 0; ski < 3; ski++) {
      const skillsActivated = s.skillsActivated || [null, null, null];
      const activatedTurn = skillsActivated[ski];
      if (activatedTurn === null || activatedTurn === undefined || activatedTurn > turn) continue;

      const skillDef = servantSkills.skills[ski];
      if (!skillDef) continue;

      const turnsElapsed = turn - activatedTurn;
      for (const effect of skillDef.effects) {
        // duration: 1 = only activation turn, 3 = activation turn + 2 more
        if (turnsElapsed < effect.duration) {
          // Party-wide simplification: all skill buffs apply to the DPS
          if (si === dpsIndex || true) {
            active[effect.buffKey] = (active[effect.buffKey] || 0) + effect.value;
          }
        }
      }
    }
  }

  // Ensure all keys exist at 0
  for (const k of BUFF_KEYS) {
    if (active[k] === undefined) active[k] = 0;
  }
  return active;
}

/**
 * Build a merged buffs object that includes both the base store buffs
 * AND the active skill buffs (as a virtual source).
 */
function buildMergedBuffs(baseBuffs, skillBuffs) {
  const skillSource = { id: '__skill_virtual', name: 'Skills', buffs: skillBuffs };
  return {
    sources: [...(baseBuffs.sources || []), skillSource],
    _nextId: (baseBuffs._nextId || 99),
  };
}

function pct(v) { return (v * 100).toFixed(1) + '%'; }

/** Compact card badge for pool display */
function CardBadge({ card }) {
  if (!card) return null;
  const cls = card.type === 'NP' ? 'draw-badge-NP' : 'draw-badge-' + card.type;
  return (
    <span className={'draw-badge ' + cls}>
      {card.type}<sub>S{card.servant}</sub>
    </span>
  );
}

/** Skill button for activation toggle */
function SkillButton({ skillDef, isActivated, isSelected, onToggle, disabled }) {
  const isActiveThisTurn = isActivated;
  const hasSkill = isSelected && skillDef;

  let btnStyle = {
    padding: '4px 12px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-xs)',
    fontWeight: 600,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'all 0.15s ease',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    color: 'var(--text-muted)',
    background: 'var(--surface)',
  };

  if (isActiveThisTurn) {
    btnStyle = {
      ...btnStyle,
      borderColor: 'var(--accent)',
      background: 'var(--accent-light)',
      color: 'var(--accent)',
      fontWeight: 700,
    };
  } else if (!hasSkill) {
    btnStyle = {
      ...btnStyle,
      borderStyle: 'dashed',
      opacity: 0.35,
    };
  }

  return (
    <button
      style={btnStyle}
      onClick={onToggle}
      disabled={disabled}
      title={skillDef ? skillDef.name : '无技能数据'}
    >
      {skillDef ? skillDef.name : '—'}
    </button>
  );
}

/** NP gauge bar */
function NPGauge({ value, label }) {
  const pctVal = Math.min(200, Math.max(0, value || 0));
  const barWidth = Math.min(100, pctVal);
  const isFull = pctVal >= 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-xs)' }}>
      <span style={{ fontWeight: 700, minWidth: 28, color: isFull ? 'var(--accent)' : 'var(--text-secondary)' }}>
        {label}
      </span>
      <div style={{
        flex: 1, height: 14, background: 'var(--surface-alt)',
        borderRadius: 3, overflow: 'hidden', border: '1px solid var(--border)',
      }}>
        <div style={{
          width: barWidth + '%', height: '100%',
          background: isFull ? 'var(--accent)' : 'var(--arts)',
          transition: 'width 0.3s ease',
          borderRadius: 2,
        }} />
      </div>
      <span style={{ fontWeight: 600, minWidth: 32, textAlign: 'right', color: isFull ? 'var(--accent)' : 'var(--text-muted)' }}>
        {pctVal}%
      </span>
    </div>
  );
}

export default function TurnSimulator() {
  const team = useStore(s => s.team);
  const servantList = useStore(s => s.servantList);
  const activateTeamSkill = useStore(s => s.activateTeamSkill);
  const deactivateTeamSkill = useStore(s => s.deactivateTeamSkill);

  const [activeTurn, setActiveTurn] = useState(1);
  const dpsIndex = 2; // Slot 3 (0-based index 2) is DPS

  const slots = useMemo(() => {
    return (team?.servants || []).map(s => ({
      ...s,
      skills: s.skills || [null, null, null],
      skillsActivated: s.skillsActivated || [null, null, null],
      npGauge: s.npGauge ?? 0,
    }));
  }, [team?.servants]);
  const enemy = team?.enemy || { class: 'Saber', attr: 'Human', def: 0 };
  const options = team?.options || { isCrit: false, overkill: false };

  // ── Resolve servant data ──
  const servants = useMemo(() => {
    return slots.map(slot => resolveServant(slot, servantList));
  }, [slots, servantList]);

  const hasAnyServant = useMemo(() => servants.some(s => s !== null), [servants]);

  // ── Total ATKs ──
  const totalAtks = useMemo(() => {
    return slots.map((slot, i) => {
      const sv = servants[i];
      if (!sv) return 0;
      return getTotalAtk(sv, slot.config);
    });
  }, [slots, servants]);

  // ── Decks, classes, attrs, NP colors, NP mults ──
  const decks = useMemo(() => servants.map(sv => sv ? (getSv(sv, 'deck') || 'BBAAQ') : null), [servants]);
  const classes = useMemo(() => servants.map(sv => sv ? (getSv(sv, 'class') || 'Berserker') : null), [servants]);
  const attrs = useMemo(() => servants.map(sv => sv ? (getSv(sv, 'attr') || 'Human') : null), [servants]);
  const npColors = useMemo(() => servants.map(sv => sv ? (getSv(sv, 'npColor') || 'Buster') : 'Buster'), [servants]);

  const npMults = useMemo(() => {
    return slots.map((slot, i) => {
      const sv = servants[i];
      if (!sv) return 300;
      const npLev = Math.min(5, Math.max(1, slot.config.npLevel || 1));
      const npKeys = ['np1', 'np2', 'np3', 'np4', 'np5'];
      return getSv(sv, npKeys[npLev - 1]) || 300;
    });
  }, [slots, servants]);

  // ── Has all 3 servants? ──
  const allValid = useMemo(() => {
    return servants[0] && servants[1] && servants[2]
      && totalAtks[0] > 0 && totalAtks[1] > 0 && totalAtks[2] > 0
      && decks[0] && decks[1] && decks[2];
  }, [servants, totalAtks, decks]);

  // ── Per-turn computation ──
  const turnResults = useMemo(() => {
    if (!allValid) return null;
    const results = [];

    // Track NP gauge across turns
    let runningNPGauge = slots[dpsIndex]?.npGauge || 0;

    for (let turn = 1; turn <= 3; turn++) {
      // Compute skill buffs active this turn
      const skillBuffs = computeSkillBuffs(turn, team, servants);

      // Merge with base buffs for each servant
      const mergedBuffSets = slots.map((slot, i) => {
        const baseBuffs = slot.buffs || { sources: [] };
        return buildMergedBuffs(baseBuffs, skillBuffs);
      });

      // Aggregate buffs per servant
      const aggrs = mergedBuffSets.map((buffs, i) => {
        const sv = servants[i];
        return aggregateBuffs(buffs, sv, options);
      });

      // Build aggs object for distribution engine (1-indexed)
      const aggs = {
        1: aggrs[0], 2: aggrs[1], 3: aggrs[2],
      };

      // NP config: DPS NP is enabled if gauge >= 100
      const npEnabledForTurn = [false, false, runningNPGauge >= 100];
      const npConfigs = {
        1: { enabled: npEnabledForTurn[0], npColor: npColors[0] },
        2: { enabled: npEnabledForTurn[1], npColor: npColors[1] },
        3: { enabled: npEnabledForTurn[2], npColor: npColors[2] },
      };

      const pool = buildPool(decks[0], decks[1], decks[2], npConfigs);

      const servantStats = {
        1: { totalAtk: totalAtks[0], svClass: classes[0], svAttr: attrs[0], npMult: npMults[0], npColor: npColors[0] },
        2: { totalAtk: totalAtks[1], svClass: classes[1], svAttr: attrs[1], npMult: npMults[1], npColor: npColors[1] },
        3: { totalAtk: totalAtks[2], svClass: classes[2], svAttr: attrs[2], npMult: npMults[2], npColor: npColors[2] },
      };

      const allDamages = calcAllPlayDamages(pool, servantStats, aggs, enemy, options);

      // Stats from damage distribution
      const median = allDamages && allDamages.length > 0
        ? allDamages[Math.floor(allDamages.length / 2)]
        : 0;
      const mean = allDamages && allDamages.length > 0
        ? Math.floor(allDamages.reduce((s, d) => s + d, 0) / allDamages.length)
        : 0;
      const minDmg = allDamages && allDamages.length > 0 ? allDamages[0] : 0;
      const maxDmg = allDamages && allDamages.length > 0 ? allDamages[allDamages.length - 1] : 0;

      // NP computation for this turn
      const npAtStart = runningNPGauge;

      // NP charge from skills activated THIS turn (sum across all servants)
      let npChargeThisTurn = 0;
      for (let si = 0; si < 3; si++) {
        const s = team.servants[si];
        if (!s || !s.servantId) continue;
        const servantSkills = getServantSkills(servants[si], s.servantId);
        if (!servantSkills) continue;
        for (let ski = 0; ski < 3; ski++) {
          const skillsActivated = s.skillsActivated || [null, null, null];
          const skills = s.skills || [null, null, null];
          const activatedTurn = skillsActivated[ski];
          if (activatedTurn !== turn) continue;
          const skillDef = servantSkills.skills[ski];
          if (!skillDef) continue;
          npChargeThisTurn += (skillDef.npCharge || 0);
        }
      }

      let npAfterCharge = npAtStart + npChargeThisTurn;
      const canNP = npAfterCharge >= 100;
      let npAfterNP = npAfterCharge;

      if (canNP && npEnabledForTurn[2]) {
        npAfterNP = npAfterCharge - 100;
      }

      // Approximate NP refund from DPS NP card
      const dpsSv = servants[dpsIndex];
      let npRefund = 0;
      if (canNP && dpsSv) {
        const npRate = getSv(dpsSv, 'npRate') || 0;
        const npHits = getSv(dpsSv, 'npHits') || 1;
        const agg = aggrs[dpsIndex];
        let colorBuff = 0;
        const nc = npColors[dpsIndex];
        if (nc === 'Buster') colorBuff = agg.busterUp;
        else if (nc === 'Arts') colorBuff = agg.artsUp;
        else if (nc === 'Quick') colorBuff = agg.quickUp;
        const enemyMod = { Saber: 1, Archer: 0.95, Lancer: 1, Rider: 1.1, Caster: 1.2, Assassin: 0.9, Berserker: 0.8 }[enemy.class] || 1;
        const cardCoef = { Buster: 0, Arts: 3, Quick: 1 };
        const baseCard = cardCoef[npColors[dpsIndex]] || 0;
        const overkillMult = options.overkill ? 1.5 : 1;
        const perHit = npRate * baseCard * (1 + colorBuff / 100) * enemyMod * (1 + agg.npRate / 100) * overkillMult;
        npRefund = Math.floor(perHit * npHits * 100) / 100;
        npAfterNP += npRefund;
      }

      // Approximate extra NP from 2 regular DPS cards (avg of deck)
      let npFromCards = 0;
      if (dpsSv) {
        const deck = getSv(dpsSv, 'deck') || '';
        const npRate = getSv(dpsSv, 'npRate') || 0;
        const agg = aggrs[dpsIndex];
        const enemyMod = { Saber: 1, Archer: 0.95, Lancer: 1, Rider: 1.1, Caster: 1.2, Assassin: 0.9, Berserker: 0.8 }[enemy.class] || 1;
        const cardCoef = { B: 0, A: 3, Q: 1 };
        const hitMap = { B: getSv(dpsSv, 'bHits') || 1, A: getSv(dpsSv, 'aHits') || 1, Q: getSv(dpsSv, 'qHits') || 1 };
        let colorBuff = 0;
        for (const ch of deck) {
          if (ch === 'B') colorBuff = agg.busterUp;
          else if (ch === 'A') colorBuff = agg.artsUp;
          else if (ch === 'Q') colorBuff = agg.quickUp;
          const avgPos = 1.5; // avg of 1, 1.5, 2
          const perHit = npRate * (cardCoef[ch] || 0) * avgPos * (1 + colorBuff / 100) * enemyMod * (1 + agg.npRate / 100);
          npFromCards += perHit * hitMap[ch];
        }
        npFromCards = Math.floor(npFromCards / 5 * 2 * 100) / 100; // 2 out of 5 cards per turn
        npAfterNP += npFromCards;
      }

      npAfterNP = Math.min(200, Math.max(0, npAfterNP));
      const npAtEnd = npAfterNP;

      // Active skills listed for this turn
      const activeSkillsList = [];
      for (let si = 0; si < 3; si++) {
        const s = team.servants[si];
        if (!s || !s.servantId) continue;
        const servantSkills = getServantSkills(servants[si], s.servantId);
        if (!servantSkills) continue;
        for (let ski = 0; ski < 3; ski++) {
          const skillsActivated = s.skillsActivated || [null, null, null];
          const skills = s.skills || [null, null, null];
          if (skillsActivated[ski] === turn) {
            const skillDef = servantSkills.skills[ski];
            if (skillDef) {
              activeSkillsList.push({ servant: si + 1, name: skillDef.name, npCharge: skillDef.npCharge || 0 });
            }
          }
        }
      }

      results.push({
        turn,
        pool,
        allDamages,
        median,
        mean,
        minDmg,
        maxDmg,
        npAtStart,
        npChargeThisTurn,
        npAfterCharge,
        canNP,
        npRefund,
        npFromCards,
        npAtEnd,
        activeSkillsList,
        skillBuffs,
        aggrs,
      });

      // Update running NP for next turn
      runningNPGauge = npAtEnd;
    }

    return results;
  }, [allValid, slots, team, servants, totalAtks, decks, classes, attrs, npColors, npMults, enemy, options, dpsIndex]);

  // ── Empty state ──
  if (!hasAnyServant) {
    return (
      <div className="section-card">
        <h2 className="panel-title">三回合模拟 Turn Simulator</h2>
        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', padding: 'var(--space-md) 0' }}>
          请先配置三从者
        </div>
      </div>
    );
  }

  return (
    <div className="section-card">
      <h2 className="panel-title">三回合模拟 Turn Simulator</h2>

      {/* ── Turn Selector ── */}
      <div className="preset-row" style={{ marginBottom: 'var(--space-lg)' }}>
        {[1, 2, 3].map(turn => (
          <button
            key={turn}
            className="toggle-btn"
            style={{
              borderColor: activeTurn === turn ? 'var(--accent)' : undefined,
              color: activeTurn === turn ? 'var(--accent)' : undefined,
              background: activeTurn === turn ? 'var(--accent-light)' : undefined,
              fontWeight: activeTurn === turn ? 700 : 600,
              padding: '6px 20px',
            }}
            onClick={() => setActiveTurn(turn)}
          >
            Round {turn}
          </button>
        ))}
      </div>

      {/* ── Skill Activation Panel ── */}
      <div style={{
        background: 'var(--surface-alt)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: 'var(--space-md)',
        marginBottom: 'var(--space-md)',
      }}>
        <div style={{
          fontSize: 'var(--font-xs)',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 'var(--space-sm)',
        }}>
          技能激活 Skills — Turn {activeTurn}
        </div>
        {slots.map((slot, si) => {
          const sv = servants[si];
          const svName = sv ? getSv(sv, 'name') : '—';
          const servantSkills = slot.servantId ? getServantSkills(sv, slot.servantId) : null;

          return (
            <div key={si} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              padding: 'var(--space-xs) 0',
              flexWrap: 'wrap',
            }}>
              <span style={{
                fontSize: 'var(--font-xs)',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                minWidth: 90,
              }}>
                S{si + 1} {svName.length > 6 ? svName.slice(0, 6) + '…' : svName}
              </span>
              {[0, 1, 2].map(ski => {
                const skillDef = servantSkills?.skills?.[ski];
                const skillId = skillDef?.id || slot.skills[ski];
                const isActivated = skillId ? slot.skillsActivated[ski] === activeTurn : false;
                const hasSkill = !!skillDef;

                return (
                  <SkillButton
                    key={ski}
                    skillDef={skillDef}
                    isActivated={isActivated}
                    isSelected={hasSkill}
                    disabled={!hasSkill}
                    onToggle={() => {
                      if (!hasSkill) return;
                      if (isActivated) {
                        deactivateTeamSkill(si, ski);
                      } else {
                        activateTeamSkill(si, ski, activeTurn);
                      }
                    }}
                  />
                );
              })}
              {!servantSkills && !slot.isCustom && slot.servantId && (
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  无技能数据
                </span>
              )}
              {(!slot.servantId || slot.isCustom) && (
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {slot.isCustom ? '自定义从者无技能' : '未选择从者'}
                </span>
              )}
            </div>
          );
        })}

        {/* Skills activated in other turns */}
        <div style={{ marginTop: 'var(--space-sm)', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
            已激活技能（所有回合）
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {slots.map((slot, si) => {
              const sv = servants[si];
              const servantSkills = slot.servantId ? getServantSkills(sv, slot.servantId) : null;
              if (!servantSkills) return null;
              return slot.skillsActivated.map((actTurn, ski) => {
                if (actTurn === null || actTurn === undefined) return null;
                const skillDef = servantSkills.skills[ski];
                if (!skillDef) return null;
                return (
                  <span key={`${si}-${ski}`} style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-xs)',
                    background: actTurn === activeTurn ? 'var(--accent-light)' : 'var(--surface)',
                    border: `1px solid ${actTurn === activeTurn ? 'var(--accent)' : 'var(--border)'}`,
                    color: actTurn === activeTurn ? 'var(--accent)' : 'var(--text-muted)',
                    fontWeight: actTurn === activeTurn ? 700 : 500,
                  }}>
                    T{actTurn}: {skillDef.name.length > 8 ? skillDef.name.slice(0, 8) + '…' : skillDef.name}
                  </span>
                );
              });
            })}
            {slots.every(s => !s.skillsActivated.some(a => a !== null)) && (
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                暂无激活技能
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Active Buffs (current turn) ── */}
      {turnResults && turnResults[activeTurn - 1] && (
        <div style={{
          background: 'var(--surface-alt)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-md)',
          marginBottom: 'var(--space-md)',
        }}>
          <div style={{
            fontSize: 'var(--font-xs)',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 'var(--space-sm)',
          }}>
            生效Buff — Turn {activeTurn}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {BUFF_DEFS.map(def => {
              const val = turnResults[activeTurn - 1].skillBuffs[def.key] || 0;
              if (val === 0) return null;
              return (
                <span key={def.key} style={{
                  fontSize: 'var(--font-xs)',
                  padding: '2px 10px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--accent-light)',
                  border: '1px solid var(--accent)',
                  color: 'var(--accent)',
                  fontWeight: 600,
                }}>
                  {def.label.replace('%', '')} +{val}%
                </span>
              );
            })}
            {Object.values(turnResults[activeTurn - 1].skillBuffs).every(v => v === 0) && (
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                本回合无技能Buff
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Turn Result ── */}
      {turnResults && turnResults[activeTurn - 1] && allValid && (
        <div style={{
          background: 'var(--surface-hero, #eeece5)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-md)',
          marginBottom: 'var(--space-md)',
        }}>
          <div style={{
            fontSize: 'var(--font-xs)',
            fontWeight: 700,
            color: 'var(--accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 'var(--space-md)',
            paddingBottom: 'var(--space-xs)',
            borderBottom: '1px solid var(--accent-light)',
          }}>
            Turn {activeTurn} 结果
          </div>

          {/* NP Gauge */}
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <div style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              NP 状态
            </div>
            <NPGauge label={`S${dpsIndex + 1}`} value={turnResults[activeTurn - 1].npAtStart} />
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              {turnResults[activeTurn - 1].npChargeThisTurn > 0 && (
                <span>技能充能 +{turnResults[activeTurn - 1].npChargeThisTurn}%</span>
              )}
              {turnResults[activeTurn - 1].canNP && (
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>宝具发动 ✓</span>
              )}
              {turnResults[activeTurn - 1].npRefund > 0 && (
                <span>宝具回收 +{turnResults[activeTurn - 1].npRefund.toFixed(1)}%</span>
              )}
              {turnResults[activeTurn - 1].npFromCards > 0 && (
                <span>指令卡回收 ≈+{turnResults[activeTurn - 1].npFromCards.toFixed(1)}%</span>
              )}
              <span style={{ fontWeight: 700 }}>回合结束: {Math.floor(turnResults[activeTurn - 1].npAtEnd)}%</span>
            </div>
          </div>

          {/* Damage distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
            <div className="result-card">
              <div className="result-label">最小伤害</div>
              <div className="result-value min">
                {turnResults[activeTurn - 1].minDmg.toLocaleString()}
              </div>
            </div>
            <div className="result-card">
              <div className="result-label">中位数</div>
              <div className="result-value avg">
                {turnResults[activeTurn - 1].median.toLocaleString()}
              </div>
            </div>
            <div className="result-card">
              <div className="result-label">平均伤害</div>
              <div className="result-value avg">
                {turnResults[activeTurn - 1].mean.toLocaleString()}
              </div>
            </div>
            <div className="result-card">
              <div className="result-label">最大伤害</div>
              <div className="result-value max">
                {turnResults[activeTurn - 1].maxDmg.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Pool info */}
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-sm)' }}>
            卡池: {turnResults[activeTurn - 1].pool?.length || 0} 张卡
            {turnResults[activeTurn - 1].canNP ? '（DPS宝具已入池）' : '（DPS宝具未入池）'}
            {' · '}{turnResults[activeTurn - 1].allDamages?.length || 0} 种出牌序列
          </div>
        </div>
      )}

      {/* ── 3-Turn Summary ── */}
      {turnResults && allValid && (
        <div style={{
          background: 'var(--surface-alt)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-md)',
        }}>
          <div style={{
            fontSize: 'var(--font-xs)',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 'var(--space-md)',
          }}>
            三回合总览
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 'var(--font-sm)',
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-strong)' }}>
                  <th style={thStyle}>回合</th>
                  <th style={thStyle}>NP起始</th>
                  <th style={thStyle}>充能</th>
                  <th style={thStyle}>宝具</th>
                  <th style={thStyle}>技能使用</th>
                  <th style={thStyle}>伤害范围</th>
                  <th style={thStyle}>中位数</th>
                  <th style={thStyle}>回合结束NP</th>
                </tr>
              </thead>
              <tbody>
                {turnResults.map((tr, i) => (
                  <tr key={tr.turn} style={{
                    borderBottom: '1px solid var(--border-light)',
                    background: tr.turn === activeTurn ? 'var(--accent-light)' : undefined,
                  }}>
                    <td style={tdStyle}>
                      <span style={{
                        fontWeight: 700,
                        color: tr.turn === activeTurn ? 'var(--accent)' : 'var(--text)',
                      }}>
                        T{tr.turn}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: tr.npAtStart >= 100 ? 'var(--green)' : 'var(--text-secondary)' }}>
                        {Math.floor(tr.npAtStart)}%
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {tr.npChargeThisTurn > 0
                        ? <span style={{ color: 'var(--accent)', fontWeight: 600 }}>+{tr.npChargeThisTurn}%</span>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={tdStyle}>
                      {tr.canNP
                        ? <span style={{ color: 'var(--green)', fontWeight: 700 }}>NP使用 ✓</span>
                        : <span style={{ color: 'var(--red)', fontWeight: 500 }}>NP不足</span>}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        {tr.activeSkillsList.map((sk, j) => (
                          <span key={j} style={{
                            fontSize: '10px',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-xs)',
                            background: 'var(--accent-light)',
                            border: '1px solid var(--accent)',
                            color: 'var(--accent)',
                            whiteSpace: 'nowrap',
                          }}>
                            S{sk.servant} {sk.name.length > 6 ? sk.name.slice(0, 6) + '…' : sk.name}
                            {sk.npCharge > 0 && ` (+${sk.npCharge})`}
                          </span>
                        ))}
                        {tr.activeSkillsList.length === 0 && (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)' }}>
                      {tr.minDmg.toLocaleString()} – {tr.maxDmg.toLocaleString()}
                    </td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>
                      {tr.median.toLocaleString()}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        fontWeight: 700,
                        color: tr.npAtEnd >= 100 ? 'var(--green)'
                          : tr.npAtEnd >= 50 ? 'var(--gold)'
                          : 'var(--text-secondary)',
                      }}>
                        {Math.floor(tr.npAtEnd)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Loop verdict */}
          <div style={{
            marginTop: 'var(--space-md)',
            padding: 'var(--space-sm) var(--space-md)',
            borderRadius: 'var(--radius-sm)',
            background: turnResults.every(tr => tr.canNP)
              ? 'var(--green-bg)'
              : 'var(--red-bg)',
            border: turnResults.every(tr => tr.canNP)
              ? '1px solid var(--green)'
              : '1px solid var(--red)',
            textAlign: 'center',
          }}>
            <span style={{
              fontSize: 'var(--font-md)',
              fontWeight: 800,
              color: turnResults.every(tr => tr.canNP) ? 'var(--green)' : 'var(--red)',
            }}>
              {turnResults.every(tr => tr.canNP)
                ? '✓ 三连发可能！3-Turn Loop Possible!'
                : '✗ 三连发中断 · 调整NP充能/回收'}
            </span>
            {!turnResults.every(tr => tr.canNP) && (
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
                {turnResults.map(tr => !tr.canNP ? `T${tr.turn}: NP不足(${Math.floor(tr.npAfterCharge)}%)` : '').filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: '6px 10px',
  fontSize: 'var(--font-xs)',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  textAlign: 'left',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '6px 10px',
  fontSize: 'var(--font-sm)',
  color: 'var(--text)',
  verticalAlign: 'middle',
};
