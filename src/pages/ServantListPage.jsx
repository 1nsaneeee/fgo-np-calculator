// src/pages/ServantListPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, MenuItem, Select, FormControl, InputLabel, Pagination, Typography, CircularProgress, Alert } from '@mui/material';
import useStore from '@/store/index';
import { fetchServantList, fetchNiceServant } from '@/services/atlasApi';
import { transformNiceToCalc } from '@/services/transform';
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
      results = results.filter(s =>
        classFilter.includes(
          (s.className || '').charAt(0).toUpperCase() + (s.className || '').slice(1)
        )
      );
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

  if (loading && servantList.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && servantList.length === 0) {
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
            <Select value={sortBy} label="排序" onChange={(e) => setSortBy(e.target.value)}>
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
            <ServantCard key={basic.id} basic={basic} onClick={() => handleSelect(basic)} />
          ))}
        </Box>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} size="small" />
          </Box>
        )}
      </Box>
    </Box>
  );
}
