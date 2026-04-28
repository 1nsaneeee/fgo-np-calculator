import { S_KEYS } from '@/constants/servantKeys';
import { ATTRIBUTE_MATRIX } from '@/constants/gameData';

export function getSv(s, key) {
  if (Array.isArray(s)) return s[S_KEYS[key]];
  return s[key];
}

export function clamp(v, cap) {
  return Math.max(0, Math.min(v, cap));
}

export function getAttributeAdvantage(attacker, defender) {
  const v = ATTRIBUTE_MATRIX[attacker] && ATTRIBUTE_MATRIX[attacker][defender];
  return v || 1;
}
