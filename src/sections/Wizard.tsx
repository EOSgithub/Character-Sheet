import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, newId } from '../state/store'
import type { AbilityKey, Character, InventoryItem } from '../types'
import { ABILITY_KEYS, ABILITY_NAMES, SKILLS } from '../types'
import { SPECIES, defaultSize } from '../data/species'
import type { SpeciesDef } from '../data/species'
import { BACKGROUNDS, ORIGIN_FEATS, getOriginFeat } from '../data/backgrounds'
import { PURSUITS, SAVANT_SKILL_LIST, SAVANT_EQUIP_CHOICES, SAVANT_EQUIP_FIXED } from '../data/savant'
import { WEAPONS } from '../data/weapons'
import { ALL_TOOLS, ARTISANS_TOOLS, GAMING_SETS, INSTRUMENTS, bucketPicks } from '../data/lists'
import { derive, mod, fmt } from '../rules/derive'
import { PageHead, Stepper } from './shared'
import { PickRows, pickLabel } from './picks'

const skillName = (k: string) => SKILLS.find((s) => s.key === k)?.name ?? k
const SIMPLE_WEAPONS = WEAPONS.filter((w) => w.category.startsWith('Simple'))

/** The list a background's "of your choice" tool draws from, keyed off its label. */
function toolChoiceList(tool: string): string[] | null {
  if (!/choice|one of|\(one/i.test(tool)) return null
  if (/gaming/i.test(tool)) return GAMING_SETS
  if (/instrument/i.test(tool)) return INSTRUMENTS
  if (/artisan/i.test(tool)) return ARTISANS_TOOLS
  return ALL_TOOLS
}

/** Non-collapsible feature-style block used in the wizard detail panels. */
function Trait({ name, tag, text }: { name?: string; tag?: string; text: string }) {
  return (
    <div className="trait">
      {name && <div className="t-name">{name}{tag && <span className="tag">{tag}</span>}</div>}
      <div className="t-text">{text}</div>
    </div>
  )
}

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

  function chooseSpecies(s: SpeciesDef) {
    setSpeciesKey(s.key)
    setSpeciesVariant('')
    setSize(defaultSize(s))
    // pre-seed defaults; skill/originFeat stay empty until picked
    const seeded: Record<string, string> = {}
    for (const ch of s.choices ?? []) {
      if (ch.kind === 'spellAbility') seeded[ch.id] = ch.options?.[0] ?? 'int'
    }
    setSpeciesChoices(seeded)
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
      case 2: return !!background && (bonusMode === '1-1-1' || (!!bonusTwo && !!bonusOne && bonusTwo !== bonusOne)) && (!bgToolList || !!bgTool)
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

    const addItem = (it: { name: string; qty?: number; equipped?: boolean; notes?: string }): InventoryItem =>
      ({ id: newId(), name: it.name, qty: it.qty ?? 1, equipped: it.equipped, notes: it.notes })

    // Build starting inventory from fixed gear + the selected equipment options.
    const startingItems: InventoryItem[] = SAVANT_EQUIP_FIXED.map(addItem)
    if (artisanTool) startingItems.push(addItem({ name: artisanTool, notes: 'artisan tools' }))
    for (const ch of SAVANT_EQUIP_CHOICES) {
      const opt = ch.options.find((o) => o.key === equip[ch.id])
      if (!opt) continue
      if (opt.pick) {
        const w = WEAPONS.find((x) => x.key === equipPicks[ch.id])
        if (w) startingItems.push(addItem({ name: w.name, equipped: opt.pick.equipped }))
      }
      for (const it of opt.items) startingItems.push(addItem(it))
    }

    // Species creation choices: skill grants add to proficiencies, an Origin feat
    // (Human Versatile) is recorded as a level-1 feat.
    const speciesSkillGrants: string[] = []
    let versatileFeat: { name: string; description?: string } | undefined
    for (const ch of species?.choices ?? []) {
      const val = speciesChoices[ch.id]
      if (!val) continue
      if (ch.kind === 'skill') speciesSkillGrants.push(val)
      if (ch.kind === 'originFeat') {
        const feat = getOriginFeat(val)
        if (feat) versatileFeat = { name: feat.name, description: feat.text }
      }
    }

    // Open picks (pursuit + Versatile feat) route to skills / tools / languages.
    const picked = bucketPicks([...Object.values(pursuitPicks), ...Object.values(featPicks)])

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
      choices: { 1: { pursuits: [pursuit], ...(versatileFeat ? { feat: versatileFeat } : {}) } },
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
                onClick={() => chooseSpecies(s)}
              >
                <div className="opt-title">{s.name}</div>
                <div className="opt-sub">{s.size} · Speed {s.speed} ft · {s.traits.map((t) => t.name).join(', ')}</div>
              </button>
            ))}
          </div>

          {species?.variants && (
            <>
              <h3>{species.variantLabel} — choose one</h3>
              <div className="grid cols-3">
                {species.variants.map((v) => (
                  <button
                    key={v.key}
                    className={`opt${speciesVariant === v.key ? ' selected' : ''}`}
                    onClick={() => setSpeciesVariant(v.key)}
                  >
                    <div className="opt-title">{v.name}</div>
                    {v.traits[0] && <div className="opt-sub">{v.traits[0].text}</div>}
                  </button>
                ))}
              </div>
            </>
          )}

          {species?.choices?.map((ch) => (
            <div className="choice-row" key={ch.id}>
              <span className="c-label">{ch.label}</span>
              {ch.help && <span className="c-help">{ch.help}</span>}
              {ch.kind === 'size' || ch.kind === 'spellAbility' ? (
                <div className="row">
                  {(ch.options ?? []).map((opt) => {
                    const isSize = ch.kind === 'size'
                    const selected = isSize ? size === opt : speciesChoices[ch.id] === opt
                    const label = ch.kind === 'spellAbility' ? ABILITY_NAMES[opt as AbilityKey] : opt
                    return (
                      <button
                        key={opt}
                        className={`chip${selected ? ' on' : ''}`}
                        style={{ minHeight: 44 }}
                        onClick={() => isSize ? setSize(opt) : setSpeciesChoices({ ...speciesChoices, [ch.id]: opt })}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <select
                  className="wz-select"
                  value={speciesChoices[ch.id] ?? ''}
                  onChange={(e) => { setSpeciesChoices({ ...speciesChoices, [ch.id]: e.target.value }); if (ch.kind === 'originFeat') setFeatPicks({}) }}
                >
                  <option value="">choose…</option>
                  {ch.kind === 'originFeat'
                    ? ORIGIN_FEATS.map((f) => <option key={f.key} value={f.key}>{f.name}</option>)
                    : (ch.options ?? SKILLS.map((s) => s.key)).map((sk) => <option key={sk} value={sk}>{skillName(sk)}</option>)}
                </select>
              )}
            </div>
          ))}

          {versatileFeat?.picks && (
            <>
              <h3 style={{ marginTop: 22 }}>{versatileFeat.name} — choose your proficiencies</h3>
              <PickRows picks={versatileFeat.picks} values={featPicks} onChange={(id, v) => setFeatPicks({ ...featPicks, [id]: v })} />
            </>
          )}

          {species && (
            <div className="info-panel">
              <h4>{species.name} traits</h4>
              <p className="lede">
                Size {size || species.size} · Speed {species.speed} ft
                {variant ? ` · ${variant.name}` : ''}
              </p>
              {species.traits.map((t) => <Trait key={t.name} name={t.name} text={t.text} />)}
              {variant?.traits.map((t) => <Trait key={t.name} name={t.name} tag={variant.name} text={t.text} />)}
              {(() => {
                const featChoice = species.choices?.find((c) => c.kind === 'originFeat')
                const featKey = featChoice ? speciesChoices[featChoice.id] : undefined
                const feat = featKey ? getOriginFeat(featKey) : undefined
                return feat ? <Trait name={feat.name} tag="Origin feat" text={feat.text} /> : null
              })()}
            </div>
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
                onClick={() => { setBackgroundKey(b.key); setBonusTwo(''); setBonusOne(''); setBgTool('') }}
              >
                <div className="opt-title">{b.name}</div>
                <div className="opt-sub">
                  {b.abilities.map((a) => a.toUpperCase()).join(' / ')} · {getOriginFeat(b.featKey)?.name} · {b.skills.map((s) => SKILLS.find((x) => x.key === s)?.name).join(', ')}
                </div>
              </button>
            ))}
          </div>
          {background && (
            <div className="info-panel">
              <h4>{background.name}</h4>
              <p className="lede">{background.blurb}</p>
              {(() => { const f = getOriginFeat(background.featKey); return f ? <Trait name={f.name} tag="Origin feat" text={f.text} /> : null })()}
              <Trait name="Skill proficiencies" text={background.skills.map(skillName).join(', ')} />
              {bgToolList ? (
                <div className="trait">
                  <div className="t-name">Tool proficiency <span className="tag">choose one</span></div>
                  <div className="t-text">{background.tool}</div>
                  <select className="wz-select" style={{ marginTop: 8 }} value={bgTool} onChange={(e) => setBgTool(e.target.value)}>
                    <option value="">choose…</option>
                    {bgToolList.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              ) : (
                <Trait name="Tool proficiency" text={background.tool} />
              )}
              <Trait name="Starting equipment" text={background.equipment} />
            </div>
          )}

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
              <button key={p.key} className={`opt${pursuit === p.key ? ' selected' : ''}`} onClick={() => { setPursuit(p.key); setPursuitPicks({}) }}>
                <div className="opt-title">{p.name}</div>
                <div className="opt-sub">{p.text.split('. ')[0]}.</div>
              </button>
            ))}
          </div>
          {pursuit && (() => {
            const p = level1Pursuits.find((x) => x.key === pursuit)
            return p ? (
              <div className="info-panel">
                <h4>{p.name}</h4>
                {p.grantsSkill && <p className="lede">Grants proficiency in {skillName(p.grantsSkill)}.</p>}
                <Trait text={p.text} />
                {p.picks && <PickRows picks={p.picks} values={pursuitPicks} onChange={(id, v) => setPursuitPicks({ ...pursuitPicks, [id]: v })} />}
              </div>
            ) : null
          })()}

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
