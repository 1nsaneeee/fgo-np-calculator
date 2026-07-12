// src/components/ServantCard.jsx
import { Rating } from '@mui/material';
import { CLASS_COLORS } from '@/constants/gameData';
import npColors from '@/translations/npColors.json';
import servantNamesById from '@/translations/servant-names-by-id.json';

const NPC_LABEL = { Buster: 'B', Arts: 'A', Quick: 'Q' };

const CLASS_ABBR = {
  Saber: 'SBR',
  Archer: 'ARC',
  Lancer: 'LAN',
  Rider: 'RID',
  Caster: 'CAS',
  Assassin: 'ASN',
  Berserker: 'BSR',
  Shielder: 'SHD',
  Ruler: 'RUL',
  Avenger: 'AVN',
  MoonCancer: 'MNC',
  AlterEgo: 'ALE',
  Foreigner: 'FRG',
  Pretender: 'PRE',
  Beast: 'BST',
};

export default function ServantCard({ basic, onClick }) {
  const className = basic.className
    ? (basic.className.charAt(0).toUpperCase() + basic.className.slice(1))
    : '';
  const classColor = CLASS_COLORS[className] || '#555';
  const classAbbr = CLASS_ABBR[className] || (className ? className.slice(0, 3).toUpperCase() : '');
  const npColor = npColors[basic.id] || 'Buster';
  const npChar = NPC_LABEL[npColor] || 'B';
  const nameCn = servantNamesById[basic.id] || basic.name || '';
  const npColorVar = npColor === 'Buster' ? 'var(--buster)' : npColor === 'Arts' ? 'var(--arts)' : 'var(--quick)';

  return (
    <div
      className="sv-card"
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      role="button"
      tabIndex={0}
      aria-label={`选择 ${nameCn}`}
    >
      <div style={{ position: 'relative' }}>
        <img
          className="sv-card-img"
          src={basic.face}
          alt={nameCn}
          loading="lazy"
          style={{ backgroundColor: classColor }}
        />
        <span className="sv-card-class-badge" style={{ backgroundColor: classColor }}>
          {classAbbr}
        </span>
        <span className="sv-card-np-badge" style={{ backgroundColor: npColorVar }}>
          {npChar}
        </span>
      </div>
      <div className="sv-card-body">
        <div className="sv-card-name">{nameCn}</div>
        <div className="sv-card-meta">
          <Rating value={basic.rarity} readOnly size="small" max={5} sx={{ fontSize: '0.65rem', mr: 0.5 }} />
          ATK {basic.atkMax?.toLocaleString() || '?'}
        </div>
      </div>
    </div>
  );
}
