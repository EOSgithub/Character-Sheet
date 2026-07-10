import { useState } from 'react'
import { useStore } from '../state/store'
import { derive, fmt } from '../rules/derive'
import { ARMORS, CONDITIONS, FOCUS_CLUES } from '../types'
import type { Attack } from '../types'
import { newId } from '../state/store'
import { deriveResources } from '../rules/resources'
import { WEAPONS, MASTERIES, getWeapon, savantProficientWith, defaultAbility } from '../data/weapons'
import { Stepper } from './shared'
import { Reticle } from './CharacterBand'
import FeatureRow from './FeatureRow'
import Modal from './Modal'
import { TermLink, useRules } from './rules'
import { findEntryByName } from '../rules/lexicon'
import type { AbilityKey } from '../types'

export default function Battle() {
  const { active, updateCharacter } = useStore()
  if (!active) return null
  const d = derive(active)
  const c = active

  return (
    <>
      {/* HP lives in the character band above; death saves surface only at 0 HP. */}
      {c.currentHP === 0 && <DeathSavesCard />}

      <div className="grid cols-2">
        {/* ------------------------- defenses ------------------------------ */}
        <div className="card">
          <h2>Defenses</h2>
          <div className="row">
            <div className="field" style={{ flex: 1 }}>
              <label>Armor worn</label>
              <select value={c.armor} onChange={(e) => updateCharacter(c.id, { armor: e.target.value as typeof c.armor })}>
                {ARMORS.map((a) => <option key={a.key} value={a.key}>{a.name}</option>)}
              </select>
            </div>
            <label className="chip" style={{ minHeight: 44, alignSelf: 'flex-end', cursor: 'pointer' }}>
              <input type="checkbox" checked={c.shield} onChange={(e) => updateCharacter(c.id, { shield: e.target.checked })} />
              Shield (+2)
            </label>
          </div>
          <p className="small muted mt"><TermLink name="Predictive Defense" />: AC uses the better of DEX or INT in light/medium armor or unarmored.</p>
          <div className="row mt">
            <button
              className={`chip${c.heroicInspiration ? ' on' : ''}`}
              style={{ minHeight: 40 }}
              onClick={() => updateCharacter(c.id, { heroicInspiration: !c.heroicInspiration })}
            >
              {c.heroicInspiration ? '★' : '☆'} Heroic Inspiration
            </button>
          </div>
          {d.reactions > 1 && (
            <p className="small muted" style={{ marginBottom: 0 }}>
              <TermLink name="Swift Reflexes" />: {d.reactions} reactions per round, one per trigger.
            </p>
          )}
        </div>

        {/* ------------------------- feature uses -------------------------- */}
        <ResourcesCard />
      </div>

      {/* ------------------------------ Focus ------------------------------ */}
      <FocusPanel />

      {/* ----------------------------- attacks ----------------------------- */}
      <AttacksCard />

      {/* ---------------------------- conditions ---------------------------- */}
      <ConditionsCard />
    </>
  )
}

/** Condition toggles — the main area of each chip toggles the condition, the
 *  trailing "i" opens its rules text. Active conditions and exhaustion feed
 *  back into derived stats (e.g. Speed). */
function ConditionsCard() {
  const { active, updateCharacter } = useStore()
  const { open } = useRules()
  if (!active) return null
  const c = active

  return (
    <div className="card mt">
      <h2>Conditions</h2>
      <div className="row">
        {CONDITIONS.map((cond) => {
          const on = c.conditions.includes(cond)
          return (
            <span key={cond} className={`chip vermilion split${on ? ' on' : ''}`} style={{ minHeight: 40 }}>
              <button
                className="chip-main"
                style={{ textTransform: 'capitalize' }}
                onClick={() =>
                  updateCharacter(c.id, {
                    conditions: on ? c.conditions.filter((x) => x !== cond) : [...c.conditions, cond],
                  })
                }
              >
                {cond}
              </button>
              <button className="chip-info" aria-label={`Rules for ${cond}`} onClick={() => open(`condition:${cond}`)}>i</button>
            </span>
          )
        })}
        <span className="chip" style={{ minHeight: 40 }}>
          <TermLink name="Exhaustion" />
          <Stepper value={c.exhaustion} onChange={(v) => updateCharacter(c.id, { exhaustion: v })} min={0} max={6} />
        </span>
      </div>
    </div>
  )
}

/** Death saves — surfaces only while the character is at 0 HP. */
function DeathSavesCard() {
  const { active, updateCharacter } = useStore()
  if (!active) return null
  const c = active

  return (
    <div className="card" style={{ borderColor: 'var(--vermilion)', marginBottom: 18 }}>
      <div className="row">
        <span className="eyebrow" style={{ color: 'var(--vermilion)' }}>Death saves</span>
        <span className="row" style={{ gap: 6 }}>
          {[1, 2, 3].map((i) => (
            <button
              key={`s${i}`}
              className={`death-dot${c.deathSaves.successes >= i ? ' on success' : ''}`}
              aria-label={`success ${i}`}
              onClick={() => updateCharacter(c.id, { deathSaves: { ...c.deathSaves, successes: c.deathSaves.successes >= i ? i - 1 : i } })}
            />
          ))}
        </span>
        <span className="small muted">successes</span>
        <span className="row" style={{ gap: 6 }}>
          {[1, 2, 3].map((i) => (
            <button
              key={`f${i}`}
              className={`death-dot${c.deathSaves.failures >= i ? ' on failure' : ''}`}
              aria-label={`failure ${i}`}
              onClick={() => updateCharacter(c.id, { deathSaves: { ...c.deathSaves, failures: c.deathSaves.failures >= i ? i - 1 : i } })}
            />
          ))}
        </span>
        <span className="small muted">failures</span>
        <span className="spacer" />
        <span className="small muted">Heal or stabilise to clear — set HP above 0 in the band.</span>
      </div>
    </div>
  )
}

/** Per-rest feature uses, derived from class, discipline, species, and feats. */
function ResourcesCard() {
  const { active, updateCharacter } = useStore()
  if (!active) return null
  const c = active
  const d = derive(c)
  const defs = deriveResources(c, d)

  if (defs.length === 0) {
    return (
      <div className="card">
        <h2>Feature uses</h2>
        <p className="muted small">Nothing to track yet — per-rest uses from your class, discipline, species, and feats will appear here as you gain them.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2>Feature uses</h2>
      <table className="ledger">
        <tbody>
          {defs.map((r) => {
            const used = Math.min(c.resourceUses[r.key] ?? 0, r.max)
            const entry = findEntryByName(r.name)
            return (
              <tr key={r.key}>
                <td>
                  <div style={{ fontWeight: 600 }}>
                    {entry ? <TermLink name={r.name}>{r.name}</TermLink> : r.name}
                  </div>
                  <div className="small muted">{r.source} · per {r.recharge} rest</div>
                </td>
                <td className="right">
                  <span className="row" style={{ gap: 5, justifyContent: 'flex-end' }}>
                    {Array.from({ length: r.max }, (_, i) => (
                      <button
                        key={i}
                        className={`chip${used > i ? ' on' : ''}`}
                        style={{ minHeight: 36, minWidth: 36, padding: '2px 8px', justifyContent: 'center' }}
                        aria-label={`${r.name} use ${i + 1}`}
                        onClick={() =>
                          updateCharacter(c.id, {
                            resourceUses: { ...c.resourceUses, [r.key]: used > i ? i : i + 1 },
                          })
                        }
                      >
                        {used > i ? '●' : '○'}
                      </button>
                    ))}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** Adroit Analysis tracker — the Savant's signature. */
function FocusPanel() {
  const { active, updateCharacter } = useStore()
  if (!active) return null
  const c = active
  const d = derive(c)
  const f = c.focus

  if (!f.active) {
    return (
      <div className="focus-panel idle mt">
        <div className="row between">
          <div>
            <div className="eyebrow row" style={{ gap: 7 }}><Reticle className="focus-reticle" /> <TermLink name="Adroit Analysis">Adroit Analysis</TermLink></div>
            <strong>No Focus designated.</strong>{' '}
            <span className="muted small">Bonus action: analyze a creature you can see within 60 ft.</span>
          </div>
          <button
            className="btn primary"
            onClick={() => updateCharacter(c.id, { focus: { active: true, name: '', clues: [], notes: '' } })}
          >
            Designate Focus
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="focus-panel mt">
      <div className="row between">
        <div className="eyebrow row" style={{ gap: 7, color: 'var(--prussian)' }}><Reticle className="focus-reticle" /> <TermLink name="Adroit Analysis">Adroit Analysis</TermLink> · Focus</div>
        <button className="btn small" onClick={() => updateCharacter(c.id, { focus: { active: false, name: '', clues: [], notes: '' } })}>
          End Focus
        </button>
      </div>
      <div className="row mt" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 260px' }}>
          <div className="field">
            <label>Target</label>
            <input
              value={f.name}
              placeholder="Name the creature"
              onChange={(e) => updateCharacter(c.id, { focus: { ...f, name: e.target.value } })}
            />
          </div>
          <div className="field mt">
            <label>Observations</label>
            <textarea
              value={f.notes}
              placeholder="AC 15, fast, smells of sulfur…"
              onChange={(e) => updateCharacter(c.id, { focus: { ...f, notes: e.target.value } })}
            />
          </div>
        </div>
        <div style={{ flex: '1 1 260px' }}>
          <div className="eyebrow">Characteristics learned</div>
          {FOCUS_CLUES.map((clue) => {
            const learned = f.clues.includes(clue)
            return (
              <button
                key={clue}
                className={`focus-clue${learned ? ' learned' : ''}`}
                onClick={() =>
                  updateCharacter(c.id, {
                    focus: { ...f, clues: learned ? f.clues.filter((x) => x !== clue) : [...f.clues, clue] },
                  })
                }
              >
                <span className="box">{learned ? '✓' : ''}</span>
                {clue}
              </button>
            )
          })}
        </div>
      </div>
      <hr className="rule" />
      <p className="small" style={{ margin: 0 }}>
        Against your Focus: attack &amp; damage with <strong>INT {fmt(d.mods.int)}</strong> ·{' '}
        <strong>+{d.intellectDie ? `1d${d.intellectDie}` : '1d6'}</strong> bonus damage once per turn ·
        its attacks against you have <strong>disadvantage</strong>. No concentration while focused.
      </p>
    </div>
  )
}

function AttacksCard() {
  const { active, updateCharacter } = useStore()
  const [editing, setEditing] = useState<Attack | 'new' | null>(null)
  if (!active) return null
  const c = active
  const d = derive(c)
  const isTactician = d.disciplineKey === 'tactician' && c.level >= 3

  function saveAttack(a: Attack) {
    const exists = c.attacks.some((x) => x.id === a.id)
    updateCharacter(c.id, { attacks: exists ? c.attacks.map((x) => (x.id === a.id ? a : x)) : [...c.attacks, a] })
    setEditing(null)
  }
  function removeAttack(id: string) {
    updateCharacter(c.id, { attacks: c.attacks.filter((x) => x.id !== id) })
    setEditing(null)
  }

  const masteriesInPlay = [...new Set(c.attacks.map((a) => getWeapon(a.weaponKey)?.mastery).filter((m) => m !== undefined))]

  return (
    <div className="card mt">
      <div className="row between">
        <h2 style={{ margin: 0 }}>Attacks</h2>
        <button className="btn small primary" onClick={() => setEditing('new')}>+ Add attack</button>
      </div>
      {c.attacks.length === 0 ? (
        <div className="empty" style={{ padding: '28px 20px' }}>
          <p style={{ marginBottom: 14 }}>No attacks yet. Add one from the 2024 weapon table — damage, properties, and mastery fill in automatically — or build a custom attack. Against your Focus you can attack with INT.</p>
          <button className="btn primary" onClick={() => setEditing('new')}>Add an attack</button>
        </div>
      ) : (
        <div className="mt">
          {c.attacks.map((a) => {
            const toHit = d.mods[a.ability] + (a.proficient ? d.pb : 0)
            const dmgMod = d.mods[a.ability]
            const w = getWeapon(a.weaponKey)
            return (
              <button key={a.id} className="atk-row" onClick={() => setEditing(a)}>
                <span className="nm">
                  <span className="t">{a.name}{!a.proficient && <span className="tag">not proficient</span>}</span>
                  <span className="s">
                    {w ? `${MASTERIES[w.mastery].name}${w.properties.length ? ' · ' + w.properties.join(', ') : ''}` : (a.range ? `Range ${a.range}` : 'Custom attack')}
                  </span>
                </span>
                <span className="abil">{a.ability.toUpperCase()}</span>
                <span className="hit"><span className="lbl">Hit</span>{fmt(toHit)}</span>
                <span className="dmg">{a.damage} {fmt(dmgMod)} {a.damageType}</span>
              </button>
            )
          })}
        </div>
      )}
      {editing && (
        <AttackModal
          attack={editing === 'new' ? null : editing}
          isTactician={isTactician}
          mods={d.mods}
          pb={d.pb}
          onSave={saveAttack}
          onDelete={editing !== 'new' ? () => removeAttack((editing as Attack).id) : undefined}
          onClose={() => setEditing(null)}
        />
      )}
      {masteriesInPlay.length > 0 && (
        <>
          <hr className="rule" />
          <div className="eyebrow">Weapon masteries in play</div>
          {masteriesInPlay.map((m) => (
            <FeatureRow key={m} name={MASTERIES[m!].name} meta="Mastery" text={MASTERIES[m!].text} />
          ))}
          <p className="small muted" style={{ marginBottom: 0 }}>
            Mastery properties normally require a class feature that unlocks them (the Savant as written predates
            them) — check with your DM whether they apply.
          </p>
        </>
      )}
    </div>
  )
}

const ABILS: AbilityKey[] = ['str', 'dex', 'int']

/** Add or edit an attack — prefill from the 2024 weapon table, or go custom. */
function AttackModal({ attack, isTactician, mods, pb, onSave, onDelete, onClose }: {
  attack: Attack | null
  isTactician: boolean
  mods: Record<AbilityKey, number>
  pb: number
  onSave: (a: Attack) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState<Attack>(
    attack ?? { id: newId(), name: '', ability: 'int', proficient: true, damage: '1d6', damageType: 'piercing' },
  )
  const set = (patch: Partial<Attack>) => setDraft((a) => ({ ...a, ...patch }))

  function pickWeapon(key: string) {
    const w = getWeapon(key)
    if (!w) return
    set({
      name: w.name, ability: defaultAbility(w), proficient: savantProficientWith(w, isTactician),
      damage: w.damage, damageType: w.damageType, range: w.range, weaponKey: w.key,
    })
  }

  const toHit = mods[draft.ability] + (draft.proficient ? pb : 0)
  const canSave = draft.name.trim().length > 0

  return (
    <Modal
      open
      onClose={onClose}
      title={attack ? 'Edit attack' : 'Add attack'}
      subtitle="Pick a weapon to fill everything in, or enter a custom attack."
      footer={
        <>
          {onDelete && <button className="btn danger" onClick={onDelete}>Delete</button>}
          <span className="spacer" />
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!canSave} onClick={() => onSave({ ...draft, name: draft.name.trim() })}>
            {attack ? 'Save changes' : 'Add attack'}
          </button>
        </>
      }
    >
      <div className="field">
        <label>From the 2024 weapon table</label>
        <select className="wz-select" value={draft.weaponKey ?? ''} onChange={(e) => e.target.value ? pickWeapon(e.target.value) : set({ weaponKey: undefined })} style={{ maxWidth: 'none' }}>
          <option value="">Custom attack…</option>
          {(['Simple Melee', 'Simple Ranged', 'Martial Melee', 'Martial Ranged'] as const).map((cat) => (
            <optgroup key={cat} label={cat}>
              {WEAPONS.filter((w) => w.category === cat).map((w) => (
                <option key={w.key} value={w.key}>
                  {w.name} ({w.damage}, {MASTERIES[w.mastery].name}){savantProficientWith(w, isTactician) ? '' : ' — not proficient'}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Name</label>
        <input value={draft.name} placeholder="e.g. Rapier, Dagger…" onChange={(e) => set({ name: e.target.value, weaponKey: undefined })} />
      </div>

      <div className="field">
        <label>Attack ability</label>
        <div className="row" style={{ gap: 7 }}>
          {ABILS.map((k) => (
            <button key={k} className={`chip${draft.ability === k ? ' on' : ''}`} style={{ minHeight: 40 }} onClick={() => set({ ability: k })}>
              {k.toUpperCase()} {fmt(mods[k])}
            </button>
          ))}
          <button className={`chip${draft.proficient ? ' on' : ''}`} style={{ minHeight: 40 }} onClick={() => set({ proficient: !draft.proficient })}>
            {draft.proficient ? '✓ ' : ''}Proficient
          </button>
        </div>
      </div>

      <div className="row" style={{ gap: 16, marginTop: 14 }}>
        <div className="field" style={{ flex: 1 }}>
          <label>Damage dice</label>
          <input value={draft.damage} placeholder="1d8" onChange={(e) => set({ damage: e.target.value })} style={{ fontFamily: 'var(--font-mono)' }} />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label>Damage type</label>
          <input value={draft.damageType} placeholder="piercing" onChange={(e) => set({ damageType: e.target.value })} />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label>Range</label>
          <input value={draft.range ?? ''} placeholder="—" onChange={(e) => set({ range: e.target.value || undefined })} />
        </div>
      </div>

      <div className="info-panel" style={{ marginTop: 16 }}>
        <span className="num" style={{ fontSize: 17 }}>{fmt(toHit)}</span> <span className="muted small">to hit</span>
        <span className="muted"> · </span>
        <span className="num" style={{ fontSize: 17 }}>{draft.damage} {fmt(mods[draft.ability])}</span> <span className="muted small">{draft.damageType} damage</span>
      </div>
    </Modal>
  )
}
