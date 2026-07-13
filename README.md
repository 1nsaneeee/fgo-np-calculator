<p align="center">
  <img src="https://img.shields.io/badge/version-4.1-blue" alt="Version 4.1" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" />
  <img src="https://img.shields.io/badge/data-Atlas%20Academy-orange" alt="Data: Atlas Academy" />
  <img src="https://img.shields.io/badge/servants-458%2B-purple" alt="458+ Servants" />
  <img src="https://img.shields.io/badge/deploy-GitHub%20Pages-brightgreen" alt="GitHub Pages" />
</p>

# FGO NP Damage Calculator // 宝具伤害计算器

> 一个现代化的 Fate/Grand Order 宝具伤害、指令卡连携、NP 回收与暴击星生成计算器——数据直接对接 Atlas Academy API，覆盖 458+ 从者。

<p align="center">
  <i>实时计算 · 完整 Buff 面板 · 三回合连发 · 自定义从者 · 移动端适配</i>
</p>

---

## 快速上手

```bash
# 克隆仓库
git clone https://github.com/1nsaneeee/fgo-np-calculator.git
cd fgo-np-calculator

# 安装依赖
npm install

# 启动开发服务器 (http://localhost:5173)
npm run dev

# 构建生产版本
npm run build
```

在线体验：**[1nsaneeee.github.io/fgo-np-calculator](https://1nsaneeee.github.io/fgo-np-calculator/)**

---

## 核心功能

- **宝具伤害计算** — 支持 NP1~NP5、等级 1~120、芙芙/礼装 ATK、阵营克制与职阶克制，输出最小/平均/最大伤害
- **完整 Buff 面板** — 五类 Buff 来源（礼装/自身/辅助/敌方/Debuff），覆盖 11 种 Buff 类型：攻击力、魔放（红/蓝/绿）、宝具威力、特攻、暴击威力、NP 率、暴击星掉落等
- **指令卡链模拟** — 拖拽或点击配置 3 色卡牌序列，实时计算总伤害、每张卡的 NP 回收量与暴击星数，支持首位染色与卡位加成
- **三回合连发模拟** — 预测连续三回合的宝具 NP 回收，判断是否能实现宝具连发
- **自定义从者** — 完全自由配置职阶、配卡、Hit 数、NP 率、宝具倍率、被动技能等参数，不受内置数据库限制
- **从者浏览器** — 458+ 从者数据库，支持职阶筛选（15 种职阶含 Beast）、关键词搜索、稀有度星级显示
- **移动端响应式** — 两栏自适应布局，桌面端左侧输入右侧结果，移动端自动切换为上下排列

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 |
| 构建 | Vite 6 |
| UI | MUI 6 (Material UI) |
| 状态管理 | Zustand 5 |
| 路由 | React Router 6 (HashRouter) |
| 数据源 | Atlas Academy API |

---

## 项目结构

```
src/
├── components/     # 12 个 UI 组件（BuffTable, CardChainPanel, ServantCard 等）
├── constants/      # 游戏常量（职阶克制矩阵、阵营表、色卡倍率）
├── data/           # 旧版从者数据库（逐步迁移至 transform 层）
├── hooks/          # 自定义 Hooks（useServant, useNpResult）
├── pages/          # 三大页面：ServantListPage, CalculatorPage, CardDrawPage
├── services/       # Atlas API 客户端 + 数据转换层
├── store/          # Zustand 状态管理（5 个 Slice）
├── translations/   # 从者名翻译（JP→CN / ID→CN）
└── utils/          # 核心计算引擎（伤害/NP/暴击星公式）
```

---

## 从者翻译

本项目内置了 **458 名从者的完整中文译名**，通过 Atlas Academy API 的 ID + 日文原名双重映射确保翻译准确性。翻译文件位于：

- `src/translations/servant-names.json` — JP → CN 映射（385 个唯一日文名）
- `src/translations/servant-names-by-id.json` — ID → CN 映射（458 条记录，主要查找表）

69 个同名不同职阶的从者（如阿尔托莉雅·潘德拉贡的 4 个职阶版本）通过 ID 级映射正确处理。

---

## 数据来源

从者数据实时获取自 [Atlas Academy API](https://api.atlasacademy.io/)，每 30 天自动刷新一次数据缓存。

---

## License

MIT License © 2024

---

---

## Changelog

完整的版本更新记录见 [CHANGELOG.md](./CHANGELOG.md)。

v4.1 主要变更：Design System v2 全面重构 — 暖灰黑配色体系、FGO 三色卡作为产品主色、微圆角替代零圆角、单语中文、Buff 折叠总览、Skeleton 加载、Toast 反馈、/settings 页面。

---

## Contributors

<p align="center">
  <a href="https://www.anthropic.com"><img src="https://img.shields.io/badge/🤖-Claude_Opus_4.7-8A2BE2" alt="Claude Opus 4.7" /></a>
  <a href="https://openai.com"><img src="https://img.shields.io/badge/🤖-ChatGPT_o3-74aa9c" alt="ChatGPT o3" /></a>
  <a href="https://deepmind.google"><img src="https://img.shields.io/badge/🤖-Gemini_3.0-4285F4" alt="Gemini 3.0" /></a>
  <a href="https://x.ai"><img src="https://img.shields.io/badge/🤖-Grok_4-000000" alt="Grok 4" /></a>
  <a href="https://deepseek.com"><img src="https://img.shields.io/badge/🤖-DeepSeek_v4-4D6BFE" alt="DeepSeek v4" /></a>
  <a href="https://github.com/features/copilot"><img src="https://img.shields.io/badge/🤖-GitHub_Copilot-24292e" alt="GitHub Copilot" /></a>
  <br/>
  <sub>本项目的每一位 AI 都做出了不可磨灭的划水贡献 🫡</sub>
</p>

---

<p align="center">
  <a href="https://github.com/1nsaneeee/fgo-np-calculator/issues">问题反馈</a> ·
  <a href="https://github.com/1nsaneeee/fgo-np-calculator/discussions">讨论区</a> ·
  <a href="https://1nsaneeee.github.io/fgo-np-calculator/">在线体验</a>
</p>
