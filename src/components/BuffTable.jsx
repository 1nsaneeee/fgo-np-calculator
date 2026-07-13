// src/components/BuffTable.jsx - 紧凑表格设计
import { useMemo, useState } from 'react'
import useStore from '@/store/index'
import { BUFF_DEFS } from '@/constants/buffDefs'
import { useServant } from '@/hooks/useServant'
import { aggregateBuffs } from '@/utils/calculations'
import { CRIT_CHILDREN, getVisibleBuffDefs, getCritCapInfo } from '@/utils/buffUtils'

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

  const visibleDefs = getVisibleBuffDefs(showAll)

  const handleAddSource = () => {
    if (newName.trim()) {
      addBuffSource(newName.trim())
      setNewName('')
      setAdding(false)
    }
  }

  const { critDisplay, critTotal, critEffective, critCapped } = getCritCapInfo(agg)

  return (
    <div className="section-card">
      <h2 className="panel-title">Buff 配置</h2>
      
      <div className="buff-table-container">
        <table className="buff-table">
          <thead>
            <tr>
              <th className="buff-label-col">类型</th>
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
                        className="btn btn-small btn-danger"
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
              <th className="total-col">合计</th>
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
                  <td className={`buff-label`} title={`上限: ${def.cap}`}>
                    {isCritParent && (
                      <button
                        className="btn btn-small"
                        onClick={() => setCritExpanded(!critExpanded)}
                        aria-expanded={critExpanded}
                        aria-label="展开/折叠色卡暴击"
                        style={{ marginRight: 'var(--space-1)', padding: '0 var(--space-1)' }}
                      >
                        {critExpanded ? '▼' : '▶'}
                      </button>
                    )}
                    {def.label}
                  </td>
                  {sources.map(src => (
                    <td key={src.id}>
                      <input
                        className="buff-input"
                        type="number"
                        value={src.buffs?.[def.key] || ''}
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
      </div>

      <div className="buff-actions">
        {adding ? (
          <div className="add-source-row">
            <input
              className="input-field"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSource()}
              placeholder="来源名称..."
              aria-label="新来源名称"
              autoFocus
              style={{ width: '120px' }}
            />
            <button className="btn btn-small" onClick={handleAddSource} aria-label="确认添加来源">
              确定
            </button>
            <button className="btn btn-small" onClick={() => { setAdding(false); setNewName(''); }} aria-label="取消添加来源">
              取消
            </button>
          </div>
        ) : (
          <button className="btn btn-small" onClick={() => setAdding(true)}>
            + 添加来源
          </button>
        )}
        <button className="btn btn-small" onClick={() => setShowAll(prev => !prev)}>
          {showAll
            ? '▲ 收起'
            : `▼ 展开全部 (${BUFF_DEFS.length})`}
        </button>
      </div>
    </div>
  )
}
