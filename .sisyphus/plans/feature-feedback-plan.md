# 功能建议可行性分析与实施计划

> 基于用户收到的五条功能建议，对照项目现有代码库（v4.0）进行分析，输出可行性与分阶段实施方案。

## 当前状态速览

**已实现、建议者低估的功能：**

| 功能 | 实现位置 | 说明 |
|------|----------|------|
| Buff系统 (5源×15类) | `BuffTable.jsx` + `aggregateBuffs()` | 含上限检测、被动技能自动合并、6套预设 |
| 敌方职阶/阵营克制 | `EnemyPanel.jsx` + `gameData.js` | 15×15职阶矩阵 + 5×5阵营矩阵，自动应用 |
| 通关率(完整版) | `DamageDistPanel.jsx` + `damageDistribution.js` | 枚举3003手牌×60出牌序，精确到每张卡 |
| 伤害分布直方图 | `DamageHistogram.jsx` | Recharts CDF 图，含阈值线 |
| 击破率 | `CardChainPanel.jsx` → `calcBreakProb()` | 枚举200种随机数，精确概率 |
| 多牌型出卡概率 | `CardDrawPanel.jsx` + `cardDraw.js` | 含自定义查询语法 |

---

## 建议逐条分析

### 建议1: "通关率只有牌型职介atk，没有buff"

**判定: 一半准确。** Buff **确实参与了计算**（`DamageDistPanel.jsx:108` 的 `aggregateBuffs()`），但是三人**共用同一份 buff**，无法给每人配置不同的 buff。参见下方建议2补充。

| 指标 | 评估 |
|------|------|
| 可行性 | ✅ 计算层面已实现 |
| 缺陷 | 三人共享同一个 `agg` 对象 |
| 解决 | 见建议2（组队规划独立功能） |

---

### 建议2: "选取从者并给出练度，类似Laplace" + 补充："三个人独立BUFF"

**判定: 核心需求，拆为独立功能"组队规划"。**

当前 `DamageDistPanel` 的根本缺陷：
1. S1/S2 需手动填 ATK/牌型/职阶，无从者选取器
2. **三人共享同一份 buff**（行108 `aggregateBuffs(buffs, servant, options)` 只算一次），无法给打手和辅助配置不同 buff

**架构决策**: 不往现有单从者计算器里塞。新建独立页面 `TeamPlannerPage`，与 `CalculatorPage` 完全解耦：

```
现有架构:
  CalculatorPage (/)
    └── 单从者 + 一堆配置 + 一个BuffTable → 计算单人伤害

  CardDrawPage (/cards)
    └── DamageDistPanel (三人共用buff) + CardDrawPanel

新架构:
  CalculatorPage (/)  —— 不动
    └── 单从者 + BuffTable → NP伤害/指令卡链/3T模拟

  TeamPlannerPage (/team)  —— 新建
    ├── TeamServantPanel ×3  (每人独立: 从者选取+练度+Buff)
    ├── TeamEnemyPanel       (复用 EnemyPanel)
    ├── TeamResultPanel      (伤害分布+通关率+直方图)
    └── TeamCardQueryPanel   (牌型查询+伤害联动)
```

**为什么拆出来**:
- 单从者计算器定位是"我要算某个从者的宝具伤害"，一个 BuffTable 够用
- 组队规划是"我组了这三个人，实战发牌伤害分布如何"，每人需要独立的 buff 配置
- 耦合在一起会导致 BuffTable 逻辑爆炸、store 膨胀、用户困惑

| 指标 | 评估 |
|------|------|
| 可行性 | 高 |
| 工作量 | ~16h（新页面 + store + 计算引擎重构） |
| 风险 | `damageDistribution.js` 需重构 buff 从共享→每人独立 |

---

### 建议3: "组队模拟，模拟战斗中某一回合实时发牌伤害"

**判定: 与建议2合并。建议2实现后，这就是组队规划的直接结果。**

现有 `damageDistribution.js` 已是完备的计算引擎（3003手牌×60出牌序），建议2的组队规划页面搭建完成后，单回合发牌伤害分布就是该页面的直接输出。

多回合模拟（技能冷却/buff时效/NP累计）Phase 2 再做。

| 指标 | 评估 |
|------|------|
| 可行性 | 计算引擎已就绪 |
| 单回合 | 等于建议2的输出 |
| 多回合 | ~20h+，Phase 2 |

---

### 建议4: "敌方数据(职介与阵营补正)可以列出来自己填"

**判定: 已实现。**

`EnemyPanel.jsx` 已提供职阶/阵营/防御配置。`gameData.js` 的克制矩阵在 `calcNPDamage()` 中自动应用。

**改进方向**: 在 `NPDamageResult` 中增加克制明细行。

| 指标 | 评估 |
|------|------|
| 可行性 | ✅ 无需新功能 |
| 优化工作量 | ~0.5h |

---

### 建议5: "多牌型算牌"

**判定: 部分实现，可增强。**

已实现自定义查询语法（`A3A3A3`）返回概率，但不返回伤害。组队规划页面中可集成查询+伤害联动。

| 子项 | 描述 | 工作量 |
|------|------|--------|
| 5a. 预设查询模板 | 一键查询常用牌型 | ~3h |
| 5b. 查询+伤害联动 | 查询结果附带伤害范围 | ~4h |

---

## 推荐实施路线

```
Phase 1 — Quick Wins + 基础设施（总计 ~10h）
├── P1.1 克制明细展示 — NPDamageResult 加克制倍率明细行                     [0.5h]
├── P1.2 牌型查询模板 — CardDrawPanel 预设常用牌型一键查询                    [3h]
├── P1.3 damageDistribution.js 重构                                          [4h]
│   ├── agg (共享) → aggs[1..3] (每人独立) 
│   ├── calcCardDmgRaw / calcNPDmgRaw 接受 servantIndex 参数
│   └── calcAllPlayDamages / calcDamageDistribution 接口更新
├── P1.4 teamSlice.js — 新建 store slice                                    [1.5h]
│   └── { servants: [ {id,data,config,buffs}, ... ], enemy, options }
└── P1.5 验证 — LSP + build + 回归测试（确保现有页面不受影响）               [1h]

Phase 2 — 组队规划页面（总计 ~16h）
├── P2.1 TeamPlannerPage + /team 路由                                        [1h]
├── P2.2 TeamServantSelector — 3从者选取器                                   [4h]
│   ├── 复用 /servants 从者数据
│   ├── 每个 slot: 从者下拉框 + level/npLevel/fou/ceAtk
│   └── 选中自动填入 ATK/牌型/职阶/阵营/NP倍率/宝具色
├── P2.3 TeamBuffPanel — 每人独立的 Buff 面板                                [5h]
│   ├── Tab/Accordion 切换三个从者的 buff
│   ├── 复用现有 BuffTable 逻辑（每人独立 store 分片）
│   ├── "复制S3 buff到S1/S2" 快捷按钮
│   └── 每人 buff 摘要行（atkUp/busterUp/artsUp/quickUp 合计）
├── P2.4 TeamResultPanel — 伤害分布结果                                      [3h]
│   ├── 单回合伤害分布（复用 damageDistribution.js 重构后的接口）
│   ├── 通关率 + 统计（median/P25/P75）
│   ├── 最优/最劣出牌展示
│   └── DamageHistogram 直方图
├── P2.5 牌型查询+伤害联动 — 集成到组队页面                                   [3h]
│   ├── 自定义查询输入框 + 概率显示
│   └── 查询到的牌型显示预计伤害 [min~max]
└── P2.6 验证 — LSP + build + 计算精度交叉验证                               [1h]

Phase 3 — 高级功能（总计 ~30h+，需评审）
├── P3.1 多回合组队模拟                                                       [20h+]
│   ├── 技能冷却/持续回合状态机
│   ├── Buff 时效追踪
│   ├── NP 累计跨回合
│   └── 多波次敌方切换
├── P3.2 按伤害排序查询 (建议5c)                                              [8h]
└── P3.3 技能等级→Buff映射表 (Laplace 完整版)                                  [20h+]
```

---

## 关键技术设计

### Store 设计 (teamSlice.js)

```js
// src/store/teamSlice.js — 新建
{
  servants: [
    {
      id: 1,
      servantId: null,       // DB from servant list
      isCustom: false,
      customServant: null,
      config: { level, npLevel, fou, ceAtk, extraAtk },
      buffs: {              // 独立 buff，结构同 buffsSlice
        sources: [{ id, name, buffs: {...15种} }, ...],
        _nextId: 1
      }
    },
    { id: 2, ... },
    { id: 3, ... }
  ],
  enemy: { class, attr, def },   // 三人共享同一个敌方
  options: { isCrit, overkill }
}

// 操作方法:
updateServantConfig(slotIndex, key, value)
updateServantBuff(slotIndex, sourceId, buffKey, value)
addServantBuffSource(slotIndex, name)
removeServantBuffSource(slotIndex, sourceId)
setServantBuffs(slotIndex, buffs)
resetServant(slotIndex)
updateTeamEnemy(key, value)
```

### damageDistribution.js 重构

```js
// 旧接口
calcDamageDistribution(pool, servantStats, agg, enemy, options)
// agg 是共享对象 { atkUp, busterUp, ... }

// 新接口
calcDamageDistribution(pool, servantStats, aggs, enemy, options)
// aggs 是按 servantIndex 索引的对象 { 1: {...buffs}, 2: {...buffs}, 3: {...buffs} }

// 内部使用
function calcCardDmgRaw({ ..., servantIndex, aggs, ... }) {
  const buffs = aggs[servantIndex];  // 取该从者自己的 buff
  // ... 其余不变
}
```

### 路由

```js
// 新增路由
<Route path="/team" element={<TeamPlannerPage />} />

// 导航栏增加入口（Layout.jsx）
<Button component={Link} to="/team">组队规划</Button>
```

---

## 技术约束

- **语言**: 纯 JavaScript（非 TypeScript）
- **框架**: React 18 + MUI 6 + Zustand 5
- **路径别名**: `@` → `src/`
- **从者数据结构**: compact array，必须通过 `getSv(servant, key)` 访问
- **Buff 值**: 百分比直接存数字（50 = 50%），cap 已在 aggregateBuffs 中处理
- **计算引擎**: `src/utils/calculations.js` + `src/utils/damageDistribution.js` — 重构 buff 传参但不改公式
- **现有页面不变**: CalculatorPage、CardDrawPage 功能不受影响

## 验证标准

- 所有改动文件 LSP diagnostics 无新增 error
- `npm run build` 成功
- CalculatorPage 和 CardDrawPage 回归功能正常（原有 buff 共享逻辑保留）
- 组队规划页面：三人不同 buff 下伤害分布数据与手算一致
- 伤害计算结果与 Excel 原始数据（`FGO计算器Ver9.9`）交叉验证
