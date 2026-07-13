# Changelog

## v4.1.0 — Design System v2 全面重构 (2026-07)

### 概述

从 0→1 重新建立完整的设计语言，覆盖 UI 设计系统、信息架构、交互三层面。**不是美化，是重构。**

### P0 — 渲染崩溃与原则违反修复

#### ServantStats 组件渲染崩溃
- 14 个未定义 CSS token（`--blue`/`--buster-bg`/`--gold` 等）全部替换为 v2 原生 token
- 新增 4 个色卡派生背景 token：`--buster-bg` / `--arts-bg` / `--quick-bg` / `--card-extra-bg`
- 补齐 `.servant-card` / `.servant-class` / `.servant-name` 三个缺失的布局 class

#### ServantCard 徽章定位恢复
- `.sv-card-class-badge` + `.sv-card-np-badge` 两个未定义 class 补齐
- 职阶徽章定位到卡片左下角，NP 色卡徽章定位到右上角

#### Buff 折叠态总览
- 折叠态从一句空提示文字 → 11 项核心 Buff 当日总值网格（含 CAP 徽章）
- 与 BuffTable 展开后「合计」列共享同一 `aggregateBuffs` 来源，口径无漂移
- 折叠→展开 11 行 → showAll 17 行三段渐进披露

#### 单语中文原则合规
- 全站 20+ 处双语并列标签全部清除（`MIN/AVG/MAX` → `最小/平均/最大`，`职阶 Class` → `职阶` 等）
- 数据驱动来源（`buffDefs.js` 的 `SOURCE_KEY_NAMES`）同步单语化

#### 伤害分布 & 指令卡链样式恢复
- SingleDamageDist / DamageHistogram / CardChainPanel 3 文件 16 个未定义 token + 25 个未定义 class 全部补齐
- `.chain-result` 补 `display: grid` 4 列布局
- 6 个团队组件同源 token 批清（CardDrawPanel / TeamCardQueryPanel / TeamKillFinder / TeamResultPanel / TeamServantSelector / TurnSimulator）

### P1 — Design System 治理

#### Token 回扫（B-1 ~ B-5）
- 全站 0 个未定义 token + 0 个兼容映射引用
- `:root` 兼容映射块（16 个旧 token 名）全部删除
- 死 CSS 清理：59 个无效 class + 12 个孤儿子选择器删除，CSS -20%
- 61 处 magic number 替换为 v2 token 引用

#### buffUtils 抽取
- `CRIT_CHILDREN` / `CRIT_KEYS` 常量 + 色卡暴击 500% 共享上限逻辑从 3 处重复 → 1 处单一来源
- `getVisibleBuffDefs` / `isCritBuffKey` / `getCritCapInfo` / `checkCritCapped` 公共 API

#### `.input-mono` 重命名
- `.input-mono` → `.input-field`（CSS 渲染 sans 字体，名实不符修复）

#### EmptyState 统一组件
- 新建 `<EmptyState>` 公共组件（icon / title / description / cta）
- `/calc` 未选从者 + `/team` sim 未配队伍 两处统一
- 队伍 sim 空态新增 CTA「去配置队伍」按钮，平滑滚动到 slot 区

#### DB/Custom toggle → MUI ToggleButtonGroup
- 手工拼接 borderRadius 的两 Button → MUI `ToggleButtonGroup` exclusive

#### 品牌色语义复位
- `--card-extra`(金) 仅用于 EX/Overkill 语义，中概率/中 NP 改用 `--color-warning`
- 数值强调一律 `--text-strong`，品牌色仅留给色卡语义

### P2 — 体验增强

#### Loading 状态统一
- ServantListPage：文字"加载中..." → Skeleton 网格（15 张匹配卡片布局的骨架）

#### Toast 反馈系统
- Zustand `toastStore` + MUI `Snackbar` + `<ToastContainer>`
- 重置（`R`）+ 主题切换即时确认反馈

#### Keyboard 快捷键提示
- 重置按钮 `title="快捷键: R"`

#### `/settings` 设置页面
- 主题切换、快捷键参考、关于信息
- 顶栏齿轮 icon 入口

#### 移动端触控目标修复
- 顶栏 nav 按钮触控高度 ≤700px: 26px → 34px，≤480px: 38px

#### BuffTable 输入体验
- 清空输入不再强制回填 "0"，允许空值（`|| 0` → `|| ''`）

#### TurnSimulator lazy 分包
- `React.lazy` 按需加载，未点"3 回合模拟" sub-tab 不下载（TeamPlannerPage chunk -25kB）

#### Print 样式清理
- 删除死 class 引用，`border-radius: 0` → `var(--radius-md)`

### 量化总结

| 维度 | 修复前 | 修复后 |
|---|---|---|
| 未定义 token（渲染崩溃） | ~80+ 处 | 0 |
| 死 CSS class | 59 个 | 0 |
| 重复逻辑 | 3 处 | 1 处 |
| 双语违反 | 20+ 处 | 0 |
| CSS 文件 | 46,340 bytes | ~37,000 bytes（-20%） |
| 新增公共组件 | 0 | EmptyState / ToastContainer / buffUtils |
| 新增公共页面 | 0 | /settings |
