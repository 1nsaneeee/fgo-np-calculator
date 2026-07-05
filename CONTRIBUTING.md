# Contributing

感谢你对 FGO 宝具伤害计算器的关注！欢迎提交 Issue 和 Pull Request。

## 快速开始

```bash
git clone https://github.com/1nsaneeee/fgo-np-calculator.git
cd fgo-np-calculator
npm install
npm run dev        # http://localhost:5173
npm run build      # 输出到 docs/（GitHub Pages）
```

## 项目技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 |
| 构建 | Vite 6 |
| UI | MUI 6 (Material UI) |
| 状态管理 | Zustand 5（含 persist 中间件，localStorage 持久化） |
| 数据源 | Atlas Academy API |

纯 JavaScript，无 TypeScript。UI 为中文。

## 项目架构

```
src/
├── components/     # 16 个 UI 组件
├── constants/      # 游戏常量（职阶克制、配卡、buff 定义）
├── data/           # 旧版从者数据库
├── hooks/          # useServant, useNpResult
├── pages/          # 三大页面：ServantListPage / CalculatorPage / CardDrawPage
├── services/       # Atlas API 客户端 + 数据转换层
├── store/          # Zustand 状态管理（5 个 slice，persist 持久化）
├── translations/   # 从者名翻译（JP→CN）
└── utils/          # 核心计算引擎（伤害/NP/暴击星公式 + 出卡概率 + 伤害分布）
```

### 数据流

```
Atlas Academy API → transform.js → Zustand Store → Custom Hooks → Calculation Engine → Components
                                                                         ↑
                                                               User Input (5 store slices)
```

### Store 结构

| Slice | 关键状态 | 持久化 |
|-------|---------|--------|
| `servantSlice` | `selectedId`, `servantData`, `isCustom`, `customServant` | ✅ |
| `configSlice` | `level`, `npLevel`, `fou`, `ceAtk`, `extraAtk` | ✅ |
| `buffsSlice` | 5 buff 来源 × 11 buff 类型 | ✅ |
| `enemySlice` | 敌方 `class`, `attr`, `def` | ✅ |
| `optionsSlice` | `overkill`, `isCrit` | ✅ |

### 从者数据

- API 数据通过 `transform.js` 转为**普通对象**（带命名键），存储在 `servantData`
- 访问方式：`getSv(servant, 'keyName')`（兼容数组和对象两种格式）
- `src/data/servantDb.js` 中有旧版紧凑数组数据（435+ 从者），已逐步迁移至 API 层
- 键名定义：`src/constants/servantKeys.js`

### 计算引擎

- `src/utils/calculations.js` — 核心 FGO 伤害公式：`calcNPDamage`, `calcCardDamage`, `calcNPGainForCard`, `calcStars`, `calcBreakProb`
- `src/utils/cardDraw.js` — 出卡概率引擎：15 张牌池枚举全部 C(15,5)=3003 种手牌
- `src/utils/damageDistribution.js` — 伤害分布引擎：每种手牌的 P(5,3)=60 种排列，最高/最低伤害，通关率

### 样式

- MUI 主题：`src/theme.js`（浅色主题，蓝灰强调色 `#3d5a80`）
- 全局 CSS：`src/global.css`（CSS 变量 + 组件 class）
- 避免内联样式，优先使用 CSS class 或 MUI `sx` prop

## 开发指南

### 添加新从者数据字段

1. 如果 `transform.js` 已输出该字段 → 直接在组件中使用 `getSv(servant, 'key')`
2. 如果 API 有但 `transform.js` 未提取 → 在 `transform.js` 中添加提取逻辑
3. 如果是新定义的字段 → 更新 `servantKeys.js` 和 `transform.js`

### 修改计算逻辑

所有 FGO 公式在 `src/utils/calculations.js` 中。修改前请参考权威数据源：
`FGO计算器Ver9.9_2025因陀罗的试炼.xlsx`

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/App.jsx` 添加路由
3. 在 `src/components/Layout.jsx` 的 `NAV_ITEMS` 添加导航项

### Buff 系统

5 个 buff 来源（礼装/自身/辅助/敌方/Debuff），每个来源支持 11 种 buff 类型。可动态增删来源（`addBuffSource`/`removeBuffSource`）。buff 上限在 `aggregateBuffs()` 中通过 `clamp()` 控制。

### 构建与部署

```bash
npm run build    # 输出到 docs/
npm run preview  # 预览生产构建
```

构建产物输出到 `docs/` 目录，通过 GitHub Pages 部署。
生产环境 base path 为 `/fgo-np-calculator/`。

## Commit 规范

无严格规范。建议使用清晰的中文或英文描述：

```
feat: 添加 NP 卡伤害分布支持
fix: 修复 buff 上限计算错误
style: 浅色主题重构，去除 AI-slop 模式
```

## Pull Request 流程

1. Fork 本仓库
2. 创建 feature 分支：`git checkout -b feature/xxx`
3. 提交改动：`git commit -m 'feat: xxx'`
4. 推送分支：`git push origin feature/xxx`
5. 提交 Pull Request

PR 提交前请确保：
- `npm run build` 通过
- 改动不影响现有功能
- 新功能有基本的合理性验证

## 问题反馈

- Bug 报告 → [GitHub Issues](https://github.com/1nsaneeee/fgo-np-calculator/issues)
- 功能建议 → [GitHub Discussions](https://github.com/1nsaneeee/fgo-np-calculator/discussions)
- 从者数据错误 → 请提供正确的数据来源

## 数据来源

从者数据从 [Atlas Academy API](https://api.atlasacademy.io/) 实时获取。翻译文件位于 `src/translations/`。

## License

MIT License © 2024
