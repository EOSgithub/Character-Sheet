import { useStore } from '../state/store'
import { derive, fmt } from '../rules/derive'
import { getSpecies } from '../data/species'
import { getBackground } from '../data/backgrounds'
import { getDiscipline } from '../data/savant'

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

/**
 * Persistent identity + vitals header shown atop every character page.
 * Answers "who am I and how am I doing" at a glance, in the instrument language.
 */
export default function CharacterBand({ section, action }: { section: string; action?: React.ReactNode }) {
  const { active } = useStore()
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
          <div className="crest" title={`Savant level ${c.level}`}>
            <span className="lv">LVL</span>
            <span className="n">{c.level}</span>
          </div>
        </div>
      </div>

      <div className="gauges">
        <div className="gauge hp">
          <span className="g-label">Hit points{c.tempHP > 0 ? ` · +${c.tempHP} temp` : ''}</span>
          <span className={`g-val${hpLow ? ' low' : ''}`}>{c.currentHP}<small> / {d.maxHP}</small></span>
          <div className={`g-bar${hpLow ? ' low' : ''}`}><div style={{ width: `${hpPct}%` }} /></div>
        </div>
        <Gauge label="Armor" value={d.ac} />
        <Gauge label="Initiative" value={fmt(d.initiative)} />
        <Gauge label="Speed" value={d.speed} />
        <Gauge label="Intellect die" value={d.intellectDie ? `d${d.intellectDie}` : '—'} />
        <Gauge label="Intellect DC" value={d.intellectDC} />
      </div>
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
