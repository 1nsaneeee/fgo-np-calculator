// src/pages/TeamPlannerPage.jsx
// 队伍工作区 — 3 slot 横向 + 队伍 Buff 折叠 + sub-tab 容器
// 合并了原 /cards（出卡概率）和 /turnsim（3 回合模拟）独立页面
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Box, Tabs, Tab, Button, CircularProgress } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import useStore from '@/store/index';
import TeamServantSelector from '@/components/TeamServantSelector';
import TeamBuffPanel from '@/components/TeamBuffPanel';
import TeamResultPanel from '@/components/TeamResultPanel';
import TeamCardQueryPanel from '@/components/TeamCardQueryPanel';
import EmptyState from '@/components/EmptyState';

// P2-7: sub-tab 专属组件 lazy load，未点开不下载
const CardDrawPanel = lazy(() => import('@/components/CardDrawPanel'));
const TurnSimulator = lazy(() => import('@/components/TurnSimulator'));

const LazyFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
    <CircularProgress size={32} />
  </Box>
);

const TABS = [
  { key: 'kill', label: '击杀查寻' },
  { key: 'draw', label: '出卡概率' },
  { key: 'sim', label: '3 回合模拟' },
];

export default function TeamPlannerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const team = useStore((s) => s.team);
  const hasTeam = team.servants.some((s) => s.servantId || s.isCustom);
  const slotsRef = useRef(null);

  // sub-tab 由 URL ?tab= 控制（支持旧路径重定向 /cards→?tab=draw /turnsim→?tab=sim）
  const tabParam = searchParams.get('tab');
  const validTab = TABS.find((t) => t.key === tabParam) ? tabParam : 'kill';
  const [tab, setTab] = useState(validTab);

  useEffect(() => {
    if (tabParam && TABS.find((t) => t.key === tabParam)) {
      setTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (_, v) => {
    setTab(v);
    setSearchParams({ tab: v }, { replace: true });
  };

  return (
    <Box>
      <h1 className="visually-hidden">队伍</h1>

      {/* 3 从者 slot 横向 */}
      <div className="section-card" ref={slotsRef}>
        <h2 className="panel-title">队伍配置</h2>
        <div className="team-slots-grid">
          {[0, 1, 2].map((i) => (
            <TeamServantSelector key={i} slotIndex={i} />
          ))}
        </div>
      </div>

      {/* 队伍 Buff */}
      <Box sx={{ mt: 2 }}>
        <TeamBuffPanel />
      </Box>

      {/* sub-tab 区 — 击杀查寻 / 出卡概率 / 3 回合模拟 */}
      <Box sx={{ mt: 3 }}>
        <Tabs value={tab} onChange={handleTabChange}>
          {TABS.map((t) => (
            <Tab key={t.key} label={t.label} value={t.key} />
          ))}
        </Tabs>

        <Box sx={{ pt: 3 }}>
          {tab === 'kill' && (
            <>
              <TeamCardQueryPanel />
              <Box sx={{ mt: 2 }}>
                <TeamResultPanel />
              </Box>
            </>
          )}

          {tab === 'draw' && (
            <Suspense fallback={<LazyFallback />}>
              <div className="section-card">
                <CardDrawPanel />
              </div>
            </Suspense>
          )}

          {tab === 'sim' && (
            <>
              {!hasTeam && (
                <EmptyState
                  icon={
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  }
                  title="还没有配置队伍"
                  description="在上方选 3 位从者后即可模拟回合"
                  cta={
                    <Button
                      variant="contained"
                      onClick={() => slotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    >
                      去配置队伍
                    </Button>
                  }
                />
              )}
              {hasTeam && (
                <Suspense fallback={<LazyFallback />}>
                  <TurnSimulator />
                </Suspense>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
