# FGO Calculator v4.0 — Multi-Page + Atlas API Integration Design

## Overview

将现有的单页长滚动 FGO 计算器重构为多页 SPA，接入 Atlas Academy 运行时 API，增加 JP→CN 翻译层。

## Motivation

- **从者选择体验差**：435+ 从者挤在单个 Autocomplete 下拉框，筛选能力弱
- **单页长滚动**：所有功能堆在一个页面，导航困难，无法深层链接
- **数据维护成本高**：手写 `servantDb.js`，更新依赖人工
- **无本地化**：Atlas 数据为日文/英文，需要中文翻译层

## Architecture

```
┌──────────────────────────────────────────────────┐
│              Atlas Academy API                    │
│  GET /basic/JP/servant/search  (轻量索引)         │
│  GET /nice/JP/servant/{id}     (完整从者数据)     │
│  GET /nice/JP/equip/search     (礼装数据)          │
│  static.atlasacademy.io        (图片 CDN)         │
└────────────────────┬─────────────────────────────┘
                     │ runtime fetch + cache
┌────────────────────▼─────────────────────────────┐
│              React SPA (React Router v6)          │
│                                                   │
│  Layout: AppBar 导航 + 选中从者指示条              │
│                                                   │
│  /servants     → ServantListPage  (从者浏览+选择)  │
│  /calculator   → CalculatorPage   (计算器主体)     │
│  /cards        → CardDrawPage     (出卡概率)       │
│                                                   │
│  Zustand Store (跨页面共享选中从者、配置、Buff)    │
│  src/translations/ (静态翻译映射表，~50KB)         │
└──────────────────────────────────────────────────┘
```

## Routes

| Route | Page | 说明 |
|-------|------|------|
| `/` | Redirect → `/servants` | |
| `/servants` | ServantListPage | 从者浏览/搜索/筛选/选择 |
| `/calculator` | CalculatorPage | 伤害计算 + 三回合 + 指令卡链（Tab 切换） |
| `/cards` | CardDrawPage | 出卡概率计算器 |

## Data Flow

### 从者列表加载
1. `ServantListPage` mount → `GET /basic/JP/servant/search?{className, rarity, ...}`
2. 返回轻量数组（name, className, rarity, face, atkMax, id, ...）
3. 首次加载全量（435+），存入 Map + sessionStorage，后续筛选/排序本地完成

### 从者选择 → 计算器
1. 用户点击从者卡片 → `store.setSelectedId(id)` → navigate to `/calculator`
2. `CalculatorPage` → check 内存缓存 → 未命中则 `GET /nice/JP/servant/{id}`
3. `transformNiceToCalc(niceData)` 将 Atlas 格式转为计算器内部格式
4. 触发 NP 伤害/回 NP/出星计算

### 缓存策略

| 缓存目标 | 位置 | 生命周期 |
|----------|------|----------|
| 从者列表 | sessionStorage | 浏览器会话 |
| nice 从者数据 (已选) | 内存 Map (Zustand store) | 页面存在期间 |
| 翻译映射表 | 静态 JS 文件 (打包进 bundle) | 跟随部署 |

## API Mapping: Atlas Nice → Calculator Format

```
nice_servant                    →  计算器内部格式
─────────────────────────────────────────────────────
id                              →  id
name + servant-names.json       →  name (中文)
name (ruby/romaji)             →  nameEn
className                       →  class (capitalize)
attribute                       →  attr
noblePhantasms[0].card          →  npColor (1→Arts, 2→Buster, 3→Quick)
TODO: locate in nice/raw     →  npRate (Atlas nice中无顶层字段, 需在raw数据或npGain中定位)
noblePhantasms[0].npDistribution→  npHits (数组长度 = hit数)
hitsDistribution/cardDetails    →  bHits, aHits, qHits, eHits (各卡hit数组长度)
TODO: confirm scale factor      →  starRate (Atlas starGen=100 对应 10%, 需确认除数)
cards[]                         →  deck (3→B, 1→A, 2→Q)
atkGrowth[特定等级]              →  atk90, atk100, atk120 (成长曲线索引)
hpMax                           →  hpMax
noblePhantasms[0].functions[]
  [funcType=damageNp].svals     →  np1~np5 (Value/10 = 百分比%)
classPassive[]                  →  passiveBuster/Arts/Quick/Crit/NpGen/Flat...
```

## ServantListPage Design

```
┌──────────────────────────────────────────────────────────┐
│  [搜索框: 名称/编号模糊搜索...]  [排序: ▼ 稀有度/ID/ATK]  │
├──────────┬───────────────────────────────────────────────┤
│ 筛选面板 │                    卡片网格 (CSS Grid)         │
│          │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │
│ 职阶     │  │ 头像  │ │ 头像  │ │ 头像  │ │ 头像  │         │
│ [多选]   │  │ 职阶  │ │ 职阶  │ │ 职阶  │ │ 职阶  │         │
│ Saber    │  │★★★☆☆│ │★★★★★│ │★★★★☆│ │★★★★★│         │
│ Archer   │  │ 中文名 │ │ 中文名 │ │ 中文名 │ │ 中文名 │         │
│ Lancer   │  └──────┘ └──────┘ └──────┘ └──────┘         │
│ Rider    │                                               │
│ ...      │           (分页: < 1 2 3 ... >)               │
│          │                                               │
│ 稀有度   │                                               │
│ ★1-3 ★4 ★5                                              │
│          │                                               │
│ 宝具色卡 │                                               │
│ Buster   │                                               │
│ Arts     │                                               │
│ Quick    │                                               │
│          │                                               │
│ [重置]   │                                               │
└──────────┴───────────────────────────────────────────────┘
```

### 卡片 Component

- 头像：`nice_servant.extraAssets.faces.ascension["1"]` (40×40px 圆角)
- 职阶色标 (背景色按 CLASS_COLORS)
- 宝具色卡标记 (B/A/Q 小标签)
- 中文名 (主标题)
- 稀有度星标 (MUI Rating 只读)
- 点击 → store.setSelectedId + navigate("/calculator")

### 筛选逻辑

- 搜索框：模糊匹配 name(翻译后中文) / originalName(日文) / collectionNo
- 职阶：多选 Chip，OR 逻辑
- 稀有度：多选，OR 逻辑
- 宝具色卡：多选，OR 逻辑（需先加载 nice 数据或从 basic 扩展）
- 排序：collectionNo / rarity / atkMax / hpMax
- 分页：每页 50 张卡片

## CalculatorPage Design

```
┌──────────────────────────────────────────────┐
│  [当前从者: 头像 | 中文名 | 职阶 | ★ | ATK]   │  ← 摘要条
│  [切换从者] → navigates /servants             │
│  [自定义模式] → Dialog(CustomServantForm)      │
├──────────────────────────────────────────────┤
│  [Tab: 伤害计算] [Tab: 三回合模拟] [Tab: 指令卡链] │
├──────────────────────────────────────────────┤
│                                              │
│  Level Config  |  Enemy & Options            │  ← 现有组件
│  PresetButtons                               │
│  BuffTable                                   │
│  NPDamageResult                              │
│                                              │
│  出卡概率 (卡片)                               │
│  [Reset All]                                 │
└──────────────────────────────────────────────┘
```

### Tab 内容

- **伤害计算** (默认)：LevelConfig + EnemyPanel + OptionsPanel + BuffTable + NPDamageResult + CardDrawPanel
- **三回合模拟**：ThreeTResult
- **指令卡链**：CardChainPanel

### 从者摘要条

- 始终可见，点击"切换从者"跳转到 `/servants`
- 有"自定义模式"按钮，点击弹出 Dialog 展示现有 CustomServantForm

## Translation Layer

```
src/translations/
  servant-names.json    # { "アルトリア・ペンドラゴン": "阿尔托莉雅・潘德拉贡", ... }
  skill-names.json      # { "カリスマ B": "领袖气质 B", ... }
  np-names.json         # { "約束された勝利の剣": "誓约胜利之剑", ... }
```

- 纯静态 JSON，构建时打包，约 20-50KB
- 翻译映射表以日文名(originalName) 为 key
- 从者选择后，`transformNiceToCalc()` 查表将名称转为中文
- 技能/宝具名检查映射表 → 命中则用中文，未命中则显示日文原名

### 翻译覆盖流程
1. `build-l10n.mjs` 脚本从 `nice_servant.json` 提取所有日文名称 → 生成模板 JSON（值为空字符串）
2. 人工填写中文翻译
3. 脚本验证：检查新增从者是否有缺失翻译

## Layout Shell

```
┌─────────────────────────────────────────────┐
│  AppBar (position: sticky)                  │
│  [Logo]  [从者列表]  [计算器]  [出卡概率]      │  ← MUI Tabs + React Router NavLink
├─────────────────────────────────────────────┤
│  Selected Servant Bar                       │
│  [头像] 阿尔托莉雅・潘德拉贡  Saber ★5  [切换] │  ← 仅当有选中从者时显示
├─────────────────────────────────────────────┤
│  <Outlet> (page content)                    │
└─────────────────────────────────────────────┘
```

## File Changes Summary

### New Files
```
src/pages/
  ServantListPage.jsx      # 从者浏览页
  CalculatorPage.jsx        # 计算器页 (迁移自 App.jsx)
  CardDrawPage.jsx          # 出卡概率页

src/components/
  Layout.jsx                # AppBar + 从者指示条 + Outlet
  ServantCard.jsx           # 从者卡片组件
  ServantFilterPanel.jsx    # 筛选面板

src/services/
  atlasApi.js               # Atlas API 客户端 + 缓存逻辑
  transform.js              # Atlas → 计算器数据格式转换

src/translations/
  servant-names.json        # 从者名翻译表
  skill-names.json          # 技能名翻译表
  np-names.json             # 宝具名翻译表

scripts/
  build-l10n.mjs            # 从 nice_servant.json 提取需翻译的名称
```

### Modified Files
```
package.json                # + react-router-dom
src/App.jsx                 # → 拆为 Layout + 路由配置
src/store/servantSlice.js   # + selectedId, servantData, fetch cache
src/store/index.js           # 合并新 slice
```

### Removed
```
FGO-Calculator.html         # 旧版单文件
servant_db.js               # 旧版 standalone DB (如果存在)
```

## Dependencies

```
+ react-router-dom ^6.x     (~15KB gzipped)
```

## Constraints

- GitHub Pages 静态部署不变 (basename: `/fgo-np-calculator/`)
- Atlas API 已返回 `Access-Control-Allow-Origin: *`，无 CORS 问题
- 翻译表首批覆盖 常见从者，未覆盖的显示日文原名作为 fallback
- 首次从者列表加载约 500KB (GET /basic/JP/servant/search?type=normal&limit=500, 458从者)
