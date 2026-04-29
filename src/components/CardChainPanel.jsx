import { useState, Fragment } from 'react';
import { Box } from '@mui/material';
import { useServant } from '@/hooks/useServant';
import useStore from '@/store/index';
import { calcCardDamage, calcNPGainForCard, calcStars } from '@/utils/calculations';

const cardLabel = { Buster: 'B', Arts: 'A', Quick: 'Q', Extra: 'EX' };
const cardColors = { Buster: 'var(--buster)', Arts: 'var(--arts)', Quick: 'var(--quick)', Extra: 'var(--gold)' };

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

  if (!servant) return null;

  const cycleCard = (idx) => {
    setSlots((prev) => {
      const next = [...prev];
      next[idx] = next[idx] === 'Buster' ? 'Arts' : next[idx] === 'Arts' ? 'Quick' : 'Buster';
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

  const cards = showExtra ? [...slots, 'Extra'] : slots;
  const firstCard = cards[0];

  const results = cards.map((cardType, i) => {
    const position = i === 0 ? 'first' : i === 1 ? 'second' : i === 2 ? 'third' : 'extra';
    const cardOpt = cardOptions[i] || { isCrit: false, overkill: false };
    const dmg = calcCardDamage(servant, config, buffs, enemy, cardOpt, cardType, position, firstCard);
    const npGain = calcNPGainForCard(servant, buffs, enemy, cardOpt, cardType, position, firstCard);
    const stars = calcStars(servant, buffs, enemy, cardOpt, cardType, position, firstCard);
    return { cardType, position, dmg, npGain, stars, cardOpt };
  });

  const totalDmg = results.reduce((s, r) => s + r.dmg, 0);
  const totalNp = results.reduce((s, r) => s + r.npGain, 0);
  const totalStars = results.reduce((s, r) => s + r.stars.expected, 0);

  return (
    <div className="section-card">
      <h2 className="panel-title">Card Chain</h2>

      <div className="card-slots" style={{ marginBottom: 8 }}>
        {slots.map((ct, i) => (
          <Fragment key={i}>
            <button
              className={'card-slot ' + ct}
              onClick={() => cycleCard(i)}
              onKeyDown={(e) => { (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), cycleCard(i)); }}
              aria-label={`卡牌${i + 1}: ${ct}`}
            >
              <span className="slot-pos">{i + 1}</span>
              {cardLabel[ct]}
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button
                onClick={() => toggleCardCrit(i)}
                style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
                  background: cardOptions[i]?.isCrit ? 'var(--gold)' : 'var(--surface)',
                  color: cardOptions[i]?.isCrit ? '#fff' : 'var(--text-muted)',
                  border: `1px solid ${cardOptions[i]?.isCrit ? 'var(--gold)' : 'var(--border)'}`,
                  cursor: 'pointer',
                }}
              >
                CRIT
              </button>
              <button
                onClick={() => toggleCardOverkill(i)}
                style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
                  background: cardOptions[i]?.overkill ? 'var(--red)' : 'var(--surface)',
                  color: cardOptions[i]?.overkill ? '#fff' : 'var(--text-muted)',
                  border: `1px solid ${cardOptions[i]?.overkill ? 'var(--red)' : 'var(--border)'}`,
                  cursor: 'pointer',
                }}
              >
                OK
              </button>
            </div>
            {i < slots.length - 1 && <span className="plus-sep">+</span>}
          </Fragment>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
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
              style={{
                fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
                background: cardOptions[3]?.overkill ? 'var(--red)' : 'var(--surface)',
                color: cardOptions[3]?.overkill ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${cardOptions[3]?.overkill ? 'var(--red)' : 'var(--border)'}`,
                cursor: 'pointer',
              }}
            >
              OK
            </button>
          </div>
        )}
      </div>

      <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 8 }}>
        点击卡牌切换颜色 B&rarr;A&rarr;Q | 首卡: <span style={{ color: cardColors[firstCard], fontWeight: 700 }}>{firstCard}</span>
      </div>

      <div className="chain-result">
        <div className="chain-header">Card</div>
        <div className="chain-header">Damage</div>
        <div className="chain-header">NP%</div>
        <div className="chain-header">Stars</div>
        {results.map((r, i) => (
          <Fragment key={i}>
            <div style={{ fontWeight: 700, color: cardColors[r.cardType] }}>
              {r.cardType} [{r.position}]
              {r.cardOpt.isCrit && <span style={{ color: 'var(--gold)', fontSize: 10 }}> CRIT</span>}
              {r.cardOpt.overkill && <span style={{ color: 'var(--red)', fontSize: 10 }}> OK</span>}
            </div>
            <div>{r.dmg.toLocaleString()}</div>
            <div>{r.npGain.toFixed(1)}</div>
            <div>{r.stars.expected}</div>
          </Fragment>
        ))}
        <div className="chain-total">TOTAL</div>
        <div className="chain-total">{totalDmg.toLocaleString()}</div>
        <div className="chain-total">{totalNp.toFixed(1)}</div>
        <div className="chain-total">{totalStars.toFixed(1)}</div>
      </div>
    </div>
  );
}
