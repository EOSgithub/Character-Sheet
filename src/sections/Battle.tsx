import { useState } from 'react'
import { useStore } from '../state/store'
import { derive, fmt } from '../rules/derive'
import { ARMORS, CONDITIONS, FOCUS_CLUES } from '../types'
import type { Attack } from '../types'
import { newId } from '../state/store'
import { deriveResources, applyShortRest, applyLongRest } from '../rules/resources'
import { WEAPONS, MASTERIES, getWeapon, savantProficientWith, defaultAbility } from '../data/weapons'
import { NoCharacter, PageHead, Stepper } from './shared'
import CharacterBand, { Reticle } from './CharacterBand'

export default function Battle() {
  const { active, updateCharacter } = useStore()
  const [dmg, setDmg] = useState('')
  if (!active) return <><PageHead title="Battle Mode" /><NoCharacter /></>
  const d = derive(active)
  const c = active

  function setHP(v: number) {
    updateCharacter(c.id, { currentHP: Math.max(0, Math.min(d.maxHP, v)) })
  }

  function applyDamage(sign: 1 | -1) {
    const n = parseInt(dmg, 10)
    if (!Number.isFinite(n) || n <= 0) return
    if (sign === 1) {
      // damage eats temp HP first
      const fromTemp = Math.min(c.tempHP, n)
      const rest = n - fromTemp
      updateCharacter(c.id, { tempHP: c.tempHP - fromTemp, currentHP: Math.max(0, c.currentHP - rest) })
    } else {
      setHP(c.currentHP + n)
    }
    setDmg('')
  }

  const hpPct = d.maxHP > 0 ? (c.currentHP / d.maxHP) * 100 : 0

  return (
    <>
      <CharacterBand section="Battle Mode" />

      <div className="grid cols-2">
        {/* ------------------------------ HP ------------------------------- */}
        <div className="card">
          <h2>Hit points</h2>
          <div className="row between">
            <span className="hp-numbers" style={{ color: hpPct <= 25 ? 'var(--vermilion)' : undefined }}>
              {c.currentHP}<span className="muted" style={{ fontSize: 20 }}> / {d.maxHP}</span>
            </span>
            <span className="row small muted">
              Temp
              <Stepper value={c.tempHP} onChange={(v) => updateCharacter(c.id, { tempHP: v })} />
            </span>
          </div>
          <div className={`hp-bar mt${hpPct <= 25 ? ' low' : ''}`}>
            <div style={{ width: `${hpPct}%` }} />
          </div>
          <div className="row mt">
            <input
              inputMode="numeric"
              placeholder="Amount"
              value={dmg}
              onChange={(e) => setDmg(e.target.value.replace(/\D/g, ''))}
              style={{ width: 110, minHeight: 44, border: '1px solid var(--rule-strong)', borderRadius: 6, padding: '4px 12px', background: '#fff' }}
            />
            <button className="btn" style={{ color: 'var(--vermilion)' }} onClick={() => applyDamage(1)}>Damage</button>
            <button className="btn" style={{ color: 'var(--moss)' }} onClick={() => applyDamage(-1)}>Heal</button>
            <span className="spacer" />
            <span className="small muted num">Hit dice {d.hitDiceTotal - c.hitDiceSpent}/{d.hitDiceTotal} (d8)</span>
            <button className="btn small" disabled={c.hitDiceSpent >= d.hitDiceTotal} onClick={() => updateCharacter(c.id, { hitDiceSpent: c.hitDiceSpent + 1 })}>Spend</button>
            <button className="btn small" disabled={c.hitDiceSpent <= 0} onClick={() => updateCharacter(c.id, { hitDiceSpent: c.hitDiceSpent - 1 })}>Regain</button>
          </div>
          {c.currentHP === 0 && (
            <>
              <hr className="rule" />
              <div className="row">
                <span className="eyebrow">Death saves</span>
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
              </div>
            </>
          )}
        </div>

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
          <p className="small muted mt">Predictive Defense: AC uses the better of DEX or INT in light/medium armor or unarmored.</p>
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
            <>
              <hr className="rule" />
              <div className="row">
                <span className="eyebrow">Reactions this round</span>
                <span className="row" style={{ gap: 6 }}>
                  {Array.from({ length: d.reactions }, (_, i) => (
                    <button
                      key={i}
                      className={`chip vermilion${c.reactionsUsed > i ? ' on' : ''}`}
                      style={{ minHeight: 40 }}
                      onClick={() => updateCharacter(c.id, { reactionsUsed: c.reactionsUsed > i ? i : i + 1 })}
                    >
                      {i + 1}
                    </button>
                  ))}
                </span>
                <button className="btn small" onClick={() => updateCharacter(c.id, { reactionsUsed: 0 })}>New round</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* --------------------------- rests & uses --------------------------- */}
      <div className="grid cols-2 mt">
        <RestCard />
        <ResourcesCard />
      </div>

      {/* ------------------------------ Focus ------------------------------ */}
      <FocusPanel />

      {/* ----------------------------- attacks ----------------------------- */}
      <AttacksCard />

      {/* ---------------------------- conditions ---------------------------- */}
      <div className="card mt">
        <h2>Conditions</h2>
        <div className="row">
          {CONDITIONS.map((cond) => {
            const on = c.conditions.includes(cond)
            return (
              <button
                key={cond}
                className={`chip vermilion${on ? ' on' : ''}`}
                style={{ minHeight: 40, textTransform: 'capitalize' }}
                onClick={() =>
                  updateCharacter(c.id, {
                    conditions: on ? c.conditions.filter((x) => x !== cond) : [...c.conditions, cond],
                  })
                }
              >
                {cond}
              </button>
            )
          })}
          <span className="chip" style={{ minHeight: 40 }}>
            Exhaustion
            <Stepper value={c.exhaustion} onChange={(v) => updateCharacter(c.id, { exhaustion: v })} min={0} max={6} />
          </span>
        </div>
      </div>
    </>
  )
}

/** Short and long rests, automated per the 2024 rules. */
function RestCard() {
  const { active, updateCharacter } = useStore()
  const [dieRoll, setDieRoll] = useState('')
  if (!active) return null
  const c = active
  const d = derive(c)
  const defs = deriveResources(c, d)
  const diceLeft = d.hitDiceTotal - c.hitDiceSpent

  function spendDie(roll: number) {
    if (diceLeft <= 0) return
    const healed = Math.max(1, roll + d.mods.con)
    updateCharacter(c.id, {
      hitDiceSpent: c.hitDiceSpent + 1,
      currentHP: Math.min(d.maxHP, c.currentHP + healed),
    })
    setDieRoll('')
  }

  function finishShortRest() {
    updateCharacter(c.id, applyShortRest(c, defs))
  }

  function longRest() {
    if (confirm('Finish a long rest? HP and Hit Dice are fully restored, temp HP is lost, exhaustion drops by 1, and all per-rest uses reset.')) {
      updateCharacter(c.id, applyLongRest(c, d))
    }
  }

  const shortRestHints: string[] = []
  if (d.disciplineKey === 'culinarian' && c.level >= 3) shortRestHints.push('Student of Flavor: each spent Hit Die also heals +1 Intellect Die roll (add it to the roll you enter).')
  if (d.disciplineKey === 'mentor' && c.level >= 6) shortRestHints.push('Soothing Presence: advantage on Hit Die rolls; allies gain temp HP equal to your Savant level.')

  return (
    <div className="card">
      <h2>Rest</h2>
      <div className="eyebrow">Short rest · spend Hit Dice</div>
      <div className="row mt" style={{ marginTop: 8 }}>
        <span className="small muted num">d8 × {diceLeft} left</span>
        <input
          inputMode="numeric"
          placeholder="d8 roll"
          value={dieRoll}
          onChange={(e) => setDieRoll(e.target.value.replace(/\D/g, ''))}
          style={{ width: 90, minHeight: 44, border: '1px solid var(--rule-strong)', borderRadius: 6, padding: '4px 12px', background: '#fff' }}
        />
        <button
          className="btn small"
          disabled={diceLeft <= 0 || !(parseInt(dieRoll, 10) >= 1 && parseInt(dieRoll, 10) <= 8)}
          onClick={() => spendDie(parseInt(dieRoll, 10))}
        >
          Spend & heal
        </button>
        <button className="btn small" disabled={diceLeft <= 0} onClick={() => spendDie(5)}>
          Average (5)
        </button>
      </div>
      <p className="small muted" style={{ marginBottom: 0 }}>Each die heals its roll {fmt(d.mods.con)} (CON).</p>
      {shortRestHints.map((h) => <p key={h} className="small muted" style={{ marginBottom: 0 }}>{h}</p>)}
      <hr className="rule" />
      <div className="row">
        <button className="btn" onClick={finishShortRest}>Finish short rest</button>
        <button className="btn primary" onClick={longRest}>Long rest</button>
      </div>
      <p className="small muted" style={{ marginBottom: 0 }}>
        Short rest restores short-rest uses. Long rest restores all HP, Hit Dice, and uses; temp HP is lost; exhaustion −1.
      </p>
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
            return (
              <tr key={r.key}>
                <td>
                  <div style={{ fontWeight: 600 }}>{r.name}</div>
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
            <div className="eyebrow row" style={{ gap: 7 }}><Reticle className="focus-reticle" /> Adroit Analysis</div>
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
        <div className="eyebrow row" style={{ gap: 7, color: 'var(--prussian)' }}><Reticle className="focus-reticle" /> Adroit Analysis · Focus</div>
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
  if (!active) return null
  const c = active
  const d = derive(c)
  const isTactician = d.disciplineKey === 'tactician' && c.level >= 3

  function addAttack() {
    const a: Attack = { id: newId(), name: 'New attack', ability: 'int', proficient: true, damage: '1d6', damageType: 'piercing' }
    updateCharacter(c.id, { attacks: [...c.attacks, a] })
  }

  function addWeapon(key: string) {
    const w = getWeapon(key)
    if (!w) return
    const a: Attack = {
      id: newId(),
      name: w.name,
      ability: defaultAbility(w),
      proficient: savantProficientWith(w, isTactician),
      damage: w.damage,
      damageType: w.damageType,
      range: w.range,
      weaponKey: w.key,
    }
    updateCharacter(c.id, { attacks: [...c.attacks, a] })
  }

  function patchAttack(id: string, patch: Partial<Attack>) {
    updateCharacter(c.id, { attacks: c.attacks.map((a) => (a.id === id ? { ...a, ...patch } : a)) })
  }

  const masteriesInPlay = [...new Set(c.attacks.map((a) => getWeapon(a.weaponKey)?.mastery).filter((m) => m !== undefined))]

  return (
    <div className="card mt">
      <div className="row between">
        <h2 style={{ margin: 0 }}>Attacks</h2>
        <span className="row">
          <select
            value=""
            aria-label="Add weapon from the 2024 weapon table"
            onChange={(e) => { if (e.target.value) addWeapon(e.target.value) }}
            style={{ minHeight: 40, maxWidth: 220, border: '1px solid var(--rule-strong)', borderRadius: 6, background: 'var(--paper-raised)' }}
          >
            <option value="">Add weapon…</option>
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
          <button className="btn small" onClick={addAttack}>Custom</button>
        </span>
      </div>
      {c.attacks.length === 0 ? (
        <p className="muted small mt">No attacks recorded. Pick a weapon from the 2024 table (damage, properties, and mastery fill in automatically) or add a custom attack. Remember: against your Focus you can use INT.</p>
      ) : (
        <table className="ledger mt">
          <thead>
            <tr><th>Name</th><th>Ability</th><th className="right">To hit</th><th>Damage</th><th></th></tr>
          </thead>
          <tbody>
            {c.attacks.map((a) => {
              const toHit = d.mods[a.ability] + (a.proficient ? d.pb : 0)
              const dmgMod = d.mods[a.ability]
              const w = getWeapon(a.weaponKey)
              return (
                <tr key={a.id}>
                  <td>
                    <input
                      value={a.name}
                      onChange={(e) => patchAttack(a.id, { name: e.target.value })}
                      style={{ border: 'none', background: 'transparent', width: '100%', minHeight: 36, fontWeight: 600 }}
                    />
                    {w && (
                      <div className="small muted">
                        <span className="die-chip" style={{ fontSize: 11, padding: '1px 8px', marginRight: 6 }}>{MASTERIES[w.mastery].name}</span>
                        {w.properties.join(', ') || '—'}
                      </div>
                    )}
                  </td>
                  <td>
                    <select value={a.ability} onChange={(e) => patchAttack(a.id, { ability: e.target.value as Attack['ability'] })} style={{ minHeight: 36 }}>
                      <option value="str">STR</option><option value="dex">DEX</option><option value="int">INT</option>
                    </select>
                  </td>
                  <td className="num right" style={{ fontSize: 18 }}>{fmt(toHit)}</td>
                  <td>
                    <span className="row" style={{ gap: 6 }}>
                      <input
                        value={a.damage}
                        onChange={(e) => patchAttack(a.id, { damage: e.target.value })}
                        style={{ border: '1px solid var(--rule)', borderRadius: 4, width: 70, minHeight: 36, textAlign: 'center', fontFamily: 'var(--font-mono)' }}
                      />
                      <span className="num">{fmt(dmgMod)}</span>
                      <input
                        value={a.damageType}
                        onChange={(e) => patchAttack(a.id, { damageType: e.target.value })}
                        style={{ border: 'none', background: 'transparent', width: 90, minHeight: 36, color: 'var(--graphite)' }}
                      />
                    </span>
                  </td>
                  <td className="right">
                    <button className="btn small danger" onClick={() => updateCharacter(c.id, { attacks: c.attacks.filter((x) => x.id !== a.id) })}>✕</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      {masteriesInPlay.length > 0 && (
        <>
          <hr className="rule" />
          <div className="eyebrow">Weapon masteries in play</div>
          {masteriesInPlay.map((m) => (
            <details key={m} className="feature">
              <summary><span className="f-name" style={{ fontSize: 15 }}>{MASTERIES[m!].name}</span></summary>
              <div className="f-text">{MASTERIES[m!].text}</div>
            </details>
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
