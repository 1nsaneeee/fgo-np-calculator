# Multi-Page Atlas API Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild FGO Calculator as multi-page SPA with Atlas Academy runtime API and JP→CN translation layer.

**Architecture:** React Router v6 with 3 routes (`/servants`, `/calculator`, `/cards`), Atlas basic search API for servant list indexing, nice API for full servant data on demand, static JSON translation tables for JP→CN names. Zustand store refactored to hold `selectedId` + fetched `servantData` (nice format transformed) instead of array index into local `SERVANT_DB`.

**Tech Stack:** React 18, Vite 6, MUI 6, Zustand 5, react-router-dom 6

---

### Task 0: Project Setup

**Files:**
- Modify: `package.json`
- Create: `src/pages/` (directory)
- Create: `src/services/` (directory)
- Create: `src/translations/` (directory)

- [ ] **Step 1: Install react-router-dom**

```bash
npm install react-router-dom@^6
```

- [ ] **Step 2: Create directory structure**

```bash
mkdir -p src/pages src/services src/translations
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json src/pages src/services src/translations
git commit -m "chore: add react-router-dom, create new directory structure"
```

---

### Task 1: NP Color Static Mapping

Because `GET /basic/JP/servant/search` does not return NP card type or deck info, we generate a tiny static mapping from the local `nice_servant.json` for filtering/browsing.

**Files:**
- Create: `src/translations/npColors.json`
- Create: `scripts/extract-basic-mappings.mjs`

- [ ] **Step 1: Write the extraction script**

```javascript
// scripts/extract-basic-mappings.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const input = path.resolve(__dirname, '..', 'nice_servant.json');
const outNpColors = path.resolve(__dirname, '..', 'src', 'translations', 'npColors.json');
const outDecks = path.resolve(__dirname, '..', 'src', 'translations', 'decks.json');
const outRarities = path.resolve(__dirname, '..', 'src', 'translations', 'rarities.json');

const cardMap = { '1': 'Arts', '2': 'Buster', '3': 'Quick' };
const bqMap = { '1': 'A', '2': 'B', '3': 'Q' };

const data = JSON.parse(fs.readFileSync(input, 'utf-8'));

const npColors = {};
const decks = {};
const rarities = {};

for (const s of data) {
  const id = s.id;
  const np = s.noblePhantasms?.[0];
  if (np) npColors[id] = cardMap[np.card] || null;
  if (s.cards) {
    const deck = s.cards.map(c => bqMap[c] || c).join('');
    decks[id] = deck;
  }
  rarities[id] = s.rarity;
}

fs.writeFileSync(outNpColors, JSON.stringify(npColors));
fs.writeFileSync(outDecks, JSON.stringify(decks));
fs.writeFileSync(outRarities, JSON.stringify(rarities));
console.log(`Generated: npColors (${Object.keys(npColors).length}), decks (${Object.keys(decks).length}), rarities (${Object.keys(rarities).length})`);
```

- [ ] **Step 2: Run the extraction script**

```bash
node scripts/extract-basic-mappings.mjs
```

Expected output: `Generated: npColors (458), decks (458), rarities (458)`

- [ ] **Step 3: Commit**

```bash
git add scripts/extract-basic-mappings.mjs src/translations/npColors.json src/translations/decks.json src/translations/rarities.json
git commit -m "feat: add NP color, deck, rarity static mappings extracted from nice_servant.json"
```

---

### Task 2: Translation Mapping Files

Hand-written JP→CN name mappings. Start with the most common servants.

**Files:**
- Create: `src/translations/servant-names.json`

- [ ] **Step 1: Extract template from nice_servant.json and create initial translations**

```bash
node -e "
import fs from 'fs';
const d = JSON.parse(fs.readFileSync('nice_servant.json','utf-8'));
const m = {};
for (const s of d) {
  m[s.originalName || s.name] = '';
}
fs.writeFileSync('src/translations/servant-names-template.json', JSON.stringify(m, null, 2));
"
```

This creates a template with all servant names. Then create the actual translation file. For this task, we create it as an empty JS module that will be populated gradually. The fallback behavior (show JP name when no CN mapping exists) means we can ship with an incomplete map.

- [ ] **Step 2: Write servant-names.json with initial entries for the original 47 servants from servantDb.js**

The current servantDb.js has Chinese names for servants 01-48. Extract those names as initial mappings:

```json
{
  "マシュ・キリエライト": "玛修・基列莱特",
  "アルトリア・ペンドラゴン": "阿尔托莉雅・潘德拉贡",
  "アルトリア・ペンドラゴン〔オルタ〕": "阿尔托莉雅・潘德拉贡〔Alter〕",
  "アルトリア・ペンドラゴン〔リリィ〕": "阿尔托莉雅・潘德拉贡〔Lily〕",
  "ネロ・クラウディウス": "尼禄・克劳狄乌斯",
  "ジークフリート": "齐格飞",
  "ガイウス・ユリウス・カエサル": "盖乌斯・尤利乌斯・恺撒",
  "アルテラ": "阿蒂拉",
  "ジル・ド・レェ": "吉尔・德・雷",
  "シュヴァリエ・デオン": "骑士迪昂",
  "エミヤ": "卫宫",
  "ギルガメッシュ": "吉尔伽美什",
  "ロビンフッド": "罗宾汉",
  "アタランテ": "阿塔兰忒",
  "エウリュアレ": "尤瑞艾莉",
  "アーラシュ": "阿拉什",
  "クー・フーリン": "库・丘林",
  "エリザベート・バートリー": "伊丽莎白・巴托里",
  "武蔵坊弁慶": "武藏坊弁庆",
  "クー・フーリン〔プロトタイプ〕": "库・丘林〔Prototype〕",
  "レオニダス一世": "列奥尼达一世",
  "ロムルス": "罗穆路斯",
  "メドゥーサ": "美杜莎",
  "ゲオルギウス": "乔尔乔斯",
  "エドワード・ティーチ": "爱德华・蒂奇",
  "ブーディカ": "布狄卡",
  "牛若丸": "牛若丸",
  "アレキサンダー": "亚历山大",
  "マリー・アントワネット": "玛丽・安托瓦内特",
  "マルタ": "玛尔达",
  "メディア": "美狄亚",
  "ジル・ド・レェ": "吉尔・德・雷",
  "ハンス・クリスチャン・アンデルセン": "汉斯・克里斯蒂安・安徒生",
  "ウィリアム・シェイクスピア": "威廉・莎士比亚",
  "メフィストフェレス": "梅菲斯托费勒斯",
  "ヴォルフガング・アマデウス・モーツァルト": "沃尔夫冈・阿马德乌斯・莫扎特",
  "諸葛孔明〔エルメロイⅡ世〕": "诸葛孔明〔埃尔梅罗Ⅱ世〕",
  "クー・フーリン": "库・丘林",
  "佐々木小次郎": "佐佐木小次郎",
  "呪腕のハサン": "咒腕哈桑",
  "ステンノ": "斯忒诺",
  "荊軻": "荆轲",
  "シャルル＝アンリ・サンソン": "夏尔・亨利・桑松",
  "ファントム・オブ・ジ・オペラ": "剧院魅影",
  "マタ・ハリ": "玛塔・哈丽",
  "カーミラ": "卡米拉",
  "ヘラクレス": "赫拉克勒斯",
  "ランスロット": "兰斯洛特"
}
```

- [ ] **Step 3: Commit**

```bash
git add src/translations/servant-names.json src/translations/servant-names-template.json
git commit -m "feat: add initial JP→CN servant name translation table"
```

---

### Task 3: Atlas API Service

Encapsulates all Atlas API calls with caching logic.

**Files:**
- Create: `src/services/atlasApi.js`

- [ ] **Step 1: Write the API service**

```javascript
// src/services/atlasApi.js

const BASE = 'https://api.atlasacademy.io';
const CACHE_KEY_LIST = 'atlas_servant_list';
const CACHE_KEY_NICE_PREFIX = 'atlas_nice_';

const niceCache = new Map();       // in-memory: full nice servant data (runtime lifetime)
let listCache = null;              // in-memory: parsed servant list

/**
 * Fetch all basic servant data (lightweight index).
 * Cached in sessionStorage. Returns array of BasicServant objects.
 */
export async function fetchServantList() {
  if (listCache) return listCache;

  const cached = sessionStorage.getItem(CACHE_KEY_LIST);
  if (cached) {
    listCache = JSON.parse(cached);
    return listCache;
  }

  const res = await fetch(`${BASE}/basic/JP/servant/search?type=normal&limit=500`);
  if (!res.ok) throw new Error(`Atlas API error: ${res.status}`);
  const data = await res.json();
  listCache = data;
  sessionStorage.setItem(CACHE_KEY_LIST, JSON.stringify(data));
  return data;
}

/**
 * Fetch full nice servant data by ID. Cached in memory.
 * Returns the nice servant object.
 */
export async function fetchNiceServant(id) {
  if (niceCache.has(id)) return niceCache.get(id);

  const res = await fetch(`${BASE}/nice/JP/servant/${id}?lang=en`);
  if (!res.ok) throw new Error(`Atlas API error: ${res.status}`);
  const data = await res.json();
  niceCache.set(id, data);
  return data;
}

/**
 * Fetch nice equip data by ID.
 */
export async function fetchNiceEquip(id) {
  const res = await fetch(`${BASE}/nice/JP/equip/${id}?lang=en`);
  if (!res.ok) throw new Error(`Atlas API error: ${res.status}`);
  return res.json();
}

/**
 * Clear runtime caches (not sessionStorage).
 */
export function clearRuntimeCache() {
  niceCache.clear();
  listCache = null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/atlasApi.js
git commit -m "feat: add Atlas API service with caching"
```

---

### Task 4: Atlas → Calculator Transform

Convert Atlas `nice_servant` format into the compact array format the calculator engine expects.

**Files:**
- Create: `src/services/transform.js`

- [ ] **Step 1: Write the transform function**

```javascript
// src/services/transform.js
import servantNames from '@/translations/servant-names.json';

const CLASS_MAP = {
  saber: 'Saber', archer: 'Archer', lancer: 'Lancer', rider: 'Rider',
  caster: 'Caster', assassin: 'Assassin', berserker: 'Berserker',
  ruler: 'Ruler', avenger: 'Avenger', alterEgo: 'Alterego',
  moonCancer: 'MoonCancer', foreigner: 'Foreigner', pretender: 'Pretender',
  shielder: 'Shielder', beast: 'Beast',
};

const CARD_TO_COLOR = { '1': 'Arts', '2': 'Buster', '3': 'Quick' };
const CARD_TO_CHAR = { '1': 'A', '2': 'B', '3': 'Q' };

/**
 * Translate a Japanese name to Chinese. Falls back to JP if no mapping exists.
 */
function translateName(jpName) {
  return servantNames[jpName] || jpName;
}

/**
 * Get NP color from the first noble phantasm. Falls back to 'Buster'.
 */
function getNpColor(nps) {
  if (!nps || !nps.length) return 'Buster';
  return CARD_TO_COLOR[nps[0].card] || 'Buster';
}

/**
 * Build a card deck string like 'BBAAQ' from Atlas cards array.
 * Atlas: ['2','1','1','2','3'] → 'BAABQ'
 */
function buildDeck(cards) {
  if (!cards) return 'BBAAQ';
  return cards.map(c => CARD_TO_CHAR[c] || 'B').join('');
}

/**
 * Get hit counts by card type from hitsDistribution/cardDetails.
 * Atlas: { "1": [33,67], "2": [100], "3": [33,67], "4": [12,25,63] }
 * Returns: { bHits, aHits, qHits, eHits }
 */
function getHitCounts(hitsDist) {
  const getLength = (i) => (hitsDist && hitsDist[i] ? hitsDist[i].length : 0);
  // hitsDist keys: 1=Arts, 2=Buster, 3=Quick, 4=Extra
  return {
    bHits: getLength('2'),
    aHits: getLength('1'),
    qHits: getLength('3'),
    eHits: getLength('4'),
  };
}

/**
 * Get ATK at specific levels from growth curve + base/max.
 * Atlas has atkGrowth[level-1] array where level ranges 1-lvMax.
 * level 90 → index 89, level 100 → index 99, level 120 → index 119.
 */
function getAtkAtLevel(s, level) {
  if (!s.atkGrowth) return s.atkMax || 0;
  const idx = Math.min(level - 1, s.atkGrowth.length - 1);
  return s.atkGrowth[idx] || s.atkMax || 0;
}

/**
 * Extract NP damage multipliers (svals) from NP functions.
 * `damageNp` function svals[0..4] → np1~np5, Value/10 = percentage.
 */
function getNpMultipliers(nps) {
  if (!nps || !nps.length) return { np1: 0, np2: 0, np3: 0, np4: 0, np5: 0 };
  const funcs = nps[0].functions || [];
  const damageFunc = funcs.find(f => f.funcType === 'damageNp');
  if (!damageFunc) return { np1: 0, np2: 0, np3: 0, np4: 0, np5: 0 };
  const getVal = (arr, i) => arr[i] ? arr[i].Value / 10 : 0;
  return {
    np1: getVal(damageFunc.svals, 0),
    np2: getVal(damageFunc.svals, 1),
    np3: getVal(damageFunc.svals, 2),
    np4: getVal(damageFunc.svals, 3),
    np5: getVal(damageFunc.svals, 4),
  };
}

/**
 * Extract passive skill buffs from classPassive array.
 * Returns { passiveBuster, passiveArts, passiveQuick, passiveCrit,
 *           passiveNpGen, passiveFlat, passiveNpStrength,
 *           passiveBusterCrit, passiveArtsCrit, passiveQuickCrit }
 */
function getPassives(classPassive) {
  const result = {
    passiveBuster: 0, passiveArts: 0, passiveQuick: 0,
    passiveCrit: 0, passiveNpGen: 0, passiveFlat: 0, passiveNpStrength: 0,
    passiveBusterCrit: 0, passiveArtsCrit: 0, passiveQuickCrit: 0,
  };
  if (!classPassive) return result;

  for (const ps of classPassive) {
    const funcs = ps.functions || [];
    for (const f of funcs) {
      const val = (f.svals && f.svals[0]) ? f.svals[0].Value / 10 : 0;
      switch (f.funcType) {
        case 'addCommandCardAtk':    // 色卡性能提升
          // Check target traits for which color
          if (f.svt?.name?.includes('Buster')) result.passiveBuster += val;
          else if (f.svt?.name?.includes('Arts')) result.passiveArts += val;
          else if (f.svt?.name?.includes('Quick')) result.passiveQuick += val;
          break;
        case 'addCriticalDamage':
          result.passiveCrit += val;
          break;
        case 'addNpGain':
          result.passiveNpGen += val;
          break;
        case 'addNpStrength':
          result.passiveNpStrength += val;
          break;
      }
    }
  }
  return result;
}

/**
 * Main transform: convert Atlas nice servant to calculator compact format.
 * Returns an object with numeric keys matching the current calculator format,
 * compatible with getSv() (using named keys via the fallback path).
 */
export function transformNiceToCalc(nice) {
  const nameJp = nice.originalName || nice.name;
  const hits = getHitCounts(nice.hitsDistribution);
  const npMults = getNpMultipliers(nice.noblePhantasms);
  const passives = getPassives(nice.classPassive);

  // NP rate: Atlas stores per-card NP gain in npGain on the noble phantasm.
  // npGain.arts[0] gives the base NP rate per hit when attacking with Arts (×100).
  // For attack NP rate, use arts NP gain / 100.
  let npRate = 0.5;
  if (nice.noblePhantasms?.[0]?.npGain) {
    const ng = nice.noblePhantasms[0].npGain;
    npRate = (ng.arts?.[0] || ng.buster?.[0] || 86) / 100;
  }

  // starRate: Atlas starGen of 10 means 1.0% star gen.
  // FGO formula: starRate (%) = starGen / 10
  const starRate = (nice.starGen || 100) / 1000;

  return {
    id: nice.id,
    name: translateName(nameJp),
    nameEn: nice.ruby || nice.name,
    class: CLASS_MAP[nice.className] || nice.className,
    attr: (nice.attribute || 'human').charAt(0).toUpperCase() + (nice.attribute || 'human').slice(1),
    npColor: getNpColor(nice.noblePhantasms),
    npRate,
    npHits: (nice.noblePhantasms?.[0]?.npDistribution || []).length || 1,
    ...hits,
    starRate,
    deck: buildDeck(nice.cards),
    atk90: getAtkAtLevel(nice, 90),
    atk100: getAtkAtLevel(nice, 100),
    atk120: getAtkAtLevel(nice, 120),
    ...npMults,
    ...passives,
    // Extra Atlas data kept for future use (image URLs, etc.)
    _face: nice.extraAssets?.faces?.ascension?.['1'] || '',
    _rarity: nice.rarity || 1,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/transform.js
git commit -m "feat: add Atlas nice → calculator transform with JP→CN translation"
```

---

### Task 5: Update Servant Slice

Replace `selectedIndex` + `SERVANT_DB` with `selectedId` + fetched `servantData`.

**Files:**
- Modify: `src/store/servantSlice.js`

- [ ] **Step 1: Rewrite servantSlice.js**

```javascript
// src/store/servantSlice.js
import { CUSTOM_SERVANT_DEFAULTS } from '@/constants/servantKeys';

export const createServantSlice = (set) => ({
  selectedId: null,
  servantData: null,        // transformed nice data (object with named keys)
  isCustom: false,
  customServant: { ...CUSTOM_SERVANT_DEFAULTS },
  servantList: [],          // cached basic servant list
  servantLoading: false,
  servantError: null,

  selectServant: (id) => set({ selectedId: id, isCustom: false }),

  setServantData: (data) => set({ servantData: data }),

  setServantList: (list) => set({ servantList: list }),

  setServantLoading: (loading) => set({ servantLoading: loading }),

  setServantError: (error) => set({ servantError: error }),

  setCustomMode: (isCustom) => set({
    isCustom,
  }),

  setCustomServant: (servant) => set({ customServant: servant }),

  resetServant: () => set({
    selectedId: null,
    servantData: null,
    isCustom: false,
    customServant: { ...CUSTOM_SERVANT_DEFAULTS },
  }),
});
```

- [ ] **Step 2: Commit**

```bash
git add src/store/servantSlice.js
git commit -m "refactor: replace selectedIndex with selectedId + servantData in servantSlice"
```

---

### Task 6: Update useServant and useNpResult Hooks

Adapt hooks for the new data flow.

**Files:**
- Modify: `src/hooks/useServant.js`
- Modify: `src/hooks/useNpResult.js`

- [ ] **Step 1: Rewrite useServant.js**

```javascript
// src/hooks/useServant.js
import { useMemo } from 'react';
import useStore from '@/store/index';

export function useServant() {
  const servantData = useStore((s) => s.servantData);
  const isCustom = useStore((s) => s.isCustom);
  const customServant = useStore((s) => s.customServant);

  const servant = useMemo(() => {
    if (isCustom) return customServant;
    if (servantData) return servantData;
    return null;
  }, [isCustom, customServant, servantData]);

  return servant;
}
```

- [ ] **Step 2: useNpResult.js — no changes needed**

The `useNpResult` hook already calls `useServant()` and passes the result to `calcNPDamage`. Since `transformNiceToCalc` returns an object with named keys compatible with `getSv()`, the existing calculation logic works without changes.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useServant.js
git commit -m "refactor: update useServant to read servantData from store"
```

---

### Task 7: Layout Component

AppBar navigation + servant indicator bar.

**Files:**
- Create: `src/components/Layout.jsx`

- [ ] **Step 1: Write Layout component**

```jsx
// src/components/Layout.jsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Tabs, Tab, Chip, Avatar, Box, Button } from '@mui/material';
import useStore from '@/store/index';
import { CLASS_COLORS } from '@/constants/gameData';
import npColors from '@/translations/npColors.json';

const TABS = [
  { label: '从者列表', path: '/servants' },
  { label: '计算器', path: '/calculator' },
  { label: '出卡概率', path: '/cards' },
];

function tabValue(pathname) {
  if (pathname.startsWith('/calculator')) return '/calculator';
  if (pathname.startsWith('/cards')) return '/cards';
  return '/servants';
}

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedId = useStore((s) => s.selectedId);
  const servantData = useStore((s) => s.servantData);
  const isCustom = useStore((s) => s.isCustom);

  const currentTab = tabValue(location.pathname);

  return (
    <Box>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar variant="dense" sx={{ gap: 2 }}>
          <Box
            component="span"
            sx={{ fontWeight: 900, fontSize: '0.95rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            onClick={() => navigate('/servants')}
          >
            FGO Calc
          </Box>
          <Tabs
            value={currentTab}
            onChange={(_, v) => navigate(v)}
            textColor="inherit"
            sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, fontSize: '0.85rem', textTransform: 'none' } }}
          >
            {TABS.map(t => <Tab key={t.path} label={t.label} value={t.path} />)}
          </Tabs>
        </Toolbar>
      </AppBar>

      {/* Servant indicator bar — only when a servant is selected */}
      {(selectedId || isCustom) && (
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            px: 2, py: 1, bgcolor: 'action.hover', borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {servantData && (
            <Avatar
              src={servantData._face}
              sx={{ width: 32, height: 32 }}
            />
          )}
          <Box sx={{ flex: 1 }}>
            <Box component="span" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
              {isCustom ? '自定义从者' : (servantData?.name || '加载中...')}
            </Box>
            {servantData && (
              <Box component="span" sx={{ ml: 1, fontSize: '0.8rem', color: 'text.secondary' }}>
                {servantData.class} ★{servantData._rarity}
              </Box>
            )}
          </Box>
          <Button size="small" onClick={() => navigate('/servants')}>
            切换从者
          </Button>
        </Box>
      )}

      <Box component="main" className="main-col">
        <Outlet />
      </Box>
    </Box>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Layout.jsx
git commit -m "feat: add Layout component with AppBar navigation and servant indicator"
```

---

### Task 8: ServantCard Component

Individual servant card for the grid view.

**Files:**
- Create: `src/components/ServantCard.jsx`

- [ ] **Step 1: Write ServantCard component**

```jsx
// src/components/ServantCard.jsx
import { Box, Card, CardActionArea, Rating } from '@mui/material';
import { CLASS_COLORS } from '@/constants/gameData';
import npColors from '@/translations/npColors.json';
import servantNames from '@/translations/servant-names.json';

const NPC_LABEL = { Buster: 'B', Arts: 'A', Quick: 'Q' };

export default function ServantCard({ basic, onClick }) {
  const className = basic.className
    ? (basic.className.charAt(0).toUpperCase() + basic.className.slice(1))
    : '';
  const classColor = CLASS_COLORS[className] || '#333';
  const npColor = npColors[basic.id] || 'Buster';
  const npChar = NPC_LABEL[npColor] || 'B';
  const nameJp = basic.originalName || basic.name || '';
  const nameCn = servantNames[nameJp] || nameJp;
  const npColorHex = npColor === 'Buster' ? '#c0392b' : npColor === 'Arts' ? '#2980b9' : '#27ae60';

  return (
    <Card sx={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
      <CardActionArea onClick={onClick} sx={{ p: 1 }}>
        <Box sx={{ position: 'relative', mb: 0.5 }}>
          <Box
            component="img"
            src={basic.face}
            alt={nameCn}
            loading="lazy"
            sx={{
              width: '100%', aspectRatio: '1',
              objectFit: 'cover', borderRadius: 1,
              bgcolor: classColor,
            }}
          />
          <Box sx={{
            position: 'absolute', top: 4, left: 4,
            bgcolor: classColor, color: '#fff',
            px: 0.5, borderRadius: 0.5,
            fontSize: '0.65rem', fontWeight: 700,
            lineHeight: 1.4,
          }}>
            {className.slice(0, 4)}
          </Box>
          <Box sx={{
            position: 'absolute', top: 4, right: 4,
            bgcolor: npColorHex, color: '#fff',
            width: 18, height: 18, borderRadius: '50%',
            fontSize: '0.6rem', fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {npChar}
          </Box>
        </Box>
        <Box sx={{ fontSize: '0.78rem', fontWeight: 700, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {nameCn}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
          <Rating value={basic.rarity} readOnly size="small" max={5} sx={{ fontSize: '0.7rem' }} />
          <Box component="span" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
            ATK {basic.atkMax?.toLocaleString() || '?'}
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ServantCard.jsx
git commit -m "feat: add ServantCard component for grid display"
```

---

### Task 9: ServantFilterPanel Component

Sidebar filter panel with multi-select for class, rarity, NP color.

**Files:**
- Create: `src/components/ServantFilterPanel.jsx`

- [ ] **Step 1: Write ServantFilterPanel**

```jsx
// src/components/ServantFilterPanel.jsx
import { Box, FormControlLabel, Checkbox, Typography, Divider, Button } from '@mui/material';
import { MAIN_CLASSES, EXTRA_CLASSES, CLASS_COLORS } from '@/constants/gameData';

const RARITY_OPTIONS = [
  { label: '★1-3', values: [1, 2, 3] },
  { label: '★4', values: [4] },
  { label: '★5', values: [5] },
];

const NP_COLORS = ['Buster', 'Arts', 'Quick'];

export default function ServantFilterPanel({
  classFilter, setClassFilter,
  rarityFilter, setRarityFilter,
  npColorFilter, setNpColorFilter,
  onReset,
}) {
  const allClasses = [...MAIN_CLASSES, ...EXTRA_CLASSES];

  const toggleClass = (cls) => {
    setClassFilter(prev =>
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  const toggleRarity = (val) => {
    setRarityFilter(prev => {
      if (prev.includes(val)) return prev.filter(v => v !== val);
      return [...prev, val];
    });
  };

  const toggleNpColor = (color) => {
    setNpColorFilter(prev => {
      if (prev.includes(color)) return prev.filter(c => c !== color);
      return [...prev, color];
    });
  };

  return (
    <Box sx={{ width: 160, flexShrink: 0 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>职阶 Class</Typography>
      {allClasses.map(cls => (
        <FormControlLabel
          key={cls}
          control={
            <Checkbox
              size="small"
              checked={classFilter.includes(cls)}
              onChange={() => toggleClass(cls)}
              sx={{
                color: CLASS_COLORS[cls],
                '&.Mui-checked': { color: CLASS_COLORS[cls] },
                p: 0.5,
              }}
            />
          }
          label={<Box component="span" sx={{ fontSize: '0.8rem' }}>{cls}</Box>}
          sx={{ display: 'flex', ml: 0, mb: -0.5, '& .MuiFormControlLabel-label': { ml: 0.5 } }}
        />
      ))}

      <Divider sx={{ my: 1.5 }} />

      <Typography variant="subtitle2" sx={{ mb: 1 }}>稀有度 Rarity</Typography>
      {RARITY_OPTIONS.map(opt => (
        <FormControlLabel
          key={opt.label}
          control={
            <Checkbox
              size="small"
              checked={rarityFilter.includes(opt.values[0])}
              onChange={() => toggleRarity(opt.values[0])}
              sx={{ p: 0.5 }}
            />
          }
          label={<Box component="span" sx={{ fontSize: '0.8rem' }}>{opt.label}</Box>}
          sx={{ display: 'flex', ml: 0, mb: -0.5 }}
        />
      ))}

      <Divider sx={{ my: 1.5 }} />

      <Typography variant="subtitle2" sx={{ mb: 1 }}>宝具色卡 NP Color</Typography>
      {NP_COLORS.map(color => (
        <FormControlLabel
          key={color}
          control={
            <Checkbox
              size="small"
              checked={npColorFilter.includes(color)}
              onChange={() => toggleNpColor(color)}
              sx={{
                color: color === 'Buster' ? '#c0392b' : color === 'Arts' ? '#2980b9' : '#27ae60',
                '&.Mui-checked': { color: color === 'Buster' ? '#c0392b' : color === 'Arts' ? '#2980b9' : '#27ae60' },
                p: 0.5,
              }}
            />
          }
          label={<Box component="span" sx={{ fontSize: '0.8rem' }}>{color}</Box>}
          sx={{ display: 'flex', ml: 0, mb: -0.5 }}
        />
      ))}

      <Divider sx={{ my: 1.5 }} />

      <Button size="small" variant="outlined" fullWidth onClick={onReset}>
        重置 Reset
      </Button>
    </Box>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ServantFilterPanel.jsx
git commit -m "feat: add ServantFilterPanel with multi-select class/rarity/NP filters"
```

---

### Task 10: ServantListPage

The full servant browsing page with filter panel + card grid + search bar.

**Files:**
- Create: `src/pages/ServantListPage.jsx`

- [ ] **Step 1: Write ServantListPage**

```jsx
// src/pages/ServantListPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, MenuItem, Select, FormControl, InputLabel, Pagination, Typography, CircularProgress, Alert } from '@mui/material';
import useStore from '@/store/index';
import { fetchServantList } from '@/services/atlasApi';
import { transformNiceToCalc } from '@/services/transform';
import ServantCard from '@/components/ServantCard';
import ServantFilterPanel from '@/components/ServantFilterPanel';
import npColors from '@/translations/npColors.json';
import servantNames from '@/translations/servant-names.json';

const PAGE_SIZE = 50;

export default function ServantListPage() {
  const navigate = useNavigate();
  const setSelectedId = useStore((s) => s.selectServant);
  const setServantData = useStore((s) => s.setServantData);
  const setServantList = useStore((s) => s.setServantList);
  const servantList = useStore((s) => s.servantList);
  const loading = useStore((s) => s.servantLoading);
  const setLoading = useStore((s) => s.setServantLoading);
  const error = useStore((s) => s.servantError);
  const setError = useStore((s) => s.setServantError);

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState([]);
  const [rarityFilter, setRarityFilter] = useState([1, 2, 3, 4, 5]);
  const [npColorFilter, setNpColorFilter] = useState([]);
  const [sortBy, setSortBy] = useState('collectionNo');
  const [page, setPage] = useState(1);

  // Load servant list on mount
  useEffect(() => {
    if (servantList.length > 0) return;
    setLoading(true);
    fetchServantList()
      .then(list => {
        setServantList(list);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Apply filters + search
  const filtered = useMemo(() => {
    let results = servantList;

    // Class filter
    if (classFilter.length > 0) {
      results = results.filter(s => classFilter.includes(
        (s.className || '').charAt(0).toUpperCase() + (s.className || '').slice(1)
      ));
    }

    // Rarity filter
    if (rarityFilter.length < 3) {
      const allowed = new Set();
      for (const v of rarityFilter) {
        if (v === 1) { allowed.add(1); allowed.add(2); allowed.add(3); }
        else allowed.add(v);
      }
      results = results.filter(s => allowed.has(s.rarity));
    }

    // NP color filter
    if (npColorFilter.length > 0) {
      results = results.filter(s => npColorFilter.includes(npColors[s.id] || 'Buster'));
    }

    // Search
    const q = search.toLowerCase().trim();
    if (q) {
      results = results.filter(s => {
        const nameJp = s.originalName || s.name || '';
        const nameCn = servantNames[nameJp] || nameJp;
        return nameCn.toLowerCase().includes(q)
          || nameJp.toLowerCase().includes(q)
          || String(s.collectionNo).includes(q);
      });
    }

    // Sort
    switch (sortBy) {
      case 'rarity':     results.sort((a, b) => b.rarity - a.rarity); break;
      case 'atkMax':     results.sort((a, b) => (b.atkMax || 0) - (a.atkMax || 0)); break;
      case 'hpMax':      results.sort((a, b) => (b.hpMax || 0) - (a.hpMax || 0)); break;
      default:           results.sort((a, b) => (a.collectionNo || 0) - (b.collectionNo || 0)); break;
    }

    return results;
  }, [servantList, classFilter, rarityFilter, npColorFilter, search, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, classFilter, rarityFilter, npColorFilter]);

  const handleSelect = async (basic) => {
    setSelectedId(basic.id);
    setLoading(true);
    try {
      // Lazy import to avoid circular dependency
      const { fetchNiceServant } = await import('@/services/atlasApi');
      const nice = await fetchNiceServant(basic.id);
      const data = transformNiceToCalc(nice);
      setServantData(data);
      setLoading(false);
      navigate('/calculator');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setClassFilter([]);
    setRarityFilter([1, 2, 3, 4, 5]);
    setNpColorFilter([]);
    setSearch('');
    setSortBy('collectionNo');
  };

  if (loading && servantList.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">无法加载从者列表: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
      <ServantFilterPanel
        classFilter={classFilter}
        setClassFilter={setClassFilter}
        rarityFilter={rarityFilter}
        setRarityFilter={setRarityFilter}
        npColorFilter={npColorFilter}
        setNpColorFilter={setNpColorFilter}
        onReset={handleReset}
      />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="搜索从者名称或编号..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>排序</InputLabel>
            <Select
              value={sortBy}
              label="排序"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="collectionNo">ID 顺序</MenuItem>
              <MenuItem value="rarity">稀有度</MenuItem>
              <MenuItem value="atkMax">ATK</MenuItem>
              <MenuItem value="hpMax">HP</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          共 {filtered.length} 位从者
        </Typography>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 1,
        }}>
          {pageItems.map((basic) => (
            <ServantCard
              key={basic.id}
              basic={basic}
              onClick={() => handleSelect(basic)}
            />
          ))}
        </Box>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, p) => setPage(p)}
              size="small"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/ServantListPage.jsx
git commit -m "feat: add ServantListPage with filter panel, card grid, and search"
```

---

### Task 11: CalculatorPage

Migrate the current `App.jsx` content into a page component, splitting sections into MUI Tabs.

**Files:**
- Create: `src/pages/CalculatorPage.jsx`

- [ ] **Step 1: Write CalculatorPage**

```jsx
// src/pages/CalculatorPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import useStore from '@/store/index';
import { useServant } from '@/hooks/useServant';
import { useNpResult } from '@/hooks/useNpResult';

import ServantStats from '@/components/ServantStats';
import LevelConfig from '@/components/LevelConfig';
import EnemyPanel from '@/components/EnemyPanel';
import OptionsPanel from '@/components/OptionsPanel';
import BuffTable from '@/components/BuffTable';
import NPDamageResult from '@/components/NPDamageResult';
import CardChainPanel from '@/components/CardChainPanel';
import CardDrawPanel from '@/components/CardDrawPanel';
import ThreeTResult from '@/components/ThreeTResult';
import PresetButtons from '@/components/PresetButtons';
import CustomServantForm from '@/components/CustomServantForm';

export default function CalculatorPage() {
  const navigate = useNavigate();
  const selectedId = useStore((s) => s.selectedId);
  const isCustom = useStore((s) => s.isCustom);
  const setCustomMode = useStore((s) => s.setCustomMode);
  const resetServant = useStore((s) => s.resetServant);
  const resetConfig = useStore((s) => s.resetConfig);
  const resetBuffs = useStore((s) => s.resetBuffs);
  const resetEnemy = useStore((s) => s.resetEnemy);
  const resetOptions = useStore((s) => s.resetOptions);

  const servant = useServant();
  const npResult = useNpResult();

  const [tab, setTab] = useState(0);
  const [customOpen, setCustomOpen] = useState(false);

  const handleReset = () => {
    resetServant();
    resetConfig();
    resetBuffs();
    resetEnemy();
    resetOptions();
  };

  // If no servant selected, show prompt
  if (!selectedId && !isCustom) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <p>请先从从者列表中选择一位从者</p>
        <Button variant="contained" onClick={() => navigate('/servants')}>
          前往从者列表
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Database/Custom toggle */}
      <Box sx={{ display: 'flex', gap: 0, px: 2, pt: 2 }}>
        <Button
          variant={!isCustom ? 'contained' : 'outlined'}
          onClick={() => setCustomMode(false)}
          sx={{ flex: 1, borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)' }}
        >
          数据库 Database
        </Button>
        <Button
          variant={isCustom ? 'contained' : 'outlined'}
          onClick={() => { setCustomMode(true); setCustomOpen(true); }}
          sx={{ flex: 1, borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}
        >
          自定义 Custom
        </Button>
      </Box>

      {/* Custom servant dialog */}
      <Dialog open={customOpen && isCustom} onClose={() => setCustomOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>自定义从者</DialogTitle>
        <DialogContent>
          <CustomServantForm />
        </DialogContent>
      </Dialog>

      {/* Servant stats summary */}
      {servant && !isCustom && (
        <Box sx={{ px: 2, pt: 1 }}>
          <ServantStats servant={servant} />
        </Box>
      )}

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ px: 2, borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="伤害计算" />
        <Tab label="三回合模拟" />
        <Tab label="指令卡链" />
      </Tabs>

      {/* Tab 0: Damage Calculation */}
      {tab === 0 && (
        <Box sx={{ px: 2 }}>
          <div className="config-row">
            <div className="section">
              <h2 className="panel-title">Level Config</h2>
              <LevelConfig />
            </div>
            <div className="section">
              <h2 className="panel-title">Enemy & Options</h2>
              <EnemyPanel />
              <div style={{ marginTop: 'var(--space-sm)' }}>
                <OptionsPanel />
              </div>
            </div>
          </div>

          <PresetButtons />

          <div className="section">
            <BuffTable />
          </div>

          <NPDamageResult result={npResult} servant={servant} />

          <CardDrawPanel />
        </Box>
      )}

      {/* Tab 1: 3-Turn Simulation */}
      {tab === 1 && (
        <Box sx={{ px: 2 }}>
          <div className="config-row">
            <div className="section">
              <h2 className="panel-title">Level Config</h2>
              <LevelConfig />
            </div>
            <div className="section">
              <h2 className="panel-title">Enemy & Options</h2>
              <EnemyPanel />
              <div style={{ marginTop: 'var(--space-sm)' }}>
                <OptionsPanel />
              </div>
            </div>
          </div>
          <PresetButtons />
          <div className="section">
            <BuffTable />
          </div>
          <ThreeTResult />
        </Box>
      )}

      {/* Tab 2: Card Chain */}
      {tab === 2 && (
        <Box sx={{ px: 2 }}>
          <CardChainPanel />
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
        <Button variant="outlined" color="error" onClick={handleReset}
          sx={{ fontSize: 'var(--font-sm)' }}>
          {'⟲'} Reset All
        </Button>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/CalculatorPage.jsx
git commit -m "feat: add CalculatorPage with tabbed damage/3T/card-chain layout"
```

---

### Task 12: CardDrawPage

Extract the card draw probability into its own route page.

**Files:**
- Create: `src/pages/CardDrawPage.jsx`

- [ ] **Step 1: Write CardDrawPage**

```jsx
// src/pages/CardDrawPage.jsx
import { Box } from '@mui/material';
import CardDrawPanel from '@/components/CardDrawPanel';

export default function CardDrawPage() {
  return (
    <Box sx={{ p: 3 }}>
      <h2 className="panel-title">出卡概率计算器 Card Draw Probability</h2>
      <CardDrawPanel />
    </Box>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/CardDrawPage.jsx
git commit -m "feat: add CardDrawPage route for card draw probability"
```

---

### Task 13: Update App.jsx with BrowserRouter

Replace the current `App.jsx` content with route configuration.

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Rewrite App.jsx**

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ServantListPage from '@/pages/ServantListPage';
import CalculatorPage from '@/pages/CalculatorPage';
import CardDrawPage from '@/pages/CardDrawPage';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">FGO NP Damage Calculator // 宝具伤害计算器</h1>
        </header>

        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/servants" replace />} />
            <Route path="/servants" element={<ServantListPage />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/cards" element={<CardDrawPage />} />
          </Route>
        </Routes>

        <footer className="app-footer">
          FGO Damage Calculator v4.0 · Data from Atlas Academy API · React 18 + Vite + MUI + Zustand
        </footer>
      </div>
    </BrowserRouter>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "refactor: replace single-page App with React Router SPA"
```

---

### Task 14: Update main.jsx

Ensure the entry point still works with the new routing setup.

**Files:**
- Modify: `src/main.jsx`

- [ ] **Step 1: Update main.jsx console log**

No structural changes needed — `main.jsx` renders `<App />` which now contains BrowserRouter. Just bump the version number:

```jsx
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import theme from './theme';
import './global.css';

console.log(
  '%c FGO Calculator %c v4.0 ',
  'color:oklch(0.78 0.18 195);font-family:monospace;font-size:22px;font-weight:900;letter-spacing:3px',
  'color:oklch(0.58 0.02 240);font-family:monospace;font-size:12px'
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

- [ ] **Step 2: Commit**

```bash
git add src/main.jsx
git commit -m "chore: bump version to v4.0 in console log"
```

---

### Task 15: global.css Adjustments

For the new layout, the existing `.config-row` and sticky sidebar classes should still work. Add a few utils for the servant list page.

**Files:**
- Modify: `src/global.css`

- [ ] **Step 1: No changes needed to global.css**

The existing CSS grid classes, `.section`, `.config-row`, `.panel-title`, etc., are used in `CalculatorPage` exactly as before. The servant list page uses MUI components directly without custom CSS classes. The sticky result sidebar (`.result-sticky`) still works since it's inside the CalculatorPage content area.

- [ ] **Step 2: Commit**

(No changes — skip this commit)

---

### Task 16: Build and Verify

**Files:** (none)

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Expected: Dev server starts on http://localhost:5173

- [ ] **Step 2: Verify routes work**

- Navigate to `/` → should redirect to `/servants`
- `/servants` → servant list loads from Atlas API, card grid displays
- Click a servant → navigates to `/calculator` with servant data loaded
- `/cards` → card draw probability page

- [ ] **Step 3: Verify calculation works**

- Select a servant → CalculatorPage shows servant stats
- Adjust buffs → NPDamageResult updates
- Switch to 三回合 tab → ThreeTResult works
- Switch to 指令卡链 tab → CardChainPanel works

- [ ] **Step 4: Production build**

```bash
npm run build
```

Expected: Build succeeds, output in `docs/` directory.

```bash
npm run preview
```

Expected: Preview server serves the app with correct basename `/fgo-np-calculator/`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: verify build and routing"
```
