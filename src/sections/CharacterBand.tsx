import { useState } from 'react'
import { useStore } from '../state/store'
import { derive, fmt } from '../rules/derive'
import { getSpecies } from '../data/species'
import { getBackground } from '../data/backgrounds'
import { getDiscipline } from '../data/savant'
import RestModal from './RestModal'

/** The analysis reticle — the app's recurring motif. */
export function Reticle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="2.1" fill="currentColor" />
      <path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/** Numeric inline editor for the band — the human does the math, this just
 *  records the result. Select-all on focus so typing replaces the value. */
function NumInput({ value, max, className, label, onCommit }: {
  value: number
  max: number
  className: string
  label: string
  onCommit: (v: number) => void
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const shown = draft ?? String(value)
  return (
    <input
      className={className}
      inputMode="numeric"
      aria-label={label}
      value={shown}
      style={{ width: `${Math.max(1, shown.length) + 0.8}ch` }}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => {
        const s = e.target.value.replace(/\D/g, '')
        setDraft(s)
        if (s !== '') onCommit(Math.min(max, parseInt(s, 10)))
      }}
      onBlur={() => {
        if (draft === '') onCommit(0)
        setDraft(null)
      }}
    />
  )
}

/**
 * Persistent identity + vitals header shown atop every character page.
 * Answers "who am I and how am I doing" at a glance, in the instrument
 * language. Current and temp HP are edited here directly; the rest button
 * opens the rest modal.
 */
export default function CharacterBand({ section, action }: { section: string; action?: React.ReactNode }) {
  const { active, updateCharacter } = useStore()
  const [resting, setResting] = useState(false)
  if (!active) return null
  const c = active
  const d = derive(c)
  const species = getSpecies(c.speciesKey)
  const variant = species?.variants?.find((v) => v.key === c.speciesVariant)
  const background = getBackground(c.backgroundKey)
  const discipline = getDiscipline(d.disciplineKey)

  const hpPct = d.maxHP > 0 ? Math.max(0, Math.min(100, (c.currentHP / d.maxHP) * 100)) : 0
  const hpLow = hpPct <= 25

  const identity = [
    species ? species.name + (variant ? ` (${variant.name})` : '') : null,
    background?.name,
    discipline ? discipline.name : 'Savant',
  ].filter(Boolean)

  return (
    <header className="charband">
      <div className="cb-top">
        <div className="cb-id">
          <div className="cb-section"><Reticle /> {section}</div>
          <div className="cb-name">{c.name}</div>
          <div className="cb-meta">
            {identity.map((part, i) => (
              <span key={i}>
                {i > 0 && <span className="dot">·</span>}
                {part}
              </span>
            ))}
          </div>
        </div>
        <div className="cb-actions">
          {action}
          <button className="band-btn" title="Rest" aria-label="Rest" onClick={() => setResting(true)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 13A8.5 8.5 0 1 1 11 4a7 7 0 0 0 9 9Z" />
            </svg>
          </button>
          <div className="crest" title={`Savant level ${c.level}`}>
            <span className="lv">LVL</span>
            <span className="n">{c.level}</span>
          </div>
        </div>
      </div>

      <div className="gauges">
        <div className="gauge hp">
          <span className="g-label">
            Hit points
            <span className="g-temp">
              · temp
              <NumInput
                className="temp-input"
                label="Temporary hit points"
                value={c.tempHP}
                max={999}
                onCommit={(v) => updateCharacter(c.id, { tempHP: v })}
              />
            </span>
          </span>
          <span className={`g-val${hpLow ? ' low' : ''}`}>
            <NumInput
              className="hp-input"
              label="Current hit points"
              value={c.currentHP}
              max={d.maxHP}
              onCommit={(v) => updateCharacter(c.id, { currentHP: v })}
            />
            <small> / {d.maxHP}</small>
          </span>
          <div className={`g-bar${hpLow ? ' low' : ''}`}><div style={{ width: `${hpPct}%` }} /></div>
        </div>
        <Gauge label="Armor" value={d.ac} />
        <Gauge label="Initiative" value={fmt(d.initiative)} />
        <Gauge label="Speed" value={d.speed} />
        <Gauge label="Intellect die" value={d.intellectDie ? `d${d.intellectDie}` : '—'} />
        <Gauge label="Intellect DC" value={d.intellectDC} />
      </div>

      {resting && <RestModal onClose={() => setResting(false)} />}
    </header>
  )
}

function Gauge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="gauge">
      <span className="g-label">{label}</span>
      <span className="g-val">{value}</span>
    </div>
  )
}
