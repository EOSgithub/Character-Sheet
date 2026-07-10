import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore, exportCharacter } from '../state/store'
import { derive } from '../rules/derive'
import { pendingLevels } from '../rules/levelup'
import { getSpecies } from '../data/species'
import { getDiscipline } from '../data/savant'
import CharacterBand from './CharacterBand'
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
      {active ? (
        <CharacterBand
          section="Overview"
          action={active.level < 20 ? (
            <button
              className="btn brass"
              onClick={() => {
                updateCharacter(active.id, { level: active.level + 1 })
                navigate('/level-up')
              }}
            >
              Level up
            </button>
          ) : undefined}
        />
      ) : (
        <div className="page-head">
          <h1>Savant Codex</h1>
          <span className="sub">A play-at-the-table sheet for the Savant · D&amp;D 2024</span>
        </div>
      )}

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
                        onClick={() => { setActive(c.id); navigate('/sheet') }}
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
