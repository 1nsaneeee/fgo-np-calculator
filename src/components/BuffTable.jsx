import { useMemo, useState } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  TextField, Button, Select, MenuItem, Box
} from '@mui/material'
import useStore from '@/store/index'
import { BUFF_DEFS, SOURCE_KEYS, SOURCE_LABELS, CORE_BUFF_KEYS } from '@/constants/buffDefs'
import { useServant } from '@/hooks/useServant'
import { aggregateBuffs } from '@/utils/calculations'

export default function BuffTable() {
  const [showAll, setShowAll] = useState(false)
  const [visibleSources, setVisibleSources] = useState(['self'])

  const servant = useServant()
  const buffs = useStore(s => s.buffs)
  const options = useStore(s => s.options)
  const setBuffs = useStore(s => s.setBuffs)

  const agg = useMemo(
    () => aggregateBuffs(buffs, servant, options),
    [buffs, servant, options]
  )

  function updateBuffSource(source, key, val) {
    const next = cloneDeep(buffs)
    if (!next[source]) next[source] = {}
    next[source][key] = val
    setBuffs(next)
  }

  function removeSource(src) {
    setVisibleSources(prev => prev.filter(s => s !== src))
  }

  function addSource(src) {
    if (src) setVisibleSources(prev => [...prev, src])
  }

  const visibleDefs = showAll
    ? BUFF_DEFS
    : BUFF_DEFS.filter(d => CORE_BUFF_KEYS.has(d.key))

  const availableSources = SOURCE_KEYS.filter(s => !visibleSources.includes(s))

  return (
    <div className="section" style={{ overflowX: 'auto' }}>
      <h2 className="panel-title">Buff配置</h2>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell style={{ textAlign: 'right', minWidth: 100 }}>Buff</TableCell>
            {visibleSources.map(src => (
              <TableCell key={src}>
                {SOURCE_LABELS[src]}
                <button
                  style={{ marginLeft: 4, fontSize: '0.75em', cursor: 'pointer' }}
                  onClick={() => removeSource(src)}
                >
                  ×
                </button>
              </TableCell>
            ))}
            <TableCell>Total (cap)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleDefs.map(def => {
            const totalRaw = SOURCE_KEYS.reduce((sum, src) => {
              return sum + (buffs[src]?.[def.key] || 0)
            }, 0)
            const totalCapped = agg[def.key] !== undefined ? Math.round(agg[def.key]) : Math.round(totalRaw)
            const isFlat = def.key === 'flatDmg'
            const isCapped = totalCapped >= def.cap
            const displayValue = isFlat
              ? totalCapped.toLocaleString()
              : totalCapped + '%'

            return (
              <TableRow
                key={def.key}
                className={def.groupEnd ? 'group-end' : ''}
              >
                <TableCell
                  className="buff-label"
                  title={`cap: ${def.cap}`}
                >
                  {def.label}
                </TableCell>
                {visibleSources.map(src => (
                  <TableCell key={src}>
                    <TextField
                      type="number"
                      size="small"
                      value={buffs[src]?.[def.key] || 0}
                      onChange={e => updateBuffSource(src, def.key, parseFloat(e.target.value) || 0)}
                    />
                  </TableCell>
                ))}
                <TableCell className={'total-cell' + (isCapped ? ' capped' : '')}>
                  {displayValue}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <Box display="flex" gap={1} marginTop={1}>
        {availableSources.length > 0 && (
          <Select
            displayEmpty
            value=""
            onChange={e => addSource(e.target.value)}
            size="small"
          >
            <MenuItem value="" disabled>+ 添加来源</MenuItem>
            {availableSources.map(src => (
              <MenuItem key={src} value={src}>{SOURCE_LABELS[src]}</MenuItem>
            ))}
          </Select>
        )}
        <Button onClick={() => setShowAll(prev => !prev)}>
          {showAll
            ? '▲ 收起 Collapse'
            : `▼ 展开全部 Show All (${BUFF_DEFS.length} buffs)`}
        </Button>
      </Box>
    </div>
  )
}
