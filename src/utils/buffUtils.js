// src/utils/buffUtils.js
// Buff 配置公共工具 -- 消除 BuffTable / CalculatorPage / TeamBuffPanel 三处重复
// 包含：色卡暴击共享 500% 上限判定 + 可见行推导 + cap 判定

import { BUFF_DEFS, CORE_BUFF_KEYS } from '@/constants/buffDefs';

// 色卡暴击子项集合（B/A/Q 三色卡各自的暴击威力）
export const CRIT_CHILDREN = new Set(['busterCritDmg', 'artsCritDmg', 'quickCritDmg']);

// 色卡暴击系列全部 key（父级 critDmg + 3 子项），共享 500% 上限
export const CRIT_KEYS = ['critDmg', 'busterCritDmg', 'artsCritDmg', 'quickCritDmg'];

// 色卡暴击系列共享上限
export const CRIT_SHARED_CAP = 500;

/**
 * 推导可见的 Buff 定义列表
 * @param {boolean} showAll - true 返回全部 17 项，false 返回核心 11 项
 */
export function getVisibleBuffDefs(showAll = false) {
  return showAll
    ? BUFF_DEFS
    : BUFF_DEFS.filter((d) => CORE_BUFF_KEYS.has(d.key) || CRIT_CHILDREN.has(d.key));
}

/**
 * 判断一个 Buff key 是否属于色卡暴击系列（共享 500% 上限）
 */
export function isCritBuffKey(key) {
  return key === 'critDmg' || CRIT_CHILDREN.has(key);
}

/**
 * 计算色卡暴击系列的共享 500% 上限信息
 * 用于 aggregateBuffs() 结果（BuffTable + BuffSummaryGrid 共用）
 *
 * @param {Object} agg - aggregateBuffs() 的返回值
 * @returns {{
 *   critRaw: Object<string, number>,       // 每个 key 的原始输入值
 *   critDisplay: Object<string, number>,    // 每个 key 按 500% 预算分配后的有效值
 *   critTotal: number,                      // 4 个 key 原始值总和
 *   critEffective: number,                  // min(critTotal, 500)
 *   critCapped: boolean                     // critTotal > 500
 * }}
 */
export function getCritCapInfo(agg) {
  const critRaw = {};
  const critDisplay = {};
  let critRemaining = CRIT_SHARED_CAP;
  for (const k of CRIT_KEYS) {
    const raw = Math.round(agg[k] || 0);
    critRaw[k] = raw;
    const effective = Math.min(raw, Math.max(0, critRemaining));
    critDisplay[k] = effective;
    critRemaining -= effective;
  }
  const critTotal = CRIT_KEYS.reduce((s, k) => s + critRaw[k], 0);
  const critEffective = Math.min(critTotal, CRIT_SHARED_CAP);
  const critCapped = critTotal > CRIT_SHARED_CAP;
  return { critRaw, critDisplay, critTotal, critEffective, critCapped };
}

/**
 * 简化版色卡暴击 cap 判定 -- 用于不经过 aggregateBuffs 的场景（如 TeamBuffPanel 的 getTotal）
 * @param {(key: string) => number} getValue - 按 key 取当前合计值的函数
 * @returns {boolean} - 4 个 key 合计是否超过 500
 */
export function checkCritCapped(getValue) {
  const critTotal = CRIT_KEYS.reduce((s, k) => s + Math.round(getValue(k) || 0), 0);
  return critTotal > CRIT_SHARED_CAP;
}

/**
 * 判断指定 Buff 定义是否超过上限
 * @param {Object} def - BUFF_DEFS 中的定义项
 * @param {(key: string) => number} getValue - 按 key 取当前合计值的函数
 * @param {boolean} critCapped - 来自 getCritCapInfo() 或 checkCritCapped() 的结果
 * @returns {boolean}
 */
export function isBuffCapped(def, getValue, critCapped) {
  if (def.key === 'flatDmg') return false;
  if (isCritBuffKey(def.key)) return critCapped;
  return Math.round(getValue(def.key) || 0) >= def.cap;
}
