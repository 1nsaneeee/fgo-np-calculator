// FGO game mechanics constants
// All values sourced from the FGO damage formula

/** Base ATK multiplier in the NP damage formula: damage = 0.23 × ATK × ... */
export const BASE_ATK_MULT = 0.23;

/** Random damage range: minimum multiplier */
export const DMG_RANDOM_MIN = 0.9;

/** Random damage range: maximum multiplier */
export const DMG_RANDOM_MAX = 1.099;

/** Buff caps (FGO hard limits, percentages) */
export const CAPS = {
  atkUp: 400,
  defDown: 100,
  cardUp: 400,      // busterUp, artsUp, quickUp
  critDmg: 500,
  starGen: 300,
  npStrength: 500,
  npRate: 1000,
  powerMod: 400,
  independentMod: 500,
  flatDmg: 100000,
};
