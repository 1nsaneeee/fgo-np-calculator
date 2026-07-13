import { useState, useMemo, Fragment } from 'react';
import { useServant } from '@/hooks/useServant';
import useStore from '@/store/index';
import { getSv } from '@/utils/helpers';
import { calcCardDamage, calcNPGainForCard, calcStars, calcNPInChain, calcBreakProb } from '@/utils/calculations';

const cardLabel = { Buster: 'B', Arts: 'A', Quick: 'Q', Extra: 'EX', NP: 'NP' };
const cardColors = { Buster: 'var(--buster)', Arts: 'var(--arts)', Quick: 'var(--quick)', Extra: 'var(--card-extra)' };
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

  const npColor = useMemo(() => getSv(servant, 'npColor') || 'Buster', [servant]);

  const cycleCard = (idx, reverse = false) => {
    setSlots((prev) => {
      const next = [...prev];
      let cur = CYCLE.indexOf(next[idx]);
      const step = reverse ? -1 : 1;
      do {
        cur = (cur + step + CYCLE.length) % CYCLE.length;
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

  const resolvedSlots = slots.map((s) => s === 'NP' ? npColor : s);
  const cards = showExtra ? [...slots, 'Extra'] : slots;
  const firstCard = resolvedSlots[0];

  const results = useMemo(() => cards.map((cardType, i) => {
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
  }), [cards, servant, config, buffs, enemy, cardOptions, firstCard, npColor]);

  const totals = useMemo(() => ({
    min: results.reduce((s, r) => s + r.dmg.min, 0),
    avg: results.reduce((s, r) => s + r.dmg.avg, 0),
    max: results.reduce((s, r) => s + r.dmg.max, 0),
    np: results.reduce((s, r) => s + r.npGain, 0),
    stars: results.reduce((s, r) => s + r.stars.expected, 0),
  }), [results]);

  const sameChain = resolvedSlots[0] === resolvedSlots[1] && resolvedSlots[1] === resolvedSlots[2];
  const triColor = new Set(resolvedSlots).size === 3;

  const hp = parseInt(breakHP) || 0;
  const breakProb = useMemo(() =>
    hp > 0 ? calcBreakProb(results.map(r => r.breakInfo), hp) : null
  , [results, hp]);

  const getSlotColor = (ct) => ct === 'NP' ? cardColors[npColor] : cardColors[ct];
  const breakProbClass = breakProb === null ? '' : breakProb >= 1 ? ' high' : breakProb > 0 ? ' mid' : ' low';

  return (
    <div className="section-card">
      <h2 className="panel-title">Card Chain</h2>

      <div className="card-slots">
        {slots.map((ct, i) => (
          <Fragment key={i}>
            <button
              className={'card-slot ' + (ct === 'NP' ? npColor : ct) + (ct === 'NP' ? ' is-np' : '')}
              onClick={() => cycleCard(i)}
              onContextMenu={(e) => { e.preventDefault(); cycleCard(i, true); }}
              onKeyDown={(e) => { (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), cycleCard(i)); }}
              aria-label={`卡牌${i + 1}: ${ct === 'NP' ? 'NP(' + npColor + ')' : ct}，左键切换，右键反向`}
              title="左键切换 / 右键反向"
            >
              <span className="slot-pos">{i + 1}</span>
              {cardLabel[ct]}
            </button>
            <div className="chain-card-options">
              {ct !== 'NP' && (
                <button
                  onClick={() => toggleCardCrit(i)}
                  aria-pressed={cardOptions[i]?.isCrit || false}
                  aria-label={`卡牌${i + 1}暴击`}
                  className={'chain-crit-btn' + (cardOptions[i]?.isCrit ? ' active' : '')}
                >
                  CRIT
                </button>
              )}
              <button
                onClick={() => toggleCardOverkill(i)}
                aria-pressed={cardOptions[i]?.overkill || false}
                aria-label={`卡牌${i + 1}overkill`}
                className={'chain-ok-btn' + (cardOptions[i]?.overkill ? ' active' : '')}
              >
                OK
              </button>
            </div>
            {i < slots.length - 1 && <span className="plus-sep">+</span>}
          </Fragment>
        ))}
      </div>

      <div className="chain-extra-row">
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
          <div className="chain-card-options">
            <button
              onClick={() => toggleCardOverkill(3)}
              aria-pressed={cardOptions[3]?.overkill || false}
              aria-label="Extra卡overkill"
              className={'chain-ok-btn' + (cardOptions[3]?.overkill ? ' active' : '')}
            >
              OK
            </button>
          </div>
        )}
      </div>

      <div className="chain-bonus">
        <span className="chain-bonus-hint">左键切换 B→A→Q→NP / 右键反向</span>
        <span>
          首卡 <span className="chain-first-card" style={{ color: cardColors[firstCard] }}>
            {slots[0] === 'NP' ? 'NP(' + npColor + ')' : firstCard}
          </span>
          {' -> '}
          <span className="chain-effect-label">
            {firstCard === 'Buster' ? '全卡伤害加成' : firstCard === 'Arts' ? '全卡NP获取加成' : '全卡掉星加成'}
          </span>
          {slots[0] === 'NP' && (
            <span className="chain-bonus-hint"> (NP自身不受染色)</span>
          )}
        </span>
        {sameChain && (
          <span className="chain-bonus-text" style={{ color: cardColors[resolvedSlots[0]] }}>
            {resolvedSlots[0]} Chain: {resolvedSlots[0] === 'Buster' ? '每卡+20%ATK' : resolvedSlots[0] === 'Arts' ? '额外+20%NP' : '额外+10星'}
          </span>
        )}
        {triColor && (
          <span className="chain-bonus-text">
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
            <div className="chain-card-cell" style={{ color: r.isNP ? getSlotColor('NP') : cardColors[r.cardType] }}>
              {r.isNP ? 'NP' : r.cardType} [{r.position}]
              {!r.isNP && r.cardOpt.isCrit && <span className="chain-crit-tag">CRIT</span>}
              {r.cardOpt.overkill && <span className="chain-ok-tag">OK</span>}
            </div>
            <div>
              {r.dmg.avg.toLocaleString()}
              <span className="chain-dmg-range">
                {' '}({r.dmg.min.toLocaleString()}~{r.dmg.max.toLocaleString()})
              </span>
            </div>
            <div>{r.npGain.toFixed(1)}</div>
            <div>{r.stars.expected}</div>
          </Fragment>
        ))}
        <div className="chain-total">TOTAL</div>
        <div className="chain-total">
          {totals.avg.toLocaleString()}
          <span className="chain-total-range">
            {' '}({totals.min.toLocaleString()}~{totals.max.toLocaleString()})
          </span>
        </div>
        <div className="chain-total">{totals.np.toFixed(1)}</div>
        <div className="chain-total">{totals.stars.toFixed(1)}</div>
      </div>

      <div className="break-bar">
        <label className="break-bar-label-strong">
          击破率
        </label>
        <div className="break-bar-row">
          <span className="break-bar-label">敌方HP</span>
          <input
            className="buff-input break-bar-input"
            type="number"
            value={breakHP}
            onChange={(e) => setBreakHP(e.target.value)}
            placeholder="0"
            min="0"
          />
          {breakProb !== null && (
            <span className={'break-bar-result' + breakProbClass}>
              {(breakProb * 100).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
