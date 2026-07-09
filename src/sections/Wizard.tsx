import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, newId } from '../state/store'
import type { AbilityKey, Character, InventoryItem } from '../types'
import { ABILITY_KEYS, ABILITY_NAMES, SKILLS } from '../types'
import { SPECIES } from '../data/species'
import type { SpeciesDef } from '../data/species'
import { BACKGROUNDS, getOriginFeat } from '../data/backgrounds'
import type { BackgroundDef } from '../data/backgrounds'
import { PURSUITS, SAVANT_SKILL_LIST, SAVANT_EQUIP_CHOICES, SAVANT_EQUIP_FIXED } from '../data/savant'
import type { PursuitDef } from '../data/savant'
import { WEAPONS } from '../data/weapons'
import { ARTISANS_TOOLS, routeFeatChoices } from '../data/lists'
import { derive, mod, fmt } from '../rules/derive'
import { PageHead, Stepper } from './shared'
import { pickLabel } from './picks'
import { SpeciesModal, BackgroundModal, PursuitModal, defaultSpeciesDraft, defaultBackgroundDraft, toolChoiceList } from './WizardModals'
import type { SpeciesDraft, BackgroundDraft } from './WizardModals'

const skillName = (k: string) => SKILLS.find((s) => s.key === k)?.name ?? k
const SIMPLE_WEAPONS = WEAPONS.filter((w) => w.category.startsWith('Simple'))

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
  const [size, setSize] = useState('')
  const [speciesChoices, setSpeciesChoices] = useState<Record<string, string>>({})
  /** sub-picks for a Versatile Origin feat (e.g. Human → Skilled → 3 skills/tools) */
  const [featPicks, setFeatPicks] = useState<Record<string, string>>({})
  const [equip, setEquip] = useState<Record<string, string>>({ weapon: 'a', ranged: 'a' })
  /** weapon key chosen for an equipment option that needs one, keyed by choice id */
  const [equipPicks, setEquipPicks] = useState<Record<string, string>>({})
  /** chosen artisan's tools set (always required) */
  const [artisanTool, setArtisanTool] = useState('')
  /** encoded values for a pursuit's open picks, keyed by pick id */
  const [pursuitPicks, setPursuitPicks] = useState<Record<string, string>>({})
  const [backgroundKey, setBackgroundKey] = useState('')
  /** chosen tool when a background's tool is "of your choice" */
  const [bgTool, setBgTool] = useState('')
  /** resolved picks for the background's Origin feat (e.g. Sage → Magic Initiate spells) */
  const [bgFeatPicks, setBgFeatPicks] = useState<Record<string, string>>({})
  /** which option's detail/config modal is open */
  const [speciesModal, setSpeciesModal] = useState<SpeciesDef | null>(null)
  const [bgModal, setBgModal] = useState<BackgroundDef | null>(null)
  const [pursuitModal, setPursuitModal] = useState<PursuitDef | null>(null)
  const [bonusMode, setBonusMode] = useState<'2-1' | '1-1-1'>('2-1')
  const [bonusTwo, setBonusTwo] = useState<AbilityKey | ''>('')
  const [bonusOne, setBonusOne] = useState<AbilityKey | ''>('')
  const [method, setMethod] = useState<ScoreMethod>('standard')
  const [scores, setScores] = useState<Record<AbilityKey, number>>({ str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 })
  const [arrayAssign, setArrayAssign] = useState<Partial<Record<AbilityKey, number>>>({})
  const [classSkills, setClassSkills] = useState<string[]>([])
  const [pursuit, setPursuit] = useState('')

  const species = SPECIES.find((s) => s.key === speciesKey)
  const variant = species?.variants?.find((v) => v.key === speciesVariant)
  const background = BACKGROUNDS.find((b) => b.key === backgroundKey)

  function commitSpecies(s: SpeciesDef, d: SpeciesDraft) {
    setSpeciesKey(s.key)
    setSpeciesVariant(d.variant)
    setSize(d.size)
    setSpeciesChoices(d.choices)
    setFeatPicks(d.featPicks)
    setSpeciesModal(null)
  }
  function commitBackground(b: BackgroundDef, d: BackgroundDraft) {
    setBackgroundKey(b.key)
    setBonusMode(d.bonusMode)
    setBonusTwo(d.bonusTwo)
    setBonusOne(d.bonusOne)
    setBgTool(d.bgTool)
    setBgFeatPicks(d.bgFeatPicks)
    setBgModal(null)
  }

  /** Non-size species choices that still need an answer. */
  const speciesChoicesAnswered = (species?.choices ?? [])
    .filter((ch) => ch.kind !== 'size')
    .every((ch) => !!speciesChoices[ch.id])

  const versatileChoice = species?.choices?.find((ch) => ch.kind === 'originFeat')
  const versatileFeat = versatileChoice ? getOriginFeat(speciesChoices[versatileChoice.id] ?? '') : undefined
  const versatilePicksComplete = (versatileFeat?.picks ?? []).every((pk) => !!featPicks[pk.id])

  const selectedPursuit = PURSUITS.find((p) => p.key === pursuit)
  const pursuitPicksComplete = (selectedPursuit?.picks ?? []).every((pk) => !!pursuitPicks[pk.id])
  const bgToolList = background ? toolChoiceList(background.tool) : null
  const bgFeat = background ? getOriginFeat(background.featKey) : undefined
  const bgFeatPicksComplete = (bgFeat?.picks ?? []).every((pk) => !!bgFeatPicks[pk.id])

  const equipmentComplete =
    SAVANT_EQUIP_CHOICES.every((ch) => {
      const opt = ch.options.find((o) => o.key === equip[ch.id])
      return opt ? (opt.pick ? !!equipPicks[ch.id] : true) : false
    }) && !!artisanTool

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
      case 1: return !!species && (!species.variants || !!speciesVariant) && !!size && speciesChoicesAnswered && versatilePicksComplete
      case 2: return !!background && (bonusMode === '1-1-1' || (!!bonusTwo && !!bonusOne && bonusTwo !== bonusOne)) && (!bgToolList || !!bgTool) && bgFeatPicksComplete
      case 3:
        if (method === 'standard') return ABILITY_KEYS.every((k) => arrayAssign[k] !== undefined)
        if (method === 'pointbuy') return pointsUsed === 27
        return true
      case 4: return classSkills.length === 2 && !!pursuit && pursuitPicksComplete && equipmentComplete
      default: return true
    }
  }

  function finish() {
    const id = newId()
    const now = new Date().toISOString()

    const addItem = (it: { name: string; qty?: number; equipped?: boolean; notes?: string; category?: InventoryItem['category'] }): InventoryItem =>
      ({ id: newId(), name: it.name, qty: it.qty ?? 1, equipped: it.equipped, notes: it.notes, category: it.category ?? 'gear' })

    // Build starting inventory from fixed gear + the selected equipment options.
    const startingItems: InventoryItem[] = SAVANT_EQUIP_FIXED.map(addItem)
    if (artisanTool) startingItems.push(addItem({ name: artisanTool, notes: 'artisan tools', category: 'tool' }))
    for (const ch of SAVANT_EQUIP_CHOICES) {
      const opt = ch.options.find((o) => o.key === equip[ch.id])
      if (!opt) continue
      if (opt.pick) {
        const w = WEAPONS.find((x) => x.key === equipPicks[ch.id])
        if (w) startingItems.push(addItem({ name: w.name, equipped: opt.pick.equipped, category: 'weapon' }))
      }
      for (const it of opt.items) startingItems.push(addItem(it))
    }

    // Species creation choices: skill grants add to proficiencies, an Origin feat
    // (Human Versatile) is recorded as a level-1 feat.
    const speciesSkillGrants: string[] = []
    let featEntry: { name: string; description?: string } | undefined
    for (const ch of species?.choices ?? []) {
      const val = speciesChoices[ch.id]
      if (!val) continue
      if (ch.kind === 'skill') speciesSkillGrants.push(val)
      if (ch.kind === 'originFeat') {
        const feat = getOriginFeat(val)
        if (feat) featEntry = { name: feat.name, description: feat.text }
      }
    }

    // Open picks (pursuit + Versatile feat + background feat) route to
    // skills / tools / languages / spells.
    const picked = routeFeatChoices([
      ...Object.values(pursuitPicks),
      ...Object.values(featPicks),
      ...Object.values(bgFeatPicks),
    ])

    const resolvedBgTool = background ? (bgToolList ? bgTool : background.tool) : undefined

    const c: Character = {
      id,
      name: name.trim(),
      speciesKey,
      speciesVariant: speciesVariant || undefined,
      size,
      speciesChoices,
      backgroundKey,
      backgroundBonuses,
      baseAbilities,
      level: 1,
      xp: 0,
      classSkills,
      bonusSkills: [...(background ? background.skills : []), ...speciesSkillGrants, ...picked.skills],
      expertise: [],
      toolProficiencies: [
        ...(resolvedBgTool ? [resolvedBgTool] : []),
        ...(artisanTool ? [artisanTool] : []),
        ...picked.tools,
      ],
      languages: ['Common', ...picked.languages],
      knownSpells: picked.spells,
      choices: { 1: { pursuits: [pursuit], ...(featEntry ? { feat: featEntry } : {}) } },
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
          <p className="muted small" style={{ marginTop: -4, marginBottom: 14 }}>Tap a species to read its traits and make its choices.</p>
          <div className="grid cols-2">
            {SPECIES.map((s) => {
              const chosen = speciesKey === s.key
              return (
                <button key={s.key} className={`opt${chosen ? ' selected' : ''}`} onClick={() => setSpeciesModal(s)}>
                  <div className="opt-title">{s.name}{chosen && <span className="tag equipped" style={{ marginLeft: 8 }}>Chosen</span>}</div>
                  <div className="opt-sub">
                    {chosen
                      ? `${size}${variant ? ` · ${variant.name}` : ''} · ${s.traits.map((t) => t.name).slice(0, 3).join(', ')}`
                      : `${s.size} · Speed ${s.speed} ft · ${s.traits.map((t) => t.name).join(', ')}`}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {speciesModal && (
        <SpeciesModal
          species={speciesModal}
          initial={speciesModal.key === speciesKey
            ? { variant: speciesVariant, size, choices: speciesChoices, featPicks }
            : defaultSpeciesDraft(speciesModal)}
          onChoose={(d) => commitSpecies(speciesModal, d)}
          onClose={() => setSpeciesModal(null)}
        />
      )}

      {step === 2 && (
        <div className="card">
          <h2>Background</h2>
          <p className="muted small" style={{ marginTop: -4, marginBottom: 14 }}>Tap a background to read its feat and set your ability increases.</p>
          <div className="grid cols-2">
            {BACKGROUNDS.map((b) => {
              const chosen = backgroundKey === b.key
              return (
                <button key={b.key} className={`opt${chosen ? ' selected' : ''}`} onClick={() => setBgModal(b)}>
                  <div className="opt-title">{b.name}{chosen && <span className="tag equipped" style={{ marginLeft: 8 }}>Chosen</span>}</div>
                  <div className="opt-sub">
                    {b.abilities.map((a) => a.toUpperCase()).join(' / ')} · {getOriginFeat(b.featKey)?.name} · {b.skills.map((s) => skillName(s)).join(', ')}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {bgModal && (
        <BackgroundModal
          background={bgModal}
          initial={bgModal.key === backgroundKey
            ? { bonusMode, bonusTwo, bonusOne, bgTool, bgFeatPicks }
            : defaultBackgroundDraft()}
          onChoose={(d) => commitBackground(bgModal, d)}
          onClose={() => setBgModal(null)}
        />
      )}

      {pursuitModal && (
        <PursuitModal
          pursuit={pursuitModal}
          initialPicks={pursuitModal.key === pursuit ? pursuitPicks : {}}
          onChoose={(picks) => { setPursuit(pursuitModal.key); setPursuitPicks(picks); setPursuitModal(null) }}
          onClose={() => setPursuitModal(null)}
        />
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
          <p className="muted small" style={{ marginTop: -4, marginBottom: 12 }}>Tap a pursuit to read what it does and make any choices.</p>
          <div className="grid cols-2">
            {level1Pursuits.map((p) => {
              const chosen = pursuit === p.key
              return (
                <button key={p.key} className={`opt${chosen ? ' selected' : ''}`} onClick={() => setPursuitModal(p)}>
                  <div className="opt-title">{p.name}{chosen && <span className="tag equipped" style={{ marginLeft: 8 }}>Chosen</span>}</div>
                  <div className="opt-sub">{p.text.split('. ')[0]}.</div>
                </button>
              )
            })}
          </div>

          <h3>Starting equipment — choose your gear</h3>
          {SAVANT_EQUIP_CHOICES.map((ch) => {
            const selectedOpt = ch.options.find((o) => o.key === equip[ch.id])
            return (
              <div className="choice-row" key={ch.id}>
                <span className="c-label">{ch.prompt}</span>
                <div className="row">
                  {ch.options.map((o) => (
                    <button
                      key={o.key}
                      className={`opt${equip[ch.id] === o.key ? ' selected' : ''}`}
                      style={{ flex: '1 1 220px' }}
                      onClick={() => setEquip({ ...equip, [ch.id]: o.key })}
                    >
                      <div className="opt-title">({o.key}) {o.label}</div>
                      <div className="opt-sub">
                        {o.pick ? 'Pick a specific weapon below' : o.items.map((it) => `${it.name}${it.qty && it.qty > 1 ? ` ×${it.qty}` : ''}`).join(', ')}
                      </div>
                    </button>
                  ))}
                </div>
                {selectedOpt?.pick && (
                  <select
                    className="wz-select"
                    value={equipPicks[ch.id] ?? ''}
                    onChange={(e) => setEquipPicks({ ...equipPicks, [ch.id]: e.target.value })}
                  >
                    <option value="">choose a {selectedOpt.pick.category} weapon…</option>
                    {(selectedOpt.pick.category === 'simple' ? SIMPLE_WEAPONS : WEAPONS).map((w) => (
                      <option key={w.key} value={w.key}>{w.name} ({w.damage} {w.damageType})</option>
                    ))}
                  </select>
                )}
              </div>
            )
          })}

          <div className="choice-row">
            <span className="c-label">Artisan's tools — choose a set</span>
            <span className="c-help">The Savant grants proficiency with one set of artisan's tools.</span>
            <select className="wz-select" value={artisanTool} onChange={(e) => setArtisanTool(e.target.value)}>
              <option value="">choose…</option>
              {ARTISANS_TOOLS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <p className="small muted mt">
            Always included: {SAVANT_EQUIP_FIXED.map((i) => i.name).join(', ')}. Everything you pick lands in your Inventory.
          </p>
        </div>
      )}

      {step === 5 && background && species && (
        <div className="card">
          <h2>Review</h2>
          <table className="ledger">
            <tbody>
              <tr><td>Name</td><td className="right" style={{ fontWeight: 600 }}>{name}</td></tr>
              <tr><td>Species</td><td className="right">{species.name}{variant && ` — ${variant.name}`} · {size}</td></tr>
              {species.choices?.filter((ch) => ch.kind !== 'size' && speciesChoices[ch.id]).map((ch) => (
                <tr key={ch.id}>
                  <td>{ch.label}</td>
                  <td className="right">
                    {ch.kind === 'originFeat' ? getOriginFeat(speciesChoices[ch.id])?.name
                      : ch.kind === 'spellAbility' ? ABILITY_NAMES[speciesChoices[ch.id] as AbilityKey]
                      : skillName(speciesChoices[ch.id])}
                  </td>
                </tr>
              ))}
              <tr><td>Background</td><td className="right">{background.name} ({getOriginFeat(background.featKey)?.name})</td></tr>
              <tr>
                <td>Abilities</td>
                <td className="right num">
                  {ABILITY_KEYS.map((k) => `${k.toUpperCase()} ${baseAbilities[k] + (backgroundBonuses[k] ?? 0)}`).join(' · ')}
                </td>
              </tr>
              <tr><td>Class skills</td><td className="right">{classSkills.map((sk) => SKILLS.find((x) => x.key === sk)?.name).join(', ')}</td></tr>
              <tr>
                <td>Scholarly Pursuit</td>
                <td className="right">
                  {selectedPursuit?.name}
                  {selectedPursuit?.picks?.length ? ` (${selectedPursuit.picks.map((pk) => pickLabel(pursuitPicks[pk.id] ?? '')).filter(Boolean).join(', ')})` : ''}
                </td>
              </tr>
              <tr>
                <td>Tools</td>
                <td className="right">{[bgToolList ? bgTool : background.tool, artisanTool].filter(Boolean).join(', ')}</td>
              </tr>
              <tr>
                <td>Weapons &amp; gear</td>
                <td className="right">
                  {SAVANT_EQUIP_CHOICES.map((ch) => {
                    const opt = ch.options.find((o) => o.key === equip[ch.id])
                    if (opt?.pick) return WEAPONS.find((w) => w.key === equipPicks[ch.id])?.name
                    return opt?.items.map((it) => it.name).join(' + ')
                  }).filter(Boolean).join(', ')}, {SAVANT_EQUIP_FIXED.map((i) => i.name).join(', ')}
                </td>
              </tr>
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
