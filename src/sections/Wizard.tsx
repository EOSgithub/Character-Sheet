import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, newId } from '../state/store'
import type { AbilityKey, Character, InventoryItem } from '../types'
import { ABILITY_KEYS, ABILITY_NAMES, SKILLS } from '../types'
import { SPECIES } from '../data/species'
import { BACKGROUNDS, getOriginFeat } from '../data/backgrounds'
import { PURSUITS, SAVANT_SKILL_LIST, SAVANT_BASICS } from '../data/savant'
import { derive, mod, fmt } from '../rules/derive'
import { PageHead, Stepper } from './shared'

const STEPS = ['Name', 'Species', 'Background', 'Abilities', 'Class', 'Review'] as const

const POINT_COSTS: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 }
const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]

type ScoreMethod = 'standard' | 'pointbuy' | 'manual'

export default function Wizard() {
  const { createCharacter } = useStore()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [speciesKey, setSpeciesKey] = useState('')
  const [speciesVariant, setSpeciesVariant] = useState('')
  const [backgroundKey, setBackgroundKey] = useState('')
  const [bonusMode, setBonusMode] = useState<'2-1' | '1-1-1'>('2-1')
  const [bonusTwo, setBonusTwo] = useState<AbilityKey | ''>('')
  const [bonusOne, setBonusOne] = useState<AbilityKey | ''>('')
  const [method, setMethod] = useState<ScoreMethod>('standard')
  const [scores, setScores] = useState<Record<AbilityKey, number>>({ str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 })
  const [arrayAssign, setArrayAssign] = useState<Partial<Record<AbilityKey, number>>>({})
  const [classSkills, setClassSkills] = useState<string[]>([])
  const [pursuit, setPursuit] = useState('')

  const species = SPECIES.find((s) => s.key === speciesKey)
  const background = BACKGROUNDS.find((b) => b.key === backgroundKey)

  const backgroundBonuses = useMemo(() => {
    const out: Partial<Record<AbilityKey, number>> = {}
    if (!background) return out
    if (bonusMode === '1-1-1') {
      for (const a of background.abilities) out[a] = 1
    } else {
      if (bonusTwo) out[bonusTwo] = 2
      if (bonusOne) out[bonusOne] = (out[bonusOne] ?? 0) + 1
    }
    return out
  }, [background, bonusMode, bonusTwo, bonusOne])

  const baseAbilities = useMemo<Record<AbilityKey, number>>(() => {
    if (method === 'standard') {
      const out = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 }
      for (const k of ABILITY_KEYS) if (arrayAssign[k] !== undefined) out[k] = arrayAssign[k]!
      return out
    }
    return scores
  }, [method, scores, arrayAssign])

  const pointsUsed = ABILITY_KEYS.reduce((sum, k) => sum + (POINT_COSTS[scores[k]] ?? 0), 0)

  function stepValid(i: number): boolean {
    switch (i) {
      case 0: return name.trim().length > 0
      case 1: return !!species && (!species.variants || !!speciesVariant)
      case 2: return !!background && (bonusMode === '1-1-1' || (!!bonusTwo && !!bonusOne && bonusTwo !== bonusOne))
      case 3:
        if (method === 'standard') return ABILITY_KEYS.every((k) => arrayAssign[k] !== undefined)
        if (method === 'pointbuy') return pointsUsed === 27
        return true
      case 4: return classSkills.length === 2 && !!pursuit
      default: return true
    }
  }

  function finish() {
    const id = newId()
    const now = new Date().toISOString()
    const startingItems: InventoryItem[] = [
      { id: newId(), name: 'Leather Armor', qty: 1, equipped: true },
      { id: newId(), name: "Artisan's Tools", qty: 1, notes: 'your choice of set' },
      { id: newId(), name: "Scholar's Pack", qty: 1 },
    ]
    const c: Character = {
      id,
      name: name.trim(),
      speciesKey,
      speciesVariant: speciesVariant || undefined,
      backgroundKey,
      backgroundBonuses,
      baseAbilities,
      level: 1,
      xp: 0,
      classSkills,
      bonusSkills: background ? [...background.skills] : [],
      expertise: [],
      toolProficiencies: background ? [background.tool, "Artisan's Tools (one set)"] : [],
      languages: ['Common'],
      choices: { 1: { pursuits: [pursuit] } },
      currentHP: 0,
      tempHP: 0,
      hitDiceSpent: 0,
      deathSaves: { successes: 0, failures: 0 },
      conditions: [],
      exhaustion: 0,
      armor: 'leather',
      shield: false,
      focus: { active: false, name: '', clues: [], notes: '' },
      reactionsUsed: 0,
      resourceUses: {},
      heroicInspiration: false,
      inventory: startingItems,
      attacks: [],
      coins: { cp: 0, sp: 0, gp: 0, pp: 0 },
      notes: '',
      createdAt: now,
      updatedAt: now,
    }
    c.currentHP = derive(c).maxHP
    createCharacter(c)
    navigate('/')
  }

  const level1Pursuits = PURSUITS.filter((p) => !p.minLevel)

  return (
    <>
      <PageHead title="New Savant" sub="Guided creation · D&D 2024 rules" />
      <div className="steps">
        {STEPS.map((s, i) => (
          <span key={s} className={`step${i === step ? ' now' : i < step ? ' done' : ''}`}>{i + 1}. {s}</span>
        ))}
      </div>

      {step === 0 && (
        <div className="card">
          <h2>Who is this Savant?</h2>
          <div className="field" style={{ maxWidth: 420 }}>
            <label>Character name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Elara Quillwright" autoFocus />
          </div>
          <p className="muted small mt">
            The Savant is an Intelligence-based, non-magical scholar. Armed with only their wit, they aid
            their allies and outwit their enemies.
          </p>
        </div>
      )}

      {step === 1 && (
        <div className="card">
          <h2>Species</h2>
          <div className="grid cols-2">
            {SPECIES.map((s) => (
              <button
                key={s.key}
                className={`opt${speciesKey === s.key ? ' selected' : ''}`}
                onClick={() => { setSpeciesKey(s.key); setSpeciesVariant('') }}
              >
                <div className="opt-title">{s.name}</div>
                <div className="opt-sub">{s.size} · Speed {s.speed} ft · {s.traits.map((t) => t.name).join(', ')}</div>
              </button>
            ))}
          </div>
          {species?.variants && (
            <>
              <h3>{species.variantLabel}</h3>
              <div className="grid cols-3">
                {species.variants.map((v) => (
                  <button
                    key={v.key}
                    className={`opt${speciesVariant === v.key ? ' selected' : ''}`}
                    onClick={() => setSpeciesVariant(v.key)}
                  >
                    <div className="opt-title">{v.name}</div>
                    {v.traits[0] && <div className="opt-sub">{v.traits[0].text.slice(0, 90)}…</div>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h2>Background</h2>
          <div className="grid cols-2">
            {BACKGROUNDS.map((b) => (
              <button
                key={b.key}
                className={`opt${backgroundKey === b.key ? ' selected' : ''}`}
                onClick={() => { setBackgroundKey(b.key); setBonusTwo(''); setBonusOne('') }}
              >
                <div className="opt-title">{b.name}</div>
                <div className="opt-sub">
                  {b.abilities.map((a) => a.toUpperCase()).join(' / ')} · {getOriginFeat(b.featKey)?.name} · {b.skills.map((s) => SKILLS.find((x) => x.key === s)?.name).join(', ')}
                </div>
              </button>
            ))}
          </div>
          {background && (
            <>
              <h3>Ability score increases</h3>
              <p className="muted small">
                Your background lets you increase {background.abilities.map((a) => ABILITY_NAMES[a]).join(', ')}:
                either +2 to one and +1 to another, or +1 to all three.
              </p>
              <div className="row">
                <button className={`chip${bonusMode === '2-1' ? ' on' : ''}`} style={{ minHeight: 44 }} onClick={() => setBonusMode('2-1')}>+2 / +1</button>
                <button className={`chip${bonusMode === '1-1-1' ? ' on' : ''}`} style={{ minHeight: 44 }} onClick={() => setBonusMode('1-1-1')}>+1 / +1 / +1</button>
              </div>
              {bonusMode === '2-1' && (
                <div className="row mt">
                  <div className="field">
                    <label>+2 to</label>
                    <select value={bonusTwo} onChange={(e) => setBonusTwo(e.target.value as AbilityKey)}>
                      <option value="">choose…</option>
                      {background.abilities.map((a) => <option key={a} value={a}>{ABILITY_NAMES[a]}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>+1 to</label>
                    <select value={bonusOne} onChange={(e) => setBonusOne(e.target.value as AbilityKey)}>
                      <option value="">choose…</option>
                      {background.abilities.filter((a) => a !== bonusTwo).map((a) => <option key={a} value={a}>{ABILITY_NAMES[a]}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <h2>Ability scores</h2>
          <div className="row">
            {(['standard', 'pointbuy', 'manual'] as ScoreMethod[]).map((m) => (
              <button key={m} className={`chip${method === m ? ' on' : ''}`} style={{ minHeight: 44 }} onClick={() => setMethod(m)}>
                {m === 'standard' ? 'Standard array' : m === 'pointbuy' ? 'Point buy (27)' : 'Manual entry'}
              </button>
            ))}
          </div>
          <p className="muted small mt">
            Quick build tip: make <strong>Intelligence</strong> your highest score, followed by Dexterity or Constitution.
            Background bonuses ({Object.entries(backgroundBonuses).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ') || 'none yet'}) are added on top.
          </p>

          {method === 'standard' && (
            <table className="ledger mt">
              <thead><tr><th>Ability</th><th>Assigned</th><th className="right">Final (with bonus)</th></tr></thead>
              <tbody>
                {ABILITY_KEYS.map((k) => {
                  const taken = ABILITY_KEYS.filter((x) => x !== k).map((x) => arrayAssign[x]).filter((v) => v !== undefined)
                  const counts: Record<number, number> = {}
                  for (const v of taken) counts[v!] = (counts[v!] ?? 0) + 1
                  return (
                    <tr key={k}>
                      <td style={{ fontWeight: 600 }}>{ABILITY_NAMES[k]}</td>
                      <td>
                        <select
                          value={arrayAssign[k] ?? ''}
                          onChange={(e) => setArrayAssign({ ...arrayAssign, [k]: e.target.value ? Number(e.target.value) : undefined })}
                          style={{ minHeight: 44 }}
                        >
                          <option value="">—</option>
                          {STANDARD_ARRAY.filter((v, i, arr) => arr.indexOf(v) === i).map((v) => {
                            const total = STANDARD_ARRAY.filter((x) => x === v).length
                            const available = total - (counts[v] ?? 0)
                            return <option key={v} value={v} disabled={available <= 0}>{v}</option>
                          })}
                        </select>
                      </td>
                      <td className="num right" style={{ fontSize: 17 }}>
                        {arrayAssign[k] !== undefined ? arrayAssign[k]! + (backgroundBonuses[k] ?? 0) : '—'}
                        {arrayAssign[k] !== undefined && ` (${fmt(mod(arrayAssign[k]! + (backgroundBonuses[k] ?? 0)))})`}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {method !== 'standard' && (
            <>
              {method === 'pointbuy' && (
                <p className="mt"><span className="num" style={{ fontSize: 20 }}>{27 - pointsUsed}</span> <span className="muted small">points remaining (scores 8–15)</span></p>
              )}
              <table className="ledger mt">
                <thead><tr><th>Ability</th><th>Score</th><th className="right">Final (with bonus)</th></tr></thead>
                <tbody>
                  {ABILITY_KEYS.map((k) => (
                    <tr key={k}>
                      <td style={{ fontWeight: 600 }}>{ABILITY_NAMES[k]}</td>
                      <td>
                        <Stepper
                          value={scores[k]}
                          min={method === 'pointbuy' ? 8 : 3}
                          max={method === 'pointbuy' ? 15 : 18}
                          onChange={(v) => setScores({ ...scores, [k]: v })}
                        />
                      </td>
                      <td className="num right" style={{ fontSize: 17 }}>
                        {scores[k] + (backgroundBonuses[k] ?? 0)} ({fmt(mod(scores[k] + (backgroundBonuses[k] ?? 0)))})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="card">
          <h2>Savant class choices</h2>
          <h3>Skill proficiencies — choose two</h3>
          <div className="row">
            {SAVANT_SKILL_LIST.map((sk) => {
              const s = SKILLS.find((x) => x.key === sk)!
              const on = classSkills.includes(sk)
              const fromBackground = background?.skills.includes(sk)
              return (
                <button
                  key={sk}
                  className={`chip${on ? ' on' : ''}`}
                  style={{ minHeight: 44 }}
                  disabled={!on && classSkills.length >= 2}
                  onClick={() => setClassSkills(on ? classSkills.filter((x) => x !== sk) : [...classSkills, sk])}
                >
                  {s.name}{fromBackground ? ' *' : ''}
                </button>
              )
            })}
          </div>
          {background && <p className="muted small mt">* already granted by your {background.name} background — picking it again is redundant.</p>}

          <h3>Scholarly Pursuit — choose one</h3>
          <div className="grid cols-2">
            {level1Pursuits.map((p) => (
              <button key={p.key} className={`opt${pursuit === p.key ? ' selected' : ''}`} onClick={() => setPursuit(p.key)}>
                <div className="opt-title">{p.name}</div>
                <div className="opt-sub">{p.text.slice(0, 130)}…</div>
              </button>
            ))}
          </div>

          <h3>Starting equipment</h3>
          <ul className="small muted">
            {SAVANT_BASICS.startingEquipment.map((e) => <li key={e}>{e}</li>)}
          </ul>
          <p className="small muted">Armor, tools, and pack are added to your inventory automatically — add your weapon picks in the Inventory section.</p>
        </div>
      )}

      {step === 5 && background && species && (
        <div className="card">
          <h2>Review</h2>
          <table className="ledger">
            <tbody>
              <tr><td>Name</td><td className="right" style={{ fontWeight: 600 }}>{name}</td></tr>
              <tr><td>Species</td><td className="right">{species.name}{speciesVariant && ` — ${species.variants?.find((v) => v.key === speciesVariant)?.name}`}</td></tr>
              <tr><td>Background</td><td className="right">{background.name} ({getOriginFeat(background.featKey)?.name})</td></tr>
              <tr>
                <td>Abilities</td>
                <td className="right num">
                  {ABILITY_KEYS.map((k) => `${k.toUpperCase()} ${baseAbilities[k] + (backgroundBonuses[k] ?? 0)}`).join(' · ')}
                </td>
              </tr>
              <tr><td>Class skills</td><td className="right">{classSkills.map((sk) => SKILLS.find((x) => x.key === sk)?.name).join(', ')}</td></tr>
              <tr><td>Scholarly Pursuit</td><td className="right">{PURSUITS.find((p) => p.key === pursuit)?.name}</td></tr>
              <tr><td>Saving throws</td><td className="right">Intelligence, Wisdom</td></tr>
              <tr><td>Level 1 features</td><td className="right">Adroit Analysis · Predictive Defense · Scholarly Pursuits</td></tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="row mt">
        {step > 0 && <button className="btn" onClick={() => setStep(step - 1)}>Back</button>}
        <span className="spacer" />
        {step < STEPS.length - 1 ? (
          <button className="btn primary" disabled={!stepValid(step)} onClick={() => setStep(step + 1)}>Continue</button>
        ) : (
          <button className="btn primary" onClick={finish}>Create character</button>
        )}
      </div>
    </>
  )
}
