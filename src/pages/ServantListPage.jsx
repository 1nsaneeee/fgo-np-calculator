// src/pages/ServantListPage.jsx - 极简从者列表
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@mui/material';
import useStore from '@/store/index';
import { fetchServantList, fetchNiceServant } from '@/services/atlasApi';
import { transformNiceToCalc, CLASS_MAP } from '@/services/transform';
import ServantCard from '@/components/ServantCard';
import ServantFilterPanel from '@/components/ServantFilterPanel';
import npColors from '@/translations/npColors.json';
import servantNames from '@/translations/servant-names.json';

const PAGE_SIZE = 50;

export default function ServantListPage() {
  const navigate = useNavigate();
  const selectServant = useStore((s) => s.selectServant);
  const setServantData = useStore((s) => s.setServantData);
  const setServantList = useStore((s) => s.setServantList);
  const servantList = useStore((s) => s.servantList);
  const loading = useStore((s) => s.servantLoading);
  const setLoading = useStore((s) => s.setServantLoading);
  const error = useStore((s) => s.servantError);
  const setError = useStore((s) => s.setServantError);

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState([]);
  const [rarityFilter, setRarityFilter] = useState([1, 4, 5]);
  const [npColorFilter, setNpColorFilter] = useState([]);
  const [sortBy, setSortBy] = useState('collectionNo');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (servantList.length > 0) return;
    setLoading(true);
    fetchServantList()
      .then(list => { setServantList(list); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    let results = servantList;

    if (classFilter.length > 0) {
      results = results.filter(s => {
        const normalized = CLASS_MAP[s.className] || ((s.className || '').charAt(0).toUpperCase() + (s.className || '').slice(1));
        return classFilter.includes(normalized);
      });
    }

    if (rarityFilter.length < 3) {
      const allowed = new Set();
      for (const v of rarityFilter) {
        if (v === 1) { allowed.add(1); allowed.add(2); allowed.add(3); }
        else allowed.add(v);
      }
      results = results.filter(s => allowed.has(s.rarity));
    }

    if (npColorFilter.length > 0) {
      results = results.filter(s => npColorFilter.includes(npColors[s.id] || 'Buster'));
    }

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

  useEffect(() => { setPage(1); }, [search, classFilter, rarityFilter, npColorFilter]);

  const handleSelect = async (basic) => {
    selectServant(basic.id);
    setLoading(true);
    try {
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
    setRarityFilter([1, 4, 5]);
    setNpColorFilter([]);
    setSearch('');
    setSortBy('collectionNo');
  };

  // 加载状态 - Skeleton 网格，匹配 sv-card 布局
  if (loading && servantList.length === 0) {
    return (
      <div className="servant-list-page">
        <h1 className="visually-hidden">从者列表</h1>
        <div className="sv-grid">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="sv-card" style={{ cursor: 'default' }}>
              <Skeleton variant="rectangular" width="100%" sx={{ aspectRatio: '1', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-2)' }} />
              <Skeleton variant="text" width="80%" height={14} sx={{ borderRadius: 'var(--radius-sm)' }} />
              <Skeleton variant="text" width="60%" height={12} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 错误状态
  if (error && servantList.length === 0) {
    return (
      <div className="error">
        无法加载从者列表: {error}
      </div>
    );
  }

  return (
    <div className="servant-list-page">
      <h1 className="visually-hidden">从者列表</h1>
      
      <div className="servant-list-layout">
        {/* 过滤面板 */}
        <ServantFilterPanel
          classFilter={classFilter}
          setClassFilter={setClassFilter}
          rarityFilter={rarityFilter}
          setRarityFilter={setRarityFilter}
          npColorFilter={npColorFilter}
          setNpColorFilter={setNpColorFilter}
          onReset={handleReset}
        />

        {/* 主内容区 */}
        <div className="servant-list-content">
          {/* 搜索和排序 */}
          <div className="servant-list-toolbar">
            <input
              className="input-field"
              placeholder="搜索从者名称或编号..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: '200px' }}
            />
            <select
              className="input-field"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: '120px' }}
            >
              <option value="collectionNo">ID 顺序</option>
              <option value="rarity">稀有度</option>
              <option value="atkMax">ATK</option>
              <option value="hpMax">HP</option>
            </select>
          </div>

          {/* 从者数量 */}
          <div className="servant-count">
            共 {filtered.length} 位从者
          </div>

          {/* 从者网格 */}
          <div className="sv-grid">
            {pageItems.map((basic) => (
              <ServantCard key={basic.id} basic={basic} onClick={() => handleSelect(basic)} />
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                ←
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${page === pageNum ? 'active' : ''}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                className="pagination-btn"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
