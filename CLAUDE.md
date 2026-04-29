# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FGO NP Damage Calculator — a Fate/Grand Order single-page calculator for NP damage, card chain simulation, NP refund, and star generation. Built with Vite + React 18 + MUI 6 + Zustand 5. Pure JavaScript (no TypeScript). UI is in Chinese.

## Commands

```bash
npm run dev      # Dev server on http://localhost:5173
npm run build    # Production build → docs/ (GitHub Pages)
npm run preview  # Preview production build
```

No test framework or linter is configured.

## Architecture

### Data Flow

```
User Input → Zustand Store (5 slices) → Custom Hooks → Calculation Engine → Components
```

### Store (`src/store/`)

Zustand with composable slices merged in `index.js`:

| Slice | Key State |
|-------|-----------|
| `servantSlice` | `selectedIndex`, `isCustom`, `customServant` |
| `configSlice` | `level` (1-120), `npLevel` (1-5), `fou`, `ceAtk`, `extraAtk` |
| `buffsSlice` | 5 sources (`ce/self/support/enemy/debuff`) × 11 buff types |
| `enemySlice` | enemy `class`, `attr`, `def` |
| `optionsSlice` | `overkill`, `isCrit` booleans |

### Servant Data (`src/data/servantDb.js`)

435+ servants stored as **compact arrays** (not objects). Access via `getSv(servant, keyName)` using index mapping from `S_KEYS` in `src/constants/servantKeys.js`. Custom servants use a plain object with named keys (`CUSTOM_SERVANT_DEFAULTS`).

### Calculation Engine (`src/utils/calculations.js`)

Core FGO damage formula implementation. Key exports:

- `aggregateBuffs(buffs, servant, options)` — sums 5 buff sources + servant passives, applies caps (e.g. atkUp cap 400%, npStrength cap 500%)
- `calcNPDamage(servant, config, buffs, enemy, options)` — NP damage with min/avg/max (random range 0.9–1.099)
- `calcNPGainForCard(servant, buffs, enemy, options, cardType, position, firstCardType)` — NP refund per card hit
- `calcCardDamage(...)` — regular card damage with position/first-card bonuses
- `calcStars(...)` — star generation per card

Helper utilities in `src/utils/helpers.js`: `getSv()`, `clamp()`, `getAttributeAdvantage()`.

### Game Constants (`src/constants/gameData.js`)

- `CLASS_ADVANTAGE` — 15×15 class affinity matrix
- `CLASS_CORRECTION` — per-class damage multipliers (e.g. Berserker 1.1×, Caster 0.9×)
- `ATTRIBUTE_MATRIX` — 5×5 attribute advantage (Human/Sky/Earth/Star/Beast)
- `NP_COLOR_CARD_MULT` — Buster 1.5×, Arts 1.0×, Quick 0.8×
- `ENEMY_NP_MOD` — NP gain modifier per enemy class

### Custom Hooks (`src/hooks/`)

- `useServant()` — resolves current servant (DB lookup or custom object)
- `useNpResult()` — memoized NP damage calculation, recomputes on any input change

### Components (`src/components/`)

12 JSX components. Notable: `BuffTable` (5×11 grid input), `CardChainPanel` (interactive card slot selector), `ThreeTResult` (3-turn NP loop simulation), `NPDamageSticky` (sticky result sidebar).

### Styling

MUI theme in `src/theme.js` + global CSS in `src/global.css` with CSS custom properties. Two-column layout (inputs left, results right sticky). Responsive at 1200px and 800px breakpoints.

## Data Source

`FGO计算器Ver9.9_2025因陀罗的试炼.xlsx` — the authoritative upstream data source for this project. All servant stats, NP multipliers, passive skills, hit counts, NP rates, and calculation formulas originate from this Excel spreadsheet. When updating servant data or verifying calculation logic, reference this file as the single source of truth.

## Key Conventions

- Path alias: `@` → `src/` (configured in vite.config.js)
- Build output goes to `docs/` directory for GitHub Pages deployment
- Production base path: `/fgo-np-calculator/`
- Servants are arrays — always use `getSv(servant, 'keyName')`, never direct index access
- Buff values are percentages stored as plain numbers (e.g. 50 means 50%)
- The base damage constant is `0.23` (FGO's ATK multiplier)
