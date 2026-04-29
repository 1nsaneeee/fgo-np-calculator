import { useState, useMemo } from 'react';
import { useServant } from '@/hooks/useServant';
import { getSv } from '@/utils/helpers';
import { buildPool, calcAutoProbs, parseQuery, queryProb } from '@/utils/cardDraw';

function DeckBadges({ deck }) {
  if (!deck) return null;
  return (
    <div className="draw-pool">
      {deck.split('').map((ch, i) => (
        <span key={i} className={'draw-badge draw-badge-' + ch}>{ch}</span>
      ))}
    </div>
  );
}

function validateDeck(raw) {
  return raw.toUpperCase().replace(/[^BAQ]/g, '').slice(0, 5);
}

const pct = (v) => (v * 100).toFixed(1) + '%';

export default function CardDrawPanel() {
  const servant = useServant();
  const [deck1, setDeck1] = useState('BBAAQ');
  const [deck2, setDeck2] = useState('BBAAQ');
  const [queryStr, setQueryStr] = useState('');

  const deck3 = servant ? (getSv(servant, 'deck') || 'BBAAQ') : 'BBAAQ';
  const allValid = deck1.length === 5 && deck2.length === 5 && deck3.length === 5;

  const pool = useMemo(() => {
    if (!allValid) return null;
    return buildPool(deck1, deck2, deck3);
  }, [deck1, deck2, deck3, allValid]);

  const autoProbs = useMemo(() => {
    if (!pool) return null;
    return calcAutoProbs(pool);
  }, [pool]);

  const query = useMemo(() => parseQuery(queryStr), [queryStr]);
  const queryResult = useMemo(() => {
    if (!pool || query.length === 0) return null;
    return queryProb(pool, query);
  }, [pool, query]);

  return (
    <div className="section">
      <h2 className="panel-title">出卡计算器 Card Draw</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-sm)' }}>
        {[
          { label: '从者1 S1', value: deck1, setter: setDeck1, readOnly: false },
          { label: '从者2 S2', value: deck2, setter: setDeck2, readOnly: false },
          { label: '从者3 S3 (当前)', value: deck3, setter: null, readOnly: true },
        ].map((d) => (
          <div key={d.label}>
            <label style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 2 }}>
              {d.label}
            </label>
            <input
              className="buff-input"
              style={{
                width: '100%', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700,
                background: d.readOnly ? 'var(--surface-alt)' : undefined,
              }}
              value={d.value}
              onChange={d.readOnly ? undefined : (e) => d.setter(validateDeck(e.target.value))}
              readOnly={d.readOnly}
              maxLength={5}
              placeholder="BBAAQ"
            />
            <DeckBadges deck={d.value} />
          </div>
        ))}
      </div>

      {!allValid && (
        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--red)', marginTop: 'var(--space-xs)' }}>
          每个从者需要恰好5张卡牌 (B/A/Q)
        </div>
      )}

      {autoProbs && (
        <div className="draw-table">
          <div className="draw-table-header">类型</div>
          <div className="draw-table-header">对象</div>
          <div className="draw-table-header" style={{ textAlign: 'right' }}>概率</div>

          <div className="draw-cat">武勇链 Brave</div>
          <div>从者1</div>
          <div className="draw-prob">{pct(autoProbs.braveChain[1])}</div>
          <div />
          <div>从者2</div>
          <div className="draw-prob">{pct(autoProbs.braveChain[2])}</div>
          <div />
          <div>从者3</div>
          <div className="draw-prob">{pct(autoProbs.braveChain[3])}</div>

          <div className="draw-cat">色卡链 Color</div>
          <div style={{ color: 'var(--buster)', fontWeight: 600 }}>Buster 3+</div>
          <div className="draw-prob">{pct(autoProbs.colorChain.B)}</div>
          <div />
          <div style={{ color: 'var(--arts)', fontWeight: 600 }}>Arts 3+</div>
          <div className="draw-prob">{pct(autoProbs.colorChain.A)}</div>
          <div />
          <div style={{ color: 'var(--quick)', fontWeight: 600 }}>Quick 3+</div>
          <div className="draw-prob">{pct(autoProbs.colorChain.Q)}</div>

          <div className="draw-cat">三色 Tricolor</div>
          <div>从者1</div>
          <div className="draw-prob">{pct(autoProbs.triColor[1])}</div>
          <div />
          <div>从者2</div>
          <div className="draw-prob">{pct(autoProbs.triColor[2])}</div>
          <div />
          <div>从者3</div>
          <div className="draw-prob">{pct(autoProbs.triColor[3])}</div>
        </div>
      )}

      <div style={{ marginTop: 'var(--space-md)' }}>
        <label style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 'var(--space-xs)' }}>
          自定义查询 Manual Query
        </label>
        <div className="draw-query">
          <input
            className="buff-input"
            style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '1px' }}
            value={queryStr}
            onChange={(e) => setQueryStr(e.target.value.toUpperCase().replace(/[^BAQ123]/g, ''))}
            placeholder="例: A3A3A3  B1B2Q3"
          />
          {queryResult !== null && (
            <span className="draw-query-result">{pct(queryResult)}</span>
          )}
        </div>
        {query.length > 0 && (
          <div className="draw-pool" style={{ marginTop: 'var(--space-xs)' }}>
            {query.map((card, i) => (
              <span key={i} className={'draw-badge draw-badge-' + card.type}>
                {card.type}<sub>{card.servant}</sub>
              </span>
            ))}
          </div>
        )}
        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>
          字母=卡色(B/A/Q) 数字=从者编号(1/2/3)　例: A3A3A3 = 从者3的3张Arts
        </div>
      </div>
    </div>
  );
}
