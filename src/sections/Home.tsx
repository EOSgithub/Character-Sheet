import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore, exportCharacter } from '../state/store'
import { derive, fmt } from '../rules/derive'
import { pendingLevels } from '../rules/levelup'
import { getSpecies } from '../data/species'
import { getBackground } from '../data/backgrounds'
import { getDiscipline } from '../data/savant'
import type { Character } from '../types'

export default function Home() {
  const { characters, active, setActive, deleteCharacter, importCharacter, updateCharacter } = useStore()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    file.text().then((text) => {
      try {
        const c = JSON.parse(text) as Character
        if (!c.name || !c.baseAbilities || !c.level) throw new Error('not a character file')
        importCharacter(c)
      } catch {
        alert('This file is not a valid character export.')
      }
    })
    e.target.value = ''
  }

  return (
    <>
      <div className="page-head">
        <h1>Savant Codex</h1>
        <span className="sub">A character sheet for the Savant class · D&D 2024</span>
      </div>

      {active && <ActiveOverview />}

      <div className="card">
        <div className="row between">
          <h2 style={{ margin: 0 }}>Characters</h2>
          <div className="row">
            <button className="btn small" onClick={() => fileRef.current?.click()}>Import JSON</button>
            <Link to="/new" className="btn small primary">New character</Link>
          </div>
        </div>
        <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={onImportFile} />

        {characters.length === 0 ? (
          <div className="empty">
            <div className="display">No characters yet</div>
            <p>Create your first Savant to begin — the guided setup takes about two minutes.</p>
            <Link to="/new" className="btn primary">Create a character</Link>
          </div>
        ) : (
          <table className="ledger mt">
            <thead>
              <tr>
                <th>Name</th><th>Level</th><th>Species</th><th>Discipline</th><th></th>
              </tr>
            </thead>
            <tbody>
              {characters.map((c) => {
                const isActive = active?.id === c.id
                const disc = getDiscipline(derive(c).disciplineKey)
                return (
                  <tr key={c.id}>
                    <td>
                      <button
                        style={{ fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--prussian)' : undefined, minHeight: 36 }}
                        onClick={() => setActive(c.id)}
                      >
                        {c.name} {isActive && <span className="chip on" style={{ fontSize: 11, padding: '1px 8px', marginLeft: 6 }}>active</span>}
                      </button>
                    </td>
                    <td className="num">{c.level}</td>
                    <td>{getSpecies(c.speciesKey)?.name ?? '—'}</td>
                    <td>{disc?.name ?? '—'}</td>
                    <td className="right">
                      <span className="row" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn small" onClick={() => exportCharacter(c)}>Export</button>
                        <button
                          className="btn small danger"
                          onClick={() => {
                            if (confirm(`Delete ${c.name}? This cannot be undone.`)) deleteCharacter(c.id)
                          }}
                        >
                          Delete
                        </button>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {active && (
        <div className="card">
          <h2>Notes</h2>
          <div className="field">
            <textarea
              value={active.notes}
              placeholder="Campaign notes, contacts, unanswered questions…"
              onChange={(e) => updateCharacter(active.id, { notes: e.target.value })}
            />
          </div>
        </div>
      )}

      {active && pendingLevels(active).length > 0 && (
        <div className="card" style={{ borderColor: 'var(--gold)' }}>
          <div className="row between">
            <div>
              <strong>Unfinished level choices.</strong>{' '}
              <span className="muted">Level {pendingLevels(active).join(', ')} still needs decisions.</span>
            </div>
            <button className="btn small primary" onClick={() => navigate('/level-up')}>Resolve</button>
          </div>
        </div>
      )}
    </>
  )
}

function ActiveOverview() {
  const { active, updateCharacter } = useStore()
  const navigate = useNavigate()
  if (!active) return null
  const d = derive(active)
  const species = getSpecies(active.speciesKey)
  const background = getBackground(active.backgroundKey)
  const discipline = getDiscipline(d.disciplineKey)

  return (
    <div className="card">
      <div className="row between">
        <div>
          <div className="eyebrow">Active character</div>
          <div className="display" style={{ fontSize: 26 }}>{active.name}</div>
          <div className="muted small">
            {species?.name}{active.speciesVariant ? ` (${species?.variants?.find(v => v.key === active.speciesVariant)?.name})` : ''} · {background?.name} · Savant {discipline ? `(${discipline.name})` : ''}
          </div>
        </div>
        <div className="row">
          <span className="pill-level">LV {active.level}</span>
          {active.level < 20 && (
            <button
              className="btn primary"
              onClick={() => {
                updateCharacter(active.id, { level: active.level + 1 })
                navigate('/level-up')
              }}
            >
              Level up
            </button>
          )}
        </div>
      </div>
      <hr className="rule" />
      <div className="grid cols-3" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
        <div className="stat-tile"><div className="label">HP</div><div className="value">{active.currentHP}/{d.maxHP}</div></div>
        <div className="stat-tile"><div className="label">AC</div><div className="value">{d.ac}</div></div>
        <div className="stat-tile"><div className="label">Initiative</div><div className="value">{fmt(d.initiative)}</div></div>
        <div className="stat-tile"><div className="label">Speed</div><div className="value">{d.speed}</div></div>
        <div className="stat-tile"><div className="label">Intellect die</div><div className="value">{d.intellectDie ? `d${d.intellectDie}` : '—'}</div></div>
        <div className="stat-tile"><div className="label">Intellect DC</div><div className="value">{d.intellectDC}</div></div>
      </div>
    </div>
  )
}
