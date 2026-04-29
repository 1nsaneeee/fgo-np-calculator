import { useState, Fragment } from 'react';
import { useServant } from '@/hooks/useServant';
import useStore from '@/store/index';
import { getSv } from '@/utils/helpers';
import { calcCardDamage, calcNPGainForCard, calcStars, calcNPInChain, calcBreakProb } from '@/utils/calculations';

const cardLabel = { Buster: 'B', Arts: 'A', Quick: 'Q', Extra: 'EX', NP: 'NP' };
const cardColors = { Buster: 'var(--buster)', Arts: 'var(--arts)', Quick: 'var(--quick)', Extra: 'var(--gold)' };
const CYCLE = ['Buster', 'Arts', 'Quick', 'NP'];

export default function CardChainPanel() {
  const servant = useServant();
  const config = useStore((s) => s.config);
  const buffs = useStore((s) => s.buffs);
  const enemy = useStore((s) => s.enemy);
  const options = useStore((s) => s.options);

  const [slots, setSlots] = useState(['Buster', 'Arts', 'Quick']);
  const [showExtra, setShowExtra] = useState(false);
  const [cardOptions, setCardOptions] = useState([
    { isCrit: false, overkill: false },
    { isCrit: false, overkill: false },
    { isCrit: false, overkill: false },
    { isCrit: false, overkill: false },
  ]);
  const [breakHP, setBreakHP] = useState('');

  if (!servant) return null;

  const npColor = getSv(servant, 'npColor') || 'Buster';

  const cycleCard = (idx) => {
    setSlots((prev) => {
      const next = [...prev];
      let cur = CYCLE.indexOf(next[idx]);
      do {
        cur = (cur + 1) % CYCLE.length;
      } while (CYCLE[cur] === 'NP' && next.some((s, j) => j !== idx && s === 'NP'));
      next[idx] = CYCLE[cur];
      return next;
    });
  };

  const toggleCardCrit = (i) => {
    setCardOptions((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], isCrit: !next[i].isCrit };
      return next;
    });
  };

  const toggleCardOverkill = (i) => {
    setCardOptions((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], overkill: !next[i].overkill };
      return next;
    });
  };

  // Resolve NP to its color for chain detection and first-card bonus
  const resolvedSlots = slots.map((s) => s === 'NP' ? npColor : s);
  const cards = showExtra ? [...slots, 'Extra'] : slots;
  const firstCard = resolvedSlots[0];

  const results = cards.map((cardType, i) => {
    const position = i === 0 ? 'first' : i === 1 ? 'second' : i === 2 ? 'third' : 'extra';
    const cardOpt = cardOptions[i] || { isCrit: false, overkill: false };

    if (cardType === 'NP') {
      const npResult = calcNPInChain(servant, config, buffs, enemy, { overkill: cardOpt.overkill }, position, firstCard);
      return {
        cardType: 'NP', displayColor: npColor, position,
        dmg: npResult.dmg,
        npGain: npResult.npGain, stars: npResult.stars,
        cardOpt, isNP: true,
        breakInfo: { baseDmg: npResult.baseDmg, flatDmg: npResult.flatDmg },
      };
    }

    const dmg = calcCardDamage(servant, config, buffs, enemy, cardOpt, cardType, position, firstCard);
    const npGain = calcNPGainForCard(servant, buffs, enemy, cardOpt, cardType, position, firstCard);
    const stars = calcStars(servant, buffs, enemy, cardOpt, cardType, position, firstCard);
    return {
      cardType, position, dmg, npGain, stars, cardOpt, isNP: false,
      breakInfo: { baseDmg: dmg.baseDmg, flatDmg: 0 },
    };
  });

  const totalMin = results.reduce((s, r) => s + r.dmg.min, 0);
  const totalAvg = results.reduce((s, r) => s + r.dmg.avg, 0);
  const totalMax = results.reduce((s, r) => s + r.dmg.max, 0);
  const totalNp = results.reduce((s, r) => s + r.npGain, 0);
  const totalStars = results.reduce((s, r) => s + r.stars.expected, 0);

  const sameChain = resolvedSlots[0] === resolvedSlots[1] && resolvedSlots[1] === resolvedSlots[2];
  const triColor = new Set(resolvedSlots).size === 3;

  const hp = parseInt(breakHP) || 0;
  const breakProb = hp > 0 ? calcBreakProb(results.map(r => r.breakInfo), hp) : null;

  const getSlotColor = (ct) => ct === 'NP' ? cardColors[npColor] : cardColors[ct];

  return (
    <div className="section">
      <h2 className="panel-title">Card Chain</h2>

      <div className="card-slots" style={{ marginBottom: 'var(--space-sm)' }}>
        {slots.map((ct, i) => (
          <Fragment key={i}>
            <button
              className={'card-slot ' + (ct === 'NP' ? npColor : ct) + (ct === 'NP' ? ' is-np' : '')}
              onClick={() => cycleCard(i)}
              onKeyDown={(e) => { (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), cycleCard(i)); }}
              aria-label={`卡牌${i + 1}: ${ct === 'NP' ? 'NP(' + npColor + ')' : ct}`}
            >
              <span className="slot-pos">{i + 1}</span>
              {cardLabel[ct]}
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {ct !== 'NP' && (
                <button
                  onClick={() => toggleCardCrit(i)}
                  aria-pressed={cardOptions[i]?.isCrit || false}
                  aria-label={`卡牌${i + 1}暴击`}
                  style={{
                    fontSize: 10, fontWeight: 700, padding: '6px 10px', borderRadius: 3,
                    background: cardOptions[i]?.isCrit ? 'var(--gold)' : 'var(--surface)',
                    color: cardOptions[i]?.isCrit ? '#fff' : 'var(--text-muted)',
                    border: `1px solid ${cardOptions[i]?.isCrit ? 'var(--gold)' : 'var(--border)'}`,
                    cursor: 'pointer', minHeight: 28, minWidth: 36,
                  }}
                >
                  CRIT
                </button>
              )}
              <button
                onClick={() => toggleCardOverkill(i)}
                aria-pressed={cardOptions[i]?.overkill || false}
                aria-label={`卡牌${i + 1}overkill`}
                style={{
                  fontSize: 10, fontWeight: 700, padding: '6px 10px', borderRadius: 3,
                  background: cardOptions[i]?.overkill ? 'var(--red)' : 'var(--surface)',
                  color: cardOptions[i]?.overkill ? '#fff' : 'var(--text-muted)',
                  border: `1px solid ${cardOptions[i]?.overkill ? 'var(--red)' : 'var(--border)'}`,
                  cursor: 'pointer', minHeight: 28, minWidth: 36,
                }}
              >
                OK
              </button>
            </div>
            {i < slots.length - 1 && <span className="plus-sep">+</span>}
          </Fragment>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
        <button
          className={'extra-toggle' + (showExtra ? ' on' : '')}
          onClick={() => setShowExtra(!showExtra)}
          onKeyDown={(e) => { (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setShowExtra(!showExtra)); }}
          aria-pressed={showExtra}
          aria-label="切换Extra攻击"
        >
          EX
        </button>
        {showExtra && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <button
              onClick={() => toggleCardOverkill(3)}
              aria-pressed={cardOptions[3]?.overkill || false}
              aria-label="Extra卡overkill"
              style={{
                fontSize: 10, fontWeight: 700, padding: '6px 10px', borderRadius: 3,
                background: cardOptions[3]?.overkill ? 'var(--red)' : 'var(--surface)',
                color: cardOptions[3]?.overkill ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${cardOptions[3]?.overkill ? 'var(--red)' : 'var(--border)'}`,
                cursor: 'pointer', minHeight: 28, minWidth: 36,
              }}
            >
              OK
            </button>
          </div>
        )}
      </div>

      <div className="chain-bonus">
        <span style={{ color: 'var(--text-muted)' }}>点击卡牌切换 B→A→Q→NP</span>
        <span>
          首卡 <span style={{ color: cardColors[firstCard], fontWeight: 700 }}>
            {slots[0] === 'NP' ? 'NP(' + npColor + ')' : firstCard}
          </span>
          {' → '}
          <span style={{ fontWeight: 500 }}>
            {firstCard === 'Buster' ? '全卡伤害加成' : firstCard === 'Arts' ? '全卡NP获取加成' : '全卡掉星加成'}
          </span>
          {slots[0] === 'NP' && (
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}> (NP自身不受染色)</span>
          )}
        </span>
        {sameChain && (
          <span style={{ color: cardColors[resolvedSlots[0]], fontWeight: 700 }}>
            {resolvedSlots[0]} Chain: {resolvedSlots[0] === 'Buster' ? '每卡+20%ATK' : resolvedSlots[0] === 'Arts' ? '额外+20%NP' : '额外+10星'}
          </span>
        )}
        {triColor && (
          <span style={{ fontWeight: 700 }}>
            三色链: <span style={{ color: 'var(--buster)' }}>伤害</span>+<span style={{ color: 'var(--arts)' }}>NP</span>+<span style={{ color: 'var(--quick)' }}>掉星</span> 全首卡效果
          </span>
        )}
      </div>

      <div className="chain-result">
        <div className="chain-header">Card</div>
        <div className="chain-header">Damage</div>
        <div className="chain-header">NP%</div>
        <div className="chain-header">Stars</div>
        {results.map((r, i) => (
          <Fragment key={i}>
            <div style={{ fontWeight: 700, color: r.isNP ? getSlotColor('NP') : cardColors[r.cardType] }}>
              {r.isNP ? 'NP' : r.cardType} [{r.position}]
              {!r.isNP && r.cardOpt.isCrit && <span style={{ color: 'var(--gold)', fontSize: 10 }}> CRIT</span>}
              {r.cardOpt.overkill && <span style={{ color: 'var(--red)', fontSize: 10 }}> OK</span>}
            </div>
            <div>
              {r.dmg.avg.toLocaleString()}
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                {' '}({r.dmg.min.toLocaleString()}~{r.dmg.max.toLocaleString()})
              </span>
            </div>
            <div>{r.npGain.toFixed(1)}</div>
            <div>{r.stars.expected}</div>
          </Fragment>
        ))}
        <div className="chain-total">TOTAL</div>
        <div className="chain-total">
          {totalAvg.toLocaleString()}
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
            {' '}({totalMin.toLocaleString()}~{totalMax.toLocaleString()})
          </span>
        </div>
        <div className="chain-total">{totalNp.toFixed(1)}</div>
        <div className="chain-total">{totalStars.toFixed(1)}</div>
      </div>

      <div className="break-bar">
        <label style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
          击破率 Break
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>敌方HP</span>
          <input
            className="buff-input"
            type="number"
            style={{ width: 120 }}
            value={breakHP}
            onChange={(e) => setBreakHP(e.target.value)}
            placeholder="0"
            min="0"
          />
          {breakProb !== null && (
            <span style={{
              fontSize: 'var(--font-lg)', fontWeight: 800, whiteSpace: 'nowrap',
              color: breakProb >= 1 ? 'var(--green)' : breakProb > 0 ? 'var(--accent)' : 'var(--red)',
            }}>
              {(breakProb * 100).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
