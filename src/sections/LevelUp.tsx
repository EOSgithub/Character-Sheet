import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../state/store'
import type { AbilityKey, LevelChoices } from '../types'
import { ABILITY_KEYS, ABILITY_NAMES } from '../types'
import { derive, allPursuits, fmt } from '../rules/derive'
import { gainsForLevel, pendingLevels } from '../rules/levelup'
import { DISCIPLINES, PURSUITS, SCHOLARLY_FEATS, getDiscipline, getPursuit, SAVANT_TABLE } from '../data/savant'
import { NoCharacter, PageHead } from './shared'

export default function LevelUp() {
  const { active, updateCharacter } = useStore()
  const navigate = useNavigate()
  if (!active) return <><PageHead title="Level up" /><NoCharacter /></>
  const c = active
  const pending = pendingLevels(c)

  if (pending.length === 0) {
    return (
      <>
        <PageHead title="Level up" sub={`${c.name} · Savant ${c.level}`} />
        <div className="empty card">
          <div className="display">All levels resolved</div>
          <p>{c.level < 20 ? 'Use “Level up” on the Home page when your Savant advances.' : 'Level 20 — your true potential, realized.'}</p>
          <button className="btn" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </>
    )
  }

  const level = pending[0]
  return <LevelForm key={level} level={level} onCancelLevel={level === c.level ? () => {
    const { [level]: _, ...rest } = c.choices
    updateCharacter(c.id, { level: c.level - 1, choices: rest })
    navigate('/')
  } : undefined} />
}

function LevelForm({ level, onCancelLevel }: { level: number; onCancelLevel?: () => void }) {
  const { active, updateCharacter } = useStore()
  const navigate = useNavigate()
  const c = active!
  const d = derive(c)
  const gains = gainsForLevel(c, level)
  const existing = c.choices[level] ?? {}
  const known = allPursuits(c).filter((p) => !(existing.pursuits ?? []).includes(p))

  const [hpMode, setHpMode] = useState<'fixed' | 'roll'>('fixed')
  const [hpRoll, setHpRoll] = useState('')
  const [pursuit, setPursuit] = useState(existing.pursuits?.[0] ?? '')
  const [discipline, setDiscipline] = useState(existing.discipline ?? '')
  const [asiMode, setAsiMode] = useState<'asi' | 'feat'>('asi')
  const [asiA, setAsiA] = useState<AbilityKey | ''>('')
  const [asiB, setAsiB] = useState<AbilityKey | ''>('')
  const [asiSplit, setAsiSplit] = useState<'2' | '1+1'>('2')
  const [featName, setFeatName] = useState('')
  const [featText, setFeatText] = useState('')
  const [options, setOptions] = useState<string[]>(existing.disciplineOptions ?? [])
  const [grantedAlt, setGrantedAlt] = useState('')

  const conMod = d.mods.con
  const fixedHP = 5 + conMod

  const dKey = gains.needsDiscipline ? discipline : d.disciplineKey
  const disciplineDef = getDiscipline(dKey)

  // options due at this level (runes/recipes) — depends on discipline picked at 3
  const optionPicksDue = (() => {
    if (!disciplineDef?.options) return 0
    if (level === 3) return disciplineDef.options.initial
    if (disciplineDef.options.moreAt.includes(level)) return 1
    return 0
  })()

  const grantedPursuitDef = disciplineDef?.grantsPursuit && disciplineDef.grantsPursuit.level === level
    ? disciplineDef.grantsPursuit
    : undefined
  const grantedConflicts = grantedPursuitDef ? known.includes(grantedPursuitDef.pursuit) || pursuit === grantedPursuitDef.pursuit : false

  const availablePursuits = PURSUITS.filter(
    (p) => (!p.minLevel || level >= p.minLevel) && !known.includes(p.key),
  )

  function valid(): boolean {
    if (level >= 2 && hpMode === 'roll' && !(parseInt(hpRoll, 10) >= 1 && parseInt(hpRoll, 10) <= 8)) return false
    if (gains.needsPursuit && !pursuit) return false
    if (gains.needsDiscipline && !discipline) return false
    if (gains.needsASI) {
      if (asiMode === 'asi') {
        if (asiSplit === '2' && !asiA) return false
        if (asiSplit === '1+1' && (!asiA || !asiB || asiA === asiB)) return false
      } else if (!featName.trim()) return false
    }
    if (optionPicksDue > 0 && options.length !== optionPicksDue) return false
    if (grantedPursuitDef && grantedConflicts && !grantedAlt) return false
    return true
  }

  function save() {
    const ch: LevelChoices = {}
    if (level >= 2) {
      ch.hp = hpMode === 'fixed' ? fixedHP : parseInt(hpRoll, 10) + conMod
    }
    const pursuitList: string[] = []
    if (gains.needsPursuit && pursuit) pursuitList.push(pursuit)
    if (grantedPursuitDef) pursuitList.push(grantedConflicts ? grantedAlt : grantedPursuitDef.pursuit)
    if (pursuitList.length) ch.pursuits = pursuitList
    if (gains.needsDiscipline) ch.discipline = discipline
    if (gains.needsASI) {
      if (asiMode === 'asi') {
        ch.asi = asiSplit === '2' ? { [asiA as AbilityKey]: 2 } : { [asiA as AbilityKey]: 1, [asiB as AbilityKey]: 1 }
      } else {
        const preset = SCHOLARLY_FEATS.find((f) => f.name === featName)
        ch.feat = { name: featName.trim(), description: featText.trim() || preset?.text }
      }
    }
    if (optionPicksDue > 0) ch.disciplineOptions = options
    updateCharacter(c.id, (cur) => {
      const newChoices = { ...cur.choices, [level]: ch }
      // current HP grows by the HP gained at this level (derive() already
      // counts a default for unresolved levels, so deltas of maxHP won't work)
      const newMax = derive({ ...cur, choices: newChoices }).maxHP
      const hadHP = cur.choices[level]?.hp !== undefined
      const gained = hadHP ? 0 : ch.hp ?? 0
      return { choices: newChoices, currentHP: Math.min(newMax, cur.currentHP + gained) }
    })
    navigate(pendingLevels({ ...c, choices: { ...c.choices, [level]: ch } }).length > 0 ? '/level-up' : '/')
  }

  const row = SAVANT_TABLE[level - 1]

  return (
    <>
      <PageHead title={`Level ${level}`} sub={`${c.name} · resolving level choices`} />

      <div className="card">
        <h2>New at this level</h2>
        <div className="row">
          {row.features.map((f) => <span key={f} className="chip">{f}</span>)}
          {gains.intellectDieChanged && <span className="die-chip">Intellect Die → d{row.intellectDie}</span>}
        </div>
        {gains.features.map((f) => (
          <details key={f.name} className="feature" open>
            <summary><span className="f-name">{f.name}</span><span className="f-meta">Savant {f.level}</span></summary>
            <div className="f-text">{f.text}</div>
          </details>
        ))}
        {gains.disciplineFeatures.map((f) => (
          <details key={f.name} className="feature" open>
            <summary><span className="f-name">{f.name}</span><span className="f-meta">Discipline {f.level}</span></summary>
            <div className="f-text">{f.text}</div>
          </details>
        ))}
      </div>

      {level >= 2 && (
        <div className="card">
          <h2>Hit points</h2>
          <div className="row">
            <button className={`chip${hpMode === 'fixed' ? ' on' : ''}`} style={{ minHeight: 44 }} onClick={() => setHpMode('fixed')}>
              Fixed: +{fixedHP} (5 {fmt(conMod)} CON)
            </button>
            <button className={`chip${hpMode === 'roll' ? ' on' : ''}`} style={{ minHeight: 44 }} onClick={() => setHpMode('roll')}>
              I rolled my d8
            </button>
            {hpMode === 'roll' && (
              <input
                inputMode="numeric"
                placeholder="d8 result"
                value={hpRoll}
                onChange={(e) => setHpRoll(e.target.value.replace(/\D/g, ''))}
                style={{ width: 100, minHeight: 44, border: '1px solid var(--rule-strong)', borderRadius: 6, padding: '4px 12px', background: '#fff' }}
              />
            )}
          </div>
        </div>
      )}

      {gains.needsDiscipline && (
        <div className="card">
          <h2>Choose your Academic Discipline</h2>
          <div className="grid cols-2">
            {DISCIPLINES.map((disc) => (
              <button key={disc.key} className={`opt${discipline === disc.key ? ' selected' : ''}`} onClick={() => { setDiscipline(disc.key); setOptions([]) }}>
                <div className="opt-title">{disc.name} {disc.source === 'expanded' && <span className="muted small">(expanded)</span>}</div>
                <div className="opt-sub">{disc.blurb}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {optionPicksDue > 0 && disciplineDef?.options && (
        <div className="card">
          <h2>Choose {optionPicksDue} {disciplineDef.options.label.toLowerCase()}</h2>
          <div className="grid cols-2">
            {disciplineDef.options.list
              .filter((o) => !o.minLevel || level >= o.minLevel)
              .filter((o) => {
                // exclude picks already made at earlier levels
                for (let lv = 1; lv < level; lv++) {
                  if (c.choices[lv]?.disciplineOptions?.includes(o.key)) return false
                }
                return true
              })
              .map((o) => {
                const on = options.includes(o.key)
                return (
                  <button
                    key={o.key}
                    className={`opt${on ? ' selected' : ''}`}
                    disabled={!on && options.length >= optionPicksDue}
                    onClick={() => setOptions(on ? options.filter((x) => x !== o.key) : [...options, o.key])}
                  >
                    <div className="opt-title">{o.name}</div>
                    <div className="opt-sub">{o.text.slice(0, 120)}…</div>
                  </button>
                )
              })}
          </div>
        </div>
      )}

      {grantedPursuitDef && (
        <div className="card">
          <h2>Granted Scholarly Pursuit</h2>
          {!grantedConflicts ? (
            <p>
              Your discipline grants you <strong>{getPursuit(grantedPursuitDef.pursuit)?.name}</strong>.
            </p>
          ) : (
            <>
              <p>You already master {getPursuit(grantedPursuitDef.pursuit)?.name} — choose a replacement:</p>
              <div className="row">
                {grantedPursuitDef.alternatives.map((alt) => (
                  <button key={alt} className={`chip${grantedAlt === alt ? ' on' : ''}`} style={{ minHeight: 44 }} onClick={() => setGrantedAlt(alt)}>
                    {getPursuit(alt)?.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {gains.needsPursuit && (
        <div className="card">
          <h2>Master a Scholarly Pursuit</h2>
          <div className="grid cols-2">
            {availablePursuits.map((p) => (
              <button key={p.key} className={`opt${pursuit === p.key ? ' selected' : ''}`} onClick={() => setPursuit(p.key)}>
                <div className="opt-title">{p.name} {p.source === 'expanded' && <span className="muted small">(expanded)</span>}</div>
                <div className="opt-sub">{p.text.slice(0, 120)}…</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {gains.needsASI && (
        <div className="card">
          <h2>Ability Score Improvement</h2>
          <div className="row">
            <button className={`chip${asiMode === 'asi' ? ' on' : ''}`} style={{ minHeight: 44 }} onClick={() => setAsiMode('asi')}>Increase abilities</button>
            <button className={`chip${asiMode === 'feat' ? ' on' : ''}`} style={{ minHeight: 44 }} onClick={() => setAsiMode('feat')}>Take a feat</button>
          </div>
          {asiMode === 'asi' ? (
            <div className="row mt">
              <div className="field">
                <label>Split</label>
                <select value={asiSplit} onChange={(e) => setAsiSplit(e.target.value as '2' | '1+1')}>
                  <option value="2">+2 to one ability</option>
                  <option value="1+1">+1 to two abilities</option>
                </select>
              </div>
              <div className="field">
                <label>{asiSplit === '2' ? '+2 to' : 'First +1'}</label>
                <select value={asiA} onChange={(e) => setAsiA(e.target.value as AbilityKey)}>
                  <option value="">choose…</option>
                  {ABILITY_KEYS.map((k) => (
                    <option key={k} value={k} disabled={d.abilities[k] + (asiSplit === '2' ? 2 : 1) > 20}>
                      {ABILITY_NAMES[k]} ({d.abilities[k]})
                    </option>
                  ))}
                </select>
              </div>
              {asiSplit === '1+1' && (
                <div className="field">
                  <label>Second +1</label>
                  <select value={asiB} onChange={(e) => setAsiB(e.target.value as AbilityKey)}>
                    <option value="">choose…</option>
                    {ABILITY_KEYS.filter((k) => k !== asiA).map((k) => (
                      <option key={k} value={k} disabled={d.abilities[k] + 1 > 20}>
                        {ABILITY_NAMES[k]} ({d.abilities[k]})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : (
            <div className="mt">
              <div className="row">
                {SCHOLARLY_FEATS.map((f) => (
                  <button key={f.key} className={`chip${featName === f.name ? ' on' : ''}`} style={{ minHeight: 40 }} onClick={() => { setFeatName(f.name); setFeatText('') }}>
                    {f.name}
                  </button>
                ))}
              </div>
              <div className="grid cols-2 mt">
                <div className="field">
                  <label>Feat name</label>
                  <input value={featName} onChange={(e) => setFeatName(e.target.value)} placeholder="Scholarly feat above, or any PHB feat" />
                </div>
                <div className="field">
                  <label>Description (for custom feats)</label>
                  <textarea value={featText} onChange={(e) => setFeatText(e.target.value)} placeholder="Optional — scholarly feats fill in automatically" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="row mt">
        {onCancelLevel && (
          <button className="btn danger" onClick={onCancelLevel}>Cancel this level</button>
        )}
        <span className="spacer" />
        <button className="btn primary" disabled={!valid()} onClick={save}>Confirm level {level}</button>
      </div>
    </>
  )
}
