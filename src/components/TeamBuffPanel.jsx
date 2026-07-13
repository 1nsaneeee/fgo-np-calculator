import { useState } from 'react'
import { Tabs, Tab, Box } from '@mui/material'
import useStore from '@/store/index'
import { BUFF_DEFS } from '@/constants/buffDefs'
import { CRIT_CHILDREN, getVisibleBuffDefs, isCritBuffKey, checkCritCapped } from '@/utils/buffUtils'

export default function TeamBuffPanel() {
  const [activeTab, setActiveTab] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const [critExpanded, setCritExpanded] = useState(false)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  const team = useStore(s => s.team)
  const updateTeamBuffValue = useStore(s => s.updateTeamBuffValue)
  const addTeamBuffSource = useStore(s => s.addTeamBuffSource)
  const removeTeamBuffSource = useStore(s => s.removeTeamBuffSource)
  const renameTeamBuffSource = useStore(s => s.renameTeamBuffSource)
  const copyTeamBuffs = useStore(s => s.copyTeamBuffs)

  const slots = team?.servants || []
  const slotBuffs = slots[activeTab]?.buffs
  const sources = slotBuffs?.sources || []

  const visibleDefs = getVisibleBuffDefs(showAll)

  const handleAddSource = () => {
    if (newName.trim()) {
      addTeamBuffSource(activeTab, newName.trim())
      setNewName('')
      setAdding(false)
    }
  }

  // Raw sum of all source values for a buff key (no caps, no passives — result panel handles that)
  const getTotal = (key) => {
    return Math.round(sources.reduce((sum, src) => sum + (src.buffs?.[key] || 0), 0))
  }

  // Per-row CAP check
  const critCapped = checkCritCapped(getTotal)

  const isCapped = (def) => {
    if (def.key === 'flatDmg') return false
    if (isCritBuffKey(def.key)) return critCapped
    const total = getTotal(def.key)
    return total >= def.cap
  }

  return (
    <div className="section-card">
      <h2 className="panel-title">Buff 配置</h2>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ mb: 1.5, borderBottom: 1, borderColor: 'divider' }}
      >
        {[0, 1, 2].map((i) => {
          const sid = slots[i]?.servantId
          const label = sid
            ? `从者${i + 1} S${i + 1} ✓`
            : `从者${i + 1} S${i + 1}`
          return <Tab key={i} label={label} />
        })}
      </Tabs>

      {/* Copy convenience buttons */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <button className="add-source-btn" onClick={() => copyTeamBuffs(2, 0)}>
          复制 S3 → S1
        </button>
        <button className="add-source-btn" onClick={() => copyTeamBuffs(2, 1)}>
          复制 S3 → S2
        </button>
        <button className="add-source-btn" onClick={() => copyTeamBuffs(0, 2)}>
          复制 S1 → S3
        </button>
      </Box>

      <div style={{ overflowX: 'auto' }}>
        <table className="buff-table">
          <thead>
            <tr>
              <th className="buff-label-col">增益</th>
              {sources.map(src => (
                <th key={src.id}>
                  <div className="source-header">
                    <input
                      className="source-name-input"
                      value={src.name}
                      onChange={e => renameTeamBuffSource(activeTab, src.id, e.target.value)}
                      aria-label={`来源名称: ${src.name}`}
                    />
                    {sources.length > 1 && (
                      <button
                        className="source-remove-btn"
                        onClick={() => removeTeamBuffSource(activeTab, src.id)}
                        title="删除此来源"
                        aria-label={`删除来源: ${src.name}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="total-col">合计</th>
            </tr>
          </thead>
          <tbody>
            {visibleDefs.map(def => {
              // Hide crit children when collapsed
              if (CRIT_CHILDREN.has(def.key) && !critExpanded) return null

              const total = getTotal(def.key)
              const isFlat = def.key === 'flatDmg'
              const isCritParent = def.key === 'critDmg'
              const isCritChild = CRIT_CHILDREN.has(def.key)

              const showCap = isCapped(def)

              return (
                <tr key={def.key} className={
                  (def.groupEnd ? 'group-end' : '') +
                  (isCritChild ? ' crit-child-row' : '')
                }>
                  <td className={`buff-label buff-c-${def.color || ''}`} title={`上限: ${isFlat ? def.cap.toLocaleString() : def.cap + '%'}`}>
                    {isCritParent && (
                      <button
                        className="crit-toggle"
                        onClick={() => setCritExpanded(!critExpanded)}
                        aria-expanded={critExpanded}
                        aria-label="展开/折叠色卡暴击"
                      >
                        {critExpanded ? '▼' : '▶'}
                      </button>
                    )}
                    {def.label}
                    {def.note && !isCritParent && <span className="buff-note">{def.note}</span>}
                  </td>
                  {sources.map(src => (
                    <td key={src.id}>
                      <input
                        className="buff-input"
                        type="number"
                        value={src.buffs?.[def.key] || ''}
                        onChange={e => updateTeamBuffValue(activeTab, src.id, def.key, parseFloat(e.target.value) || 0)}
                        aria-label={`${def.label} - ${src.name}`}
                      />
                    </td>
                  ))}
                  <td className={'total-cell' + (showCap ? ' capped' : '')}>
                    {isFlat ? total.toLocaleString() : total + '%'}
                    {showCap && <span className="cap-badge">CAP</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="buff-actions">
        {adding ? (
          <div className="add-source-row">
            <input
              className="source-name-input"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSource()}
              placeholder="来源名称..."
              aria-label="新来源名称"
              autoFocus
            />
            <button className="add-source-confirm" onClick={handleAddSource} aria-label="确认添加来源">确定</button>
            <button className="add-source-cancel" onClick={() => { setAdding(false); setNewName(''); }} aria-label="取消添加来源">取消</button>
          </div>
        ) : (
          <button className="add-source-btn" onClick={() => setAdding(true)}>
            + 添加来源
          </button>
        )}
        <button className="toggle-btn" onClick={() => setShowAll(prev => !prev)}>
{showAll
    ? '▲ 收起'
    : `▼ 展开全部 (${BUFF_DEFS.length})`}
        </button>
      </div>
    </div>
  )
}
