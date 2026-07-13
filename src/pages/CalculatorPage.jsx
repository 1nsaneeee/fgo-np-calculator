// src/pages/CalculatorPage.jsx
// 单从者工作区 — 左右分栏：左配置 / 右结果
// 结果区永久同屏，砍掉旧 4-tab 切换；卡片链/分布改为折叠 sub-tab
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Dialog, DialogTitle, DialogContent, ToggleButton, ToggleButtonGroup } from '@mui/material';
import useStore from '@/store/index';
import { useServant } from '@/hooks/useServant';
import { useNpResult } from '@/hooks/useNpResult';
import { useHotkeys } from '@/hooks/useHotkeys';
import ServantStats from '@/components/ServantStats';
import LevelConfig from '@/components/LevelConfig';
import EnemyPanel from '@/components/EnemyPanel';
import OptionsPanel from '@/components/OptionsPanel';
import BuffTable from '@/components/BuffTable';
import NPDamageResult from '@/components/NPDamageResult';
import CardChainPanel from '@/components/CardChainPanel';
import ThreeTResult from '@/components/ThreeTResult';
import PresetButtons from '@/components/PresetButtons';
import CustomServantForm from '@/components/CustomServantForm';
import SingleDamageDist from '@/components/SingleDamageDist';
import EmptyState from '@/components/EmptyState';
import { aggregateBuffs } from '@/utils/calculations';
import { getVisibleBuffDefs, getCritCapInfo, isCritBuffKey } from '@/utils/buffUtils';
import { useToast } from '@/store/toastStore';

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
  const toast = useToast();

  const servant = useServant();
  const npResult = useNpResult();

  const buffs = useStore((s) => s.buffs);
  const options = useStore((s) => s.options);

  // 与 BuffTable 同源的 agg，保证折叠概览显示的「合计」与展开后全表一致
  const buffAgg = useMemo(
    () => aggregateBuffs(buffs, servant, options),
    [buffs, servant, options]
  );

  const [customOpen, setCustomOpen] = useState(false);
  const [buffExpanded, setBuffExpanded] = useState(false);
  const [chainOpen, setChainOpen] = useState(false);
  const [distOpen, setDistOpen] = useState(false);
  const [threeTurnOpen, setThreeTurnOpen] = useState(false);

  const handleReset = () => {
    resetServant();
    resetConfig();
    resetBuffs();
    resetEnemy();
    resetOptions();
    toast.show('已重置所有配置');
  };

  useHotkeys({
    r: handleReset,
  });

  // 空状态：未选从者
  if (!selectedId && !isCustom) {
    return (
      <Box>
        <h1 className="visually-hidden">单从者</h1>
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L4.5 14H11l-1 8 8.5-12H12l1-8z" />
            </svg>
          }
          title="还没有选中从者"
          description="从从者列表里选一位开始计算"
          cta={<Button variant="contained" onClick={() => navigate('/servants')}>选择从者</Button>}
        />
      </Box>
    );
  }

  return (
    <Box>
      <h1 className="visually-hidden">单从者</h1>

      {/* 顶部操作行：自定义开关 + 重置 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={isCustom ? 'custom' : 'db'}
          onChange={(_, v) => {
            if (v === 'custom') {
              setCustomMode(true);
              setCustomOpen(true);
            } else if (v === 'db') {
              setCustomMode(false);
            }
          }}
        >
          <ToggleButton value="db">数据库</ToggleButton>
          <ToggleButton value="custom">自定义</ToggleButton>
        </ToggleButtonGroup>
        <Button variant="outlined" color="error" size="small" onClick={handleReset} title="快捷键: R" sx={{ fontSize: 'var(--text-xs)' }}>
          重置
        </Button>
      </Box>

      {/* 自定义从者 dialog */}
      <Dialog open={customOpen && isCustom} onClose={() => setCustomOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>自定义从者</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <CustomServantForm />
        </DialogContent>
      </Dialog>

      {/* 主布局：左右分栏 */}
      <div className="calc-split">
        {/* 左：配置区 40% */}
        <div className="calc-config">
          {/* 从者 stats（仅 DB 模式显示） */}
          {servant && !isCustom && (
            <Box sx={{ mb: 3 }}>
              <ServantStats servant={servant} />
            </Box>
          )}

          {/* 等级 + 敌方 + 选项 */}
          <div className="section-card">
            <h3 className="panel-title">等级配置</h3>
            <LevelConfig />
          </div>

          <div className="section-card">
            <h3 className="panel-title">敌方 &amp; 选项</h3>
            <EnemyPanel />
            <div style={{ marginTop: 'var(--space-3)' }}>
              <OptionsPanel />
            </div>
          </div>

          {/* 预设 */}
          <Box sx={{ mt: 2 }}>
            <PresetButtons />
          </Box>

          {/* Buff 区 — 默认折叠为总览，点开显示 5×11 全表 */}
          <div className="section-card" style={{ marginTop: 'var(--space-4)' }}>
            <button
              className="collapsible-header"
              onClick={() => setBuffExpanded(!buffExpanded)}
              aria-expanded={buffExpanded}
            >
              <span className="collapsible-chevron">
                {buffExpanded ? '▾' : '▸'}
              </span>
              <span className="panel-title" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
                Buff 配置
              </span>
              <span className="collapsible-hint">
                {buffExpanded ? '收起' : '展开 5×11 详情'}
              </span>
            </button>
            <div style={{ display: buffExpanded ? 'block' : 'none' }}>
              <BuffTable />
            </div>
            {!buffExpanded && (
              <BuffSummaryGrid agg={buffAgg} />
            )}
          </div>
        </div>

        {/* 右：结果区 60% — sticky，永久同屏 */}
        <div className="calc-result">
          {/* 主结果 */}
          <NPDamageResult
            result={npResult}
            servant={servant}
            onViewDistribution={() => setDistOpen(true)}
          />

          {/* 次要视角：折叠 sub-tab */}
          <div className="calc-sub-sections">
            {/* 3 回合连发 */}
            <div className="section-card collapsible-card">
              <button
                className="collapsible-header"
                onClick={() => setThreeTurnOpen(!threeTurnOpen)}
                aria-expanded={threeTurnOpen}
              >
                <span className="collapsible-chevron">
                  {threeTurnOpen ? '▾' : '▸'}
                </span>
                <span className="collapsible-title">3 回合连发</span>
              </button>
              {threeTurnOpen && (
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <ThreeTResult />
                </div>
              )}
            </div>

            {/* 卡片链 */}
            <div className="section-card collapsible-card">
              <button
                className="collapsible-header"
                onClick={() => setChainOpen(!chainOpen)}
                aria-expanded={chainOpen}
              >
                <span className="collapsible-chevron">
                  {chainOpen ? '▾' : '▸'}
                </span>
                <span className="collapsible-title">指令卡链</span>
              </button>
              {chainOpen && (
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <CardChainPanel />
                </div>
              )}
            </div>

            {/* 伤害分布 */}
            <div className="section-card collapsible-card">
              <button
                className="collapsible-header"
                onClick={() => setDistOpen(!distOpen)}
                aria-expanded={distOpen}
              >
                <span className="collapsible-chevron">
                  {distOpen ? '▾' : '▸'}
                </span>
                <span className="collapsible-title">伤害分布</span>
              </button>
              {distOpen && (
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <SingleDamageDist />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
}

/**
 * Buff 概览网格 — 折叠态显示 11 项核心 Buff 的当前总值
 * 与 BuffTable 内部 showAll=false 时的 visibleDefs 行别一致
 * 与 BuffTable 内部展示「合计」列共享同一 aggregateBuffs 来源——口径不会漂移
 */
function BuffSummaryGrid({ agg }) {
  const visibleDefs = getVisibleBuffDefs(false);

  const { critRaw, critCapped } = getCritCapInfo(agg);

  const isCapped = (def) => {
    if (isCritBuffKey(def.key)) return critCapped;
    const total = Math.round(agg[def.key] || 0);
    return total >= def.cap;
  };

  return (
    <div className="buff-summary-grid">
      {visibleDefs.map((def) => {
        const isCritRow = isCritBuffKey(def.key);
        const displayValue = isCritRow
          ? critRaw[def.key]
          : Math.round(agg[def.key] || 0);
        const isFlat = def.key === 'flatDmg';
        const capped = isCapped(def);

        return (
          <div
            key={def.key}
            className={`buff-summary-item${capped ? ' capped' : ''}`}
            title={`上限: ${def.cap}${def.capUnit}`}
          >
            <span className="buff-summary-label">{def.label}</span>
            <span className="buff-summary-value">
              {isFlat ? displayValue.toLocaleString() : `${displayValue}%`}
              {capped && <span className="cap-badge">CAP</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}
