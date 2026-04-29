import { useMemo, useState } from 'react'
import useStore from '@/store/index'
import { BUFF_DEFS, CORE_BUFF_KEYS } from '@/constants/buffDefs'
import { useServant } from '@/hooks/useServant'
import { aggregateBuffs } from '@/utils/calculations'

const CRIT_CHILDREN = new Set(['busterCritDmg', 'artsCritDmg', 'quickCritDmg']);

export default function BuffTable() {
  const [showAll, setShowAll] = useState(false)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [critExpanded, setCritExpanded] = useState(false)

  const servant = useServant()
  const buffs = useStore(s => s.buffs)
  const options = useStore(s => s.options)
  const addBuffSource = useStore(s => s.addBuffSource)
  const removeBuffSource = useStore(s => s.removeBuffSource)
  const renameBuffSource = useStore(s => s.renameBuffSource)
  const updateBuffValue = useStore(s => s.updateBuffValue)

  const sources = buffs.sources || []

  const agg = useMemo(
    () => aggregateBuffs(buffs, servant, options),
    [buffs, servant, options]
  )

  // Crit children always included when critDmg is visible, but toggle controls display
  const visibleDefs = showAll
    ? BUFF_DEFS
    : BUFF_DEFS.filter(d => CORE_BUFF_KEYS.has(d.key) || CRIT_CHILDREN.has(d.key))

  const handleAddSource = () => {
    if (newName.trim()) {
      addBuffSource(newName.trim())
      setNewName('')
      setAdding(false)
    }
  }

  // Pre-compute shared crit cap: distribute 500% budget in definition order
  const CRIT_KEYS = ['critDmg', 'busterCritDmg', 'artsCritDmg', 'quickCritDmg']
  const critRaw = {}
  const critDisplay = {}
  let critRemaining = 500
  for (const k of CRIT_KEYS) {
    const raw = Math.round(agg[k] || 0)
    critRaw[k] = raw
    const effective = Math.min(raw, Math.max(0, critRemaining))
    critDisplay[k] = effective
    critRemaining -= effective
  }
  const critTotal = CRIT_KEYS.reduce((s, k) => s + critRaw[k], 0)
  const critEffective = Math.min(critTotal, 500)
  const critCapped = critTotal > 500

  return (
    <div style={{ overflowX: 'auto' }}>
      <h2 className="panel-title">Buff配置</h2>
      <table className="buff-table">
        <thead>
          <tr>
            <th className="buff-label-col">Buff</th>
            {sources.map(src => (
              <th key={src.id}>
                <div className="source-header">
                  <input
                    className="source-name-input"
                    value={src.name}
                    onChange={e => renameBuffSource(src.id, e.target.value)}
                    aria-label={`来源名称: ${src.name}`}
                  />
                  {sources.length > 1 && (
                    <button
                      className="source-remove-btn"
                      onClick={() => removeBuffSource(src.id)}
                      title="删除此来源"
                      aria-label={`删除来源: ${src.name}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              </th>
            ))}
            <th className="total-col">Total</th>
          </tr>
        </thead>
        <tbody>
          {visibleDefs.map(def => {
            // Hide crit children when collapsed
            if (CRIT_CHILDREN.has(def.key) && !critExpanded) return null

            const totalCapped = agg[def.key] !== undefined ? Math.round(agg[def.key]) : 0
            const isFlat = def.key === 'flatDmg'

            // Shared cap logic for crit group
            const isCritParent = def.key === 'critDmg'
            const isCritChild = CRIT_CHILDREN.has(def.key)
            const isCritRow = isCritParent || isCritChild
            let isCapped
            if (isCritRow) {
              isCapped = critCapped
            } else {
              isCapped = totalCapped >= def.cap
            }

            // For crit rows, show the effective share of the 500% pool
            const displayValue = isCritRow
              ? (isCritParent && !critExpanded ? critEffective : critDisplay[def.key])
              : totalCapped

            return (
              <tr key={def.key} className={
                (def.groupEnd ? 'group-end' : '') +
                (isCritChild ? ' crit-child-row' : '')
              }>
                <td className={`buff-label buff-c-${def.color || ''}`} title={`cap: ${def.cap}`}>
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
                      value={src.buffs?.[def.key] || 0}
                      onChange={e => updateBuffValue(src.id, def.key, parseFloat(e.target.value) || 0)}
                      aria-label={`${def.label} - ${src.name}`}
                    />
                  </td>
                ))}
                <td className={'total-cell' + (isCapped ? ' capped' : '')}>
                  {isFlat ? displayValue.toLocaleString() : displayValue + '%'}
                  {isCapped && <span className="cap-badge">CAP</span>}
                  {isCritParent && !critExpanded && critCapped && (
                    <div className="crit-summary">
                      <span className="crit-overflow">输入{critTotal}%</span>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
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
            + 添加来源 Add Source
          </button>
        )}
        <button className="toggle-btn" onClick={() => setShowAll(prev => !prev)}>
          {showAll
            ? '▲ 收起 Collapse'
            : `▼ 展开全部 Show All (${BUFF_DEFS.length})`}
        </button>
      </div>
    </div>
  )
}
